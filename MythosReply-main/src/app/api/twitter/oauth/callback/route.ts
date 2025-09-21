import { NextRequest, NextResponse } from 'next/server'
import { TwitterOAuthService } from '@/lib/services/twitterOAuth'
import { prisma } from '@/lib/database'

/**
 * OAuth callback handler for Twitter authentication
 * This endpoint is called by Twitter after user authorization
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const oauthToken = searchParams.get('oauth_token')
    const oauthVerifier = searchParams.get('oauth_verifier')
    const state = searchParams.get('state')
    const denied = searchParams.get('denied')

    // Handle user denial
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
      })
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
      })
    }

    // Complete OAuth flow
    try {
      const { accessToken, accessSecret, userId, screenName, twitterUserId } = 
        await TwitterOAuthService.completeOAuth(state || '', oauthToken, oauthVerifier)

      // Store the Twitter account
      const account = await prisma.twitterAccount.upsert({
        where: {
          userId_twitterUsername: {
            userId,
            twitterUsername: screenName
          }
        },
        update: {
          accessToken,
          accessTokenSecret: accessSecret,
          isActive: true
        },
        create: {
          userId,
          twitterUsername: screenName,
          accessToken,
          accessTokenSecret: accessSecret,
          isActive: true
        }
      })

      // Send success message to parent window
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
              // Send success message to parent window
              window.opener?.postMessage({ 
                success: true,
                account: {
                  id: '${account.id}',
                  twitterUsername: '${screenName}',
                  isActive: true
                }
              }, '*');
              
              // Auto-close after 3 seconds
              setTimeout(() => {
                window.close();
              }, 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })

    } catch (oauthError: any) {
      console.error('OAuth completion error:', oauthError)
      
      return new Response(`
        <html>
          <body>
            <script>
              window.opener?.postMessage({ 
                error: '${oauthError.message || 'OAuth flow failed'}' 
              }, '*');
              window.close();
            </script>
            <p>OAuth failed: ${oauthError.message}. You can close this window.</p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

  } catch (error: any) {
    console.error('OAuth callback error:', error)
    
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
    })
  }
}
