import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { KeywordGeneratorService } from "@/lib/services/keywordGenerator";
import { TwitterIOService } from "@/lib/services/twitterIO";

export async function POST(request: NextRequest) {
  console.log('🎯 Targeting API - Starting request');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.twitterId) {
      console.log('❌ Targeting API - Not authenticated');
      return NextResponse.json({ error: "Not authenticated with Twitter" }, { status: 401 });
    }

    const { prompt, generateSearches } = await request.json();
    console.log('📍 Targeting API - User prompt:', prompt);
    
    if (!prompt || typeof prompt !== "string") {
      console.log('❌ Targeting API - Invalid prompt');
      return NextResponse.json({ error: "Valid targeting prompt is required" }, { status: 400 });
    }

    console.log('🚀 Targeting API - Generating targeting strategy');
    
    // Generate targeting strategy using AI
    const strategy = await KeywordGeneratorService.generateTargetingStrategy(prompt);
    
    let searchResults = [];
    
    // Optionally run the generated searches
    if (generateSearches && strategy.searchQueries.length > 0) {
      console.log('🔍 Targeting API - Running generated searches');
      
      try {
        // Run the first search query as a sample
        const sampleQuery = strategy.searchQueries[0];
        const builtQuery = TwitterIOService.buildSearchQuery({
          keywords: strategy.keywords,
          excludeKeywords: strategy.excludeKeywords,
          hashtags: strategy.hashtags,
          minLikes: strategy.engagementFilters.minLikes,
          minRetweets: strategy.engagementFilters.minRetweets,
          minReplies: strategy.engagementFilters.minReplies
        });
        
        const searchResponse = await TwitterIOService.advancedSearch({
          query: builtQuery,
          queryType: 'Latest'
        });
        
        searchResults = searchResponse.tweets.slice(0, 10); // Limit to 10 sample tweets
        console.log(`✅ Targeting API - Sample search found ${searchResults.length} tweets`);
        
      } catch (searchError) {
        console.log('⚠️ Targeting API - Search failed but continuing:', searchError);
        // Continue without search results if search fails
      }
    }

    console.log('✅ Targeting API - Strategy generation successful');

    return NextResponse.json({
      success: true,
      strategy,
      sampleTweets: searchResults,
      generatedQueries: strategy.searchQueries,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Targeting API - Error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
