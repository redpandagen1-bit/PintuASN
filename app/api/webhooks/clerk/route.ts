import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const WEBHOOK_SECRET   = process.env.CLERK_WEBHOOK_SECRET;
  const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[webhook] Missing env variables');
    return new Response('Server misconfiguration', { status: 500 });
  }

  const headerPayload  = await headers();
  const svix_id        = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('[webhook] Missing svix headers');
    return new Response('Missing svix headers', { status: 400 });
  }

  const body = await req.text();
  const wh   = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id':        svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('[webhook] Verification failed:', err instanceof Error ? err.message : 'unknown');
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ============================================================
  // user.created
  // ============================================================
  if (evt.type === 'user.created') {
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      phone_numbers,
      public_metadata,
    } = evt.data;

    // Clerk kadang kirim test event tanpa email — skip dengan aman
    if (!email_addresses || email_addresses.length === 0) {
      console.warn(`[webhook] user.created [${id}]: no email, skipping (test event?)`);
      return new Response(
        JSON.stringify({ skipped: true, reason: 'no_email' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const email = email_addresses[0].email_address;
    const role  = (public_metadata as { role?: string })?.role ?? 'user';
    const now   = new Date().toISOString();

    const profileData = {
      user_id:              id,
      email,
      full_name:            `${first_name ?? ''} ${last_name ?? ''}`.trim() || null,
      phone:                phone_numbers?.[0]?.phone_number ?? null,
      role,
      subscription_tier:    'free',
      onboarding_completed: false, // selalu false untuk user baru / signup ulang
      created_at:           now,
      updated_at:           now,
    };

    try {
      // Cek apakah email sudah ada (akun lama yang pernah delete lalu signup ulang)
      const { data: existingByEmail, error: checkError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        console.error(`[webhook] user.created [${id}]: email check failed`, checkError.message);
        return new Response(
          JSON.stringify({ error: checkError.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (existingByEmail) {
        // Profile lama dengan email yang sama → migrate ke user_id baru
        // Update SEMUA field + reset onboarding agar user wajib isi ulang
        const { error: migrateError } = await supabase
          .from('profiles')
          .update({
            user_id:              id,
            full_name:            profileData.full_name,
            phone:                profileData.phone,
            role,
            subscription_tier:    'free',
            onboarding_completed: false, // ← wajib reset, data lama tidak valid untuk user baru
            updated_at:           now,
          })
          .eq('email', email);

        if (migrateError) {
          console.error(`[webhook] user.created [${id}]: migrate failed`, migrateError.code, migrateError.message);
          return new Response(
            JSON.stringify({ error: migrateError.message, code: migrateError.code }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[webhook] user.created [${id}]: migrated existing profile (email: ${email})`);
      } else {
        // User baru → upsert dengan onConflict user_id untuk idempotency retry
        const { error: insertError } = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'user_id' });

        if (insertError) {
          console.error(`[webhook] user.created [${id}]: upsert failed`, insertError.code, insertError.message);
          return new Response(
            JSON.stringify({ error: insertError.message, code: insertError.code }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[webhook] user.created [${id}]: inserted new profile`);
      }

      return new Response(
        JSON.stringify({ success: true, user_id: id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error(`[webhook] user.created [${id}]: unexpected error`, err);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ============================================================
  // user.updated
  // ============================================================
  if (evt.type === 'user.updated') {
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      phone_numbers,
      public_metadata,
    } = evt.data;

    const role = (public_metadata as { role?: string })?.role ?? 'user';
    const now  = new Date().toISOString();

    // Selalu update semua field, termasuk null
    // Ini penting agar kalau user hapus nama/phone di Clerk, Supabase ikut update
    const updateData = {
      email:      email_addresses?.[0]?.email_address ?? null,
      full_name:  `${first_name ?? ''} ${last_name ?? ''}`.trim() || null,
      phone:      phone_numbers?.[0]?.phone_number ?? null,
      role,
      updated_at: now,
    };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', id)
        .select();

      if (error) {
        console.error(`[webhook] user.updated [${id}]: failed`, error.code, error.message);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Profile tidak ditemukan — bisa terjadi kalau webhook user.created belum sempat diproses
      if (!data || data.length === 0) {
        console.warn(`[webhook] user.updated [${id}]: profile not found in Supabase, skipping`);
        return new Response(
          JSON.stringify({ skipped: true, reason: 'profile_not_found', user_id: id }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[webhook] user.updated [${id}]: updated successfully`);
      return new Response(
        JSON.stringify({ success: true, user_id: id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error(`[webhook] user.updated [${id}]: unexpected error`, err);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ============================================================
  // user.deleted
  // ============================================================
  if (evt.type === 'user.deleted') {
    const { id, deleted } = evt.data;

    // Untuk user.deleted, Clerk mengirim id bertipe string | null | undefined
    // Kalau id undefined → .eq('user_id', undefined) → silent fail tanpa error
    // Guard ini wajib ada
    if (!id || !deleted) {
      console.warn(`[webhook] user.deleted: missing id or deleted=false, skipping`);
      return new Response(
        JSON.stringify({ skipped: true, reason: 'missing_id_or_not_deleted' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', id)
        .select();

      if (error) {
        console.error(`[webhook] user.deleted [${id}]: failed`, error.code, error.message);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const deletedCount = data?.length ?? 0;
      if (deletedCount === 0) {
        // Bisa terjadi kalau profile memang sudah dihapus sebelumnya (idempotent)
        console.warn(`[webhook] user.deleted [${id}]: no row found, already deleted or never existed`);
      } else {
        console.log(`[webhook] user.deleted [${id}]: removed ${deletedCount} row(s)`);
      }

      return new Response(
        JSON.stringify({ success: true, deleted_rows: deletedCount }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error(`[webhook] user.deleted [${id}]: unexpected error`, err);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Event lain (user.updated dari Clerk kadang fire untuk hal lain) — aman diabaikan
  return new Response(
    JSON.stringify({ received: true, type: evt.type }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function GET() {
  return new Response(
    JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}