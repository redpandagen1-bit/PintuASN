import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export default async function TestAdminDebug() {
  const user = await currentUser();
  const supabase = await createClient();

  // Check Clerk user
  const clerkRole = user?.publicMetadata?.role;

  // Check Supabase profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded">
          <h2 className="font-bold">Clerk User Info:</h2>
          <p>User ID: {user?.id}</p>
          <p>Email: {user?.emailAddresses[0]?.emailAddress}</p>
          <p>Role (metadata): {clerkRole || 'No role set'}</p>
        </div>

        <div className="p-4 bg-green-50 rounded">
          <h2 className="font-bold">Supabase Profile:</h2>
          {error ? (
            <p className="text-red-600">Error: {error.message}</p>
          ) : (
            <>
              <p>User ID: {profile?.user_id}</p>
              <p>Email: {profile?.email}</p>
              <p>Role: {profile?.role || 'No role'}</p>
              <p>Full Name: {profile?.full_name}</p>
            </>
          )}
        </div>

        <div className="p-4 bg-yellow-50 rounded">
          <h2 className="font-bold">Match Check:</h2>
          <p>
            Clerk Role: <strong>{clerkRole || 'none'}</strong> | 
            Supabase Role: <strong>{profile?.role || 'none'}</strong>
          </p>
          {clerkRole === 'admin' && profile?.role === 'admin' ? (
            <p className="text-green-600 font-bold">✅ Roles match!</p>
          ) : (
            <p className="text-red-600 font-bold">❌ Roles don't match!</p>
          )}
        </div>
      </div>
    </div>
  );
}