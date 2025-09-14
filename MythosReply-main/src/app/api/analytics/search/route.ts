import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TwitterIOService } from "@/lib/services/twitterIO";

export async function POST(request: NextRequest) {
  console.log('🔍 Analytics Search API - Starting request');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.twitterId) {
      console.log('❌ Analytics Search API - Not authenticated');
      return NextResponse.json({ error: "Not authenticated with Twitter" }, { status: 401 });
    }

    const { query, queryType, cursor } = await request.json();
    console.log('📍 Analytics Search API - Search params:', { query, queryType, cursor });
    
    if (!query || typeof query !== "string") {
      console.log('❌ Analytics Search API - Invalid query');
      return NextResponse.json({ error: "Valid search query is required" }, { status: 400 });
    }

    console.log('🚀 Analytics Search API - Making TwitterIO search request');
    
    const results = await TwitterIOService.advancedSearch({
      query,
      queryType: queryType || 'Latest',
      cursor: cursor || ''
    });

    // Analyze the results
    const analysis = TwitterIOService.analyzeSearchResults(results);

    console.log('✅ Analytics Search API - Search successful');
    console.log(`📊 Found ${results.tweets.length} tweets, has_next_page: ${results.has_next_page}`);

    return NextResponse.json({
      success: true,
      data: results,
      analysis,
      searchQuery: query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Analytics Search API - Error:', error);
    
    // Check if it's a TwitterIO API error
    if (error instanceof Error && error.message.includes('TwitterIO API error')) {
      return NextResponse.json({ 
        error: error.message,
        type: 'twitterio_error'
      }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
