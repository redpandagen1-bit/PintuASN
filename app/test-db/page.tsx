import { createClient } from '@/lib/supabase/server'

export default async function TestDBPage() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      {error ? (
        <div className="text-red-600">
          <p>Error: {error.message}</p>
        </div>
      ) : (
        <div className="text-green-600">
          <p>✅ Connected to Supabase!</p>
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}