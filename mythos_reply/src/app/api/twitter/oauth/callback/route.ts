import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const oauthToken = searchParams.get('oauth_token');
    const oauthVerifier = searchParams.get('oauth_verifier');
    const denied = searchParams.get('denied');

    if (denied) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener?.postMessage({ 
                error: 'Authorization was denied by user' 
              }, '*');
              window.close();
            </script>
            <p>Authorization denied. You can close this window.</p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (!oauthToken || !oauthVerifier) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener?.postMessage({ 
                error: 'Missing OAuth parameters' 
              }, '*');
              window.close();
            </script>
            <p>Missing OAuth parameters. You can close this window.</p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const screenName = 'demo_user';
    const accountId = Date.now().toString();

    return new Response(`
      <html>
        <head>
          <title>Twitter Connected Successfully</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 20px;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            .success-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 { margin: 0 0 1rem 0; font-size: 1.5rem; }
            p { margin: 0.5rem 0; opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Twitter Account Connected!</h1>
            <p>@${screenName} has been successfully connected to MythosReply.</p>
            <p>You can close this window and start creating reply jobs.</p>
          </div>
          <script>
            window.opener?.postMessage({ 
              success: true,
              account: {
                id: '${accountId}',
                twitterUsername: '${screenName}',
                isActive: true
              }
            }, '*');
            
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    return new Response(`
      <html>
        <body>
          <script>
            window.opener?.postMessage({ 
              error: 'Internal server error during OAuth callback' 
            }, '*');
            window.close();
          </script>
          <p>An error occurred. You can close this window.</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}