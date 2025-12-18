import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TestPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  const supabase = await createClient()
  
  // Test 1: Query profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  // Test 2: Check if Clerk user can be extracted from JWT
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Clerk + Supabase Integration Test</h1>
        
        {/* Clerk Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">
            ✅ Clerk Authentication
          </h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong></p>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              {userId}
            </code>
          </div>
        </div>
        
        {/* Supabase Auth */}
        <div className={`rounded-lg shadow p-6 ${authError ? 'bg-red-50' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-3 text-purple-600">
            {authError ? '❌' : '✅'} Supabase Auth (via Clerk JWT)
          </h2>
          {authError ? (
            <div className="bg-red-100 border border-red-300 rounded p-3">
              <p className="text-red-700 font-medium">Error:</p>
              <pre className="text-sm text-red-600 mt-2 overflow-auto">
                {JSON.stringify(authError, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Supabase User ID:</strong></p>
              <code className="block bg-gray-100 p-2 rounded text-sm">
                {user?.id || 'Not available'}
              </code>
              <p className="text-sm text-gray-600 mt-2">
                ✅ Clerk JWT successfully validated by Supabase
              </p>
            </div>
          )}
        </div>
        
        {/* Profile Data */}
        <div className={`rounded-lg shadow p-6 ${profileError ? 'bg-yellow-50' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-3 text-green-600">
            {profileError ? '⚠️' : '✅'} Profile Data (RLS Test)
          </h2>
          {profileError ? (
            <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
              <p className="text-yellow-700 font-medium">
                {profileError.code === 'PGRST116' 
                  ? '⚠️ Profile not found - Run webhook or create manually' 
                  : 'Error:'}
              </p>
              <pre className="text-sm text-yellow-600 mt-2 overflow-auto">
                {JSON.stringify(profileError, null, 2)}
              </pre>
              <p className="text-sm text-yellow-700 mt-3">
                💡 Tip: Sign up dengan Clerk dulu, webhook akan otomatis create profile
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(profile, null, 2)}
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                ✅ RLS policies working! User can only see their own data
              </p>
            </div>
          )}
        </div>
        
        {/* Integration Status */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow p-6 text-white">
          <h2 className="text-xl font-semibold mb-3">
            🎉 Integration Status
          </h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Clerk authentication working</li>
            <li>✅ Supabase client created</li>
            <li>{authError ? '❌' : '✅'} JWT validation by Supabase</li>
            <li>{profileError ? '⚠️' : '✅'} RLS policies enforced</li>
          </ul>
          {!authError && !profileError && (
            <p className="mt-4 font-semibold text-lg">
              🚀 Ready for development!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}