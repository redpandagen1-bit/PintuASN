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
