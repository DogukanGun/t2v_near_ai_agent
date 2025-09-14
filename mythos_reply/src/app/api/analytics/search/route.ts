import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query, queryType } = await request.json();
    
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Valid search query is required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        tweets: [],
        has_next_page: false
      },
      analysis: {
        totalTweets: 0,
        avgEngagement: 0,
        topHashtags: [],
        sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }
      },
      searchQuery: query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}