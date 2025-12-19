import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
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
    console.error('Error verifying webhook:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = await createClient();

  // ✅ Handle user.created
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    // ✅ Null check untuk email
    if (!email_addresses || email_addresses.length === 0) {
      console.error('No email address provided');
      return new Response('No email address', { status: 400 });
    }

    // ✅ Upsert untuk handle duplicate (jika webhook retry)
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: id,
        email: email_addresses[0].email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        role: 'user',
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error creating profile:', error);
      return new Response('Database error', { status: 500 });
    }

    return new Response('User created', { status: 200 });
  }

  // ✅ Handle user.updated
  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const { error } = await supabase
      .from('profiles')
      .update({
        email: email_addresses?.[0]?.email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', id);

    if (error) {
      console.error('Error updating profile:', error);
      return new Response('Database error', { status: 500 });
    }

    return new Response('User updated', { status: 200 });
  }

  // ✅ Handle user.deleted
  if (evt.type === 'user.deleted') {
    const { id } = evt.data;

    // Soft delete (recommended) atau hard delete
    const { error } = await supabase
      .from('profiles')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('user_id', id);

    if (error) {
      console.error('Error deleting profile:', error);
      return new Response('Database error', { status: 500 });
    }

    return new Response('User deleted', { status: 200 });
  }

  return new Response('Webhook processed', { status: 200 });
}