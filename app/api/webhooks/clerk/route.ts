import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  console.log('🚀 Webhook received at:', new Date().toISOString());
  
  // ✅ Check environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('🔐 Environment check:', {
    hasWebhookSecret: !!WEBHOOK_SECRET,
    hasSupabaseUrl: !!SUPABASE_URL,
    hasServiceRoleKey: !!SUPABASE_SERVICE_KEY,
  });

  if (!WEBHOOK_SECRET) {
    console.error('❌ Missing CLERK_WEBHOOK_SECRET');
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials');
    throw new Error('Missing Supabase credentials');
  }

  // ✅ Verify webhook signature
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing svix headers');
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  console.log('📦 Payload type:', payload.type);
  
  const wh = new Webhook(WEBHOOK_SECRET);
  
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    console.log('✅ Webhook signature verified');
  } catch (err) {
    console.error('❌ Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // ✅ Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // ✅ Handle user.created
  if (evt.type === 'user.created') {
    console.log('👤 Processing user.created event');
    console.log('🔍 RAW EVENT DATA:', JSON.stringify(evt.data, null, 2));
    
    const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = evt.data;
    
    // ✅ EXTRACT ROLE FROM PUBLIC_METADATA
    const role = (public_metadata as { role?: string })?.role || 'user';
    
    console.log('📝 Extracted fields:', {
      id,
      email: email_addresses?.[0]?.email_address,
      role: role, // ← LOG ROLE
      first_name,
      last_name,
    });

    // Validate email
    if (!email_addresses || email_addresses.length === 0) {
      console.error('❌ No email address provided');
      return new Response('No email address', { status: 400 });
    }

    const profileData = {
      user_id: id,
      email: email_addresses[0].email_address,
      full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
      phone: phone_numbers?.[0]?.phone_number || null,
      role: role, // ✅ USE ROLE FROM METADATA
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('💾 Data to upsert:', profileData);

    try {
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
        })
        .select();

      if (insertError) {
        console.error('❌ Supabase upsert failed:', insertError);
        return new Response(
          JSON.stringify({ 
            error: insertError.message,
            code: insertError.code,
          }), 
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Profile created successfully with role:', role);
      console.log('✅ Inserted data:', insertData);
      
      return new Response(
        JSON.stringify({ success: true, user_id: id }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error: unknown) {
      console.error('❌ Unexpected error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ✅ Handle user.updated
  if (evt.type === 'user.updated') {
    console.log('🔄 Processing user.updated event');
    
    const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = evt.data;

    // ✅ EXTRACT ROLE FROM PUBLIC_METADATA
    const role = (public_metadata as { role?: string })?.role || 'user';

    const updateData: {
      updated_at: string;
      email?: string;
      full_name?: string;
      phone?: string | null;
      role: string; // ✅ ALWAYS UPDATE ROLE
    } = {
      updated_at: new Date().toISOString(),
      role: role, // ✅ SYNC ROLE FROM METADATA
    };

    if (email_addresses?.[0]?.email_address) {
      updateData.email = email_addresses[0].email_address;
    }

    const fullName = `${first_name || ''} ${last_name || ''}`.trim();
    if (fullName) {
      updateData.full_name = fullName;
    }

    if (phone_numbers?.[0]?.phone_number) {
      updateData.phone = phone_numbers[0].phone_number;
    }

    console.log('💾 Update data:', updateData);

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', id)
      .select();

    if (error) {
      console.error('❌ Error updating profile:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Profile updated with role:', role);
    return new Response(
      JSON.stringify({ success: true, data }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ✅ Handle user.deleted
  if (evt.type === 'user.deleted') {
    console.log('🗑️ Processing user.deleted event');
    
    const { id } = evt.data;

    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', id)
      .select();

    if (error) {
      console.error('❌ Error deleting profile:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Profile deleted:', id);
    return new Response(
      JSON.stringify({ success: true, data }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Other events
  console.log('ℹ️ Unhandled event type:', evt.type);
  return new Response(
    JSON.stringify({ message: 'Webhook received', type: evt.type }), 
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function GET() {
  return new Response(
    JSON.stringify({ 
      message: 'Webhook endpoint is working',
      timestamp: new Date().toISOString()
    }), 
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}