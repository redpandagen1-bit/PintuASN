import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase credentials');
    throw new Error('Missing Supabase credentials');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err instanceof Error ? err.message : 'unknown');
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ─────────────────────────────────────────────────────────────
  // SESSION CREATED — Single Active Session enforcement
  //
  // Setiap kali user login (dari device/browser manapun), Clerk
  // mengirim event ini dengan session ID baru. Kita simpan ID ini
  // sebagai "sesi yang sah". Sesi lama otomatis tidak valid karena
  // ID-nya tidak cocok lagi.
  //
  // Safety note: jika update gagal (misal user baru belum punya
  // profile), kita log error tapi tetap return 200 agar Clerk
  // tidak retry terus-menerus. Webhook Clerk akan retry pada 4xx/5xx.
  // ─────────────────────────────────────────────────────────────
  if (evt.type === 'session.created') {
    const sessionData = evt.data as { id: string; user_id: string };
    const { id: sessionId, user_id: userId } = sessionData;

    if (!sessionId || !userId) {
      console.error('session.created: missing sessionId or userId', { sessionId, userId });
      return new Response(
        JSON.stringify({ error: 'Missing session data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        active_session_id: sessionId,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      // Jika profile belum ada (race condition user.created vs session.created),
      // ini bukan error fatal — user.created webhook akan membuat profile-nya.
      // Log saja dan return 200 agar tidak di-retry Clerk.
      console.error('session.created: failed to update active_session_id', {
        userId,
        sessionId,
        errorCode: error.code,
        errorMessage: error.message,
      });
      // Return 200 intentionally: profile mungkin belum ada karena
      // user.created webhook belum selesai. Tidak perlu retry.
      return new Response(
        JSON.stringify({ success: false, reason: 'profile_not_found_or_update_failed' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('session.created: active_session_id updated', { userId, sessionId });
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ─────────────────────────────────────────────────────────────
  // SESSION ENDED — Bersihkan active_session_id saat user sign out
  //
  // Ini penting agar jika user sign out dari device A, lalu login
  // lagi dari device A, tidak ada false conflict karena ID lama
  // masih tersimpan di DB.
  // ─────────────────────────────────────────────────────────────
  if (evt.type === 'session.ended' || evt.type === 'session.revoked') {
    const sessionData = evt.data as { id: string; user_id: string };
    const { id: sessionId, user_id: userId } = sessionData;

    if (!sessionId || !userId) {
      return new Response(
        JSON.stringify({ success: true, reason: 'missing_data_skipped' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hanya hapus jika session yang ended adalah yang sedang aktif.
    // Jangan hapus jika sudah digantikan session lain (user login di device baru
    // sebelum logout dari device lama — active_session_id sudah berubah).
    const { error } = await supabase
      .from('profiles')
      .update({
        active_session_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('active_session_id', sessionId); // hanya hapus jika masih sama

    if (error) {
      console.error('session.ended: failed to clear active_session_id', {
        userId,
        sessionId,
        errorCode: error.code,
      });
      // Return 200 tetap, ini non-fatal
      return new Response(
        JSON.stringify({ success: false, reason: 'update_failed' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('session.ended: active_session_id cleared', { userId, sessionId });
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ─────────────────────────────────────────────────────────────
  // USER CREATED
  // ─────────────────────────────────────────────────────────────
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = evt.data;
    const role = (public_metadata as { role?: string })?.role || 'user';

    if (!email_addresses || email_addresses.length === 0) {
      console.error('Clerk user.created: no email address');
      return new Response('No email address', { status: 400 });
    }

    const profileData = {
      user_id: id,
      email: email_addresses[0].email_address,
      full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
      phone: phone_numbers?.[0]?.phone_number || null,
      role,
      subscription_tier: 'free',
      active_session_id: null, // akan diisi oleh session.created webhook
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select();

      if (insertError) {
        console.error('Clerk user.created: upsert failed', insertError.code);
        return new Response(
          JSON.stringify({ error: insertError.message, code: insertError.code }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, user_id: id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Clerk user.created: unexpected error');
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // USER UPDATED
  // ─────────────────────────────────────────────────────────────
  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = evt.data;
    const role = (public_metadata as { role?: string })?.role || 'user';

    const updateData: {
      updated_at: string;
      email?: string;
      full_name?: string;
      phone?: string | null;
      role: string;
    } = {
      updated_at: new Date().toISOString(),
      role,
    };

    if (email_addresses?.[0]?.email_address) {
      updateData.email = email_addresses[0].email_address;
    }
    const fullName = `${first_name || ''} ${last_name || ''}`.trim();
    if (fullName) updateData.full_name = fullName;
    if (phone_numbers?.[0]?.phone_number) updateData.phone = phone_numbers[0].phone_number;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', id)
      .select();

    if (error) {
      console.error('Clerk user.updated: failed', error.code);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ─────────────────────────────────────────────────────────────
  // USER DELETED
  // ─────────────────────────────────────────────────────────────
  if (evt.type === 'user.deleted') {
    const { id } = evt.data;

    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', id)
      .select();

    if (error) {
      console.error('Clerk user.deleted: failed', error.code);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ message: 'Webhook received', type: evt.type }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function GET() {
  return new Response(
    JSON.stringify({ message: 'Webhook endpoint is working', timestamp: new Date().toISOString() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}