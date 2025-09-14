export default function DebugEnvPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Environment Variables Debug</h1>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h2 className="font-semibold">Required Environment Variables:</h2>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>TWITTER_CLIENT_ID</li>
                <li>TWITTER_CLIENT_SECRET</li>
                <li>NEXTAUTH_SECRET</li>
                <li>NEXTAUTH_URL</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h2 className="font-semibold">Current Status:</h2>
              <div className="space-y-1 text-sm">
                <div>TWITTER_CLIENT_ID: {process.env.TWITTER_CLIENT_ID ? '✅ SET' : '❌ MISSING'}</div>
                <div>TWITTER_CLIENT_SECRET: {process.env.TWITTER_CLIENT_SECRET ? '✅ SET' : '❌ MISSING'}</div>
                <div>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✅ SET' : '❌ MISSING'}</div>
                <div>NEXTAUTH_URL: {process.env.NEXTAUTH_URL ? '✅ SET' : '❌ MISSING'}</div>
              </div>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h2 className="font-semibold">How to Fix:</h2>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in your project root</li>
                <li>Add the required environment variables (check env.example for format)</li>
                <li>Restart your development server</li>
                <li>Make sure no <code className="bg-gray-100 px-1 rounded">.env</code> file is conflicting</li>
              </ol>
            </div>
            
            <div className="border-l-4 border-red-500 pl-4">
              <h2 className="font-semibold">Common Issues:</h2>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Environment variables in .env instead of .env.local</li>
                <li>Typos in variable names</li>
                <li>Missing quotes around values with special characters</li>
                <li>Server not restarted after adding variables</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Check the server console for detailed environment variable logs when this page loads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
