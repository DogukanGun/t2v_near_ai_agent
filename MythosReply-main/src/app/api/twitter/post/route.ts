import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

async function refreshAccessToken(refreshToken: string) {
  console.log('🔄 Refreshing Twitter access token...');
  const basic = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`, "utf8").toString("base64");
  const params = new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken });
  
  try {
    const res = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: { 
        Authorization: `Basic ${basic}`, 
        "Content-Type": "application/x-www-form-urlencoded" 
      },
      body: params.toString(),
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      console.log('❌ Token refresh failed:', errorData);
      throw new Error(`Refresh failed: ${res.status} - ${errorData}`);
    }
    
    const data = await res.json() as { access_token: string };
    console.log('✅ Token refreshed successfully');
    return data;
  } catch (error) {
    console.error('💥 Token refresh error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 Twitter Post API - Starting request');
  
  try {
    const jwt = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!jwt) {
      console.log('❌ No JWT token found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json().catch(() => ({ text: undefined }));
    const content = typeof text === "string" && text.trim() ? text.trim() : "Test tweet from MythosReply";
    
    console.log('📝 Tweet content:', content);

    type MyJWT = typeof jwt & { 
      accessToken?: string; 
      refreshToken?: string; 
      accessTokenExpiresAt?: number;
      twitterId?: string;
      userId?: string;
    };
    const j = jwt as MyJWT;
    
    console.log('🔑 JWT info - Twitter ID:', j.twitterId);
    console.log('🔑 JWT info - Has access token:', !!j.accessToken);
    console.log('🔑 JWT info - Has refresh token:', !!j.refreshToken);
    console.log('🔑 JWT info - Token expires at:', j.accessTokenExpiresAt ? new Date(j.accessTokenExpiresAt) : 'undefined');
    
    let accessToken = j.accessToken;

    // Check if token needs refresh
    if ((!accessToken || (j.accessTokenExpiresAt && Date.now() >= j.accessTokenExpiresAt)) && j.refreshToken) {
      console.log('🔄 Access token expired or missing, attempting refresh...');
      try {
        const refreshed = await refreshAccessToken(j.refreshToken);
        accessToken = refreshed.access_token;
        console.log('✅ Successfully refreshed access token');
      } catch (refreshError) {
        console.error('💥 Failed to refresh token:', refreshError);
        return NextResponse.json({ 
          error: "Failed to refresh access token. Please reconnect your Twitter account.",
          details: refreshError 
        }, { status: 401 });
      }
    }
    
    if (!accessToken) {
      console.log('❌ No access token available');
      return NextResponse.json({ error: "Missing access token. Please reconnect your Twitter account." }, { status: 401 });
    }

    console.log('🚀 Posting tweet to Twitter API...');
    const resp = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ text: content }),
    });
    
    console.log('📨 Twitter API response status:', resp.status);
    
    const data: unknown = await resp.json().catch(() => ({} as unknown));
    
    if (!resp.ok) {
      console.log('❌ Twitter API error:', data);
      return NextResponse.json({ 
        error: "Twitter API error", 
        details: data,
        status: resp.status
      }, { status: resp.status });
    }
    
    console.log('✅ Tweet posted successfully:', data);
    
    // Extract tweet ID for URL generation
    const tweetData = data as any;
    const tweetId = tweetData?.data?.id;
    const username = j.twitterId; // This is actually the username, not numeric ID
    
    let tweetUrl = '';
    if (tweetId && username) {
      tweetUrl = `https://twitter.com/${username}/status/${tweetId}`;
    }
    
    return NextResponse.json({ 
      success: true, 
      data: tweetData,
      tweetId,
      tweetUrl,
      message: "Tweet posted successfully!",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Twitter Post API - Unexpected error:', error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
