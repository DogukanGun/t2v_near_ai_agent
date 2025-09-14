import { NextRequest, NextResponse } from 'next/server'
import { TwitterService } from '@/lib/services/twitter'
import { TwitterAnalysisService } from '@/lib/services/twitterAnalysis'

/**
 * @swagger
 * /api/twitter/monitoring:
 *   post:
 *     summary: Monitor Twitter profiles (app-only mode)
 *     tags: [Twitter Monitoring]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usernames
 *             properties:
 *               usernames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Twitter usernames to monitor (without @)
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Keywords to monitor
 *               maxTweets:
 *                 type: number
 *                 default: 10
 *                 description: Maximum tweets to fetch per username
 *               includeAnalysis:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to include sentiment analysis
 *     responses:
 *       200:
 *         description: Monitoring data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tweets:
 *                   type: array
 *                   items:
 *                     type: object
 *                 analysis:
 *                   type: object
 *                 profileStats:
 *                   type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      usernames = [],
      keywords = [],
      maxTweets = 10,
      includeAnalysis = true
    } = body

    if (!usernames.length && !keywords.length) {
      return NextResponse.json(
        { error: 'At least one username or keyword is required' },
        { status: 400 }
      )
    }

    // Use app-only authentication for read-only monitoring
    const twitterService = TwitterService.createAppOnlyService()
    const analysisService = new TwitterAnalysisService()

    const results = {
      tweets: [] as any[],
      analysis: {
        totalTweets: 0,
        avgSentiment: 0,
        topTopics: [] as string[],
        profileInsights: {} as any
      },
      profileStats: {} as any
    }

    // Monitor specific usernames
    if (usernames.length > 0) {
      for (const username of usernames) {
        try {
          // Get user profile
          const profileResponse = await twitterService.getUserProfile(username)
          if (profileResponse.data) {
            results.profileStats[username] = profileResponse.data
          }

          // Get user tweets
          const tweetsResponse = await twitterService.getUserTweets(username, maxTweets, true)
          if (tweetsResponse.data) {
            // Add source information
            const tweetsWithSource = tweetsResponse.data.map((tweet: any) => ({
              ...tweet,
              source: 'username',
              sourceValue: username
            }))
            
            results.tweets.push(...tweetsWithSource)

            // Analyze tweets if requested
            if (includeAnalysis) {
              for (const tweet of tweetsResponse.data) {
                await analysisService.storeTweet(tweet, undefined, [username])
              }

              // Generate profile insights
              const insights = await analysisService.analyzeProfile(
                username, 
                tweetsResponse.data, 
                profileResponse.data
              )
              results.analysis.profileInsights[username] = insights
            }
          }
        } catch (error) {
          console.error(`Failed to monitor ${username}:`, error)
          // Continue with other usernames
        }
      }
    }

    // Monitor keywords
    if (keywords.length > 0) {
      try {
        const searchQuery = keywords.join(' OR ')
        const searchResponse = await twitterService.searchTweets({
          query: searchQuery,
          max_results: maxTweets * 2, // Get more for keyword searches
          tweet_fields: ['created_at', 'author_id', 'public_metrics', 'context_annotations', 'lang'],
          expansions: ['author_id'],
          user_fields: ['username', 'public_metrics', 'verified']
        })

        if (searchResponse.data) {
          const tweetsWithSource = searchResponse.data.map((tweet: any) => ({
            ...tweet,
            source: 'keywords',
            sourceValue: keywords
          }))
          
          results.tweets.push(...tweetsWithSource)

          // Analyze keyword tweets
          if (includeAnalysis) {
            for (const tweet of searchResponse.data) {
              await analysisService.storeTweet(tweet, undefined, keywords)
            }
          }
        }
      } catch (error) {
        console.error('Failed to search keywords:', error)
      }
    }

    // Calculate overall analysis
    if (includeAnalysis && results.tweets.length > 0) {
      results.analysis.totalTweets = results.tweets.length

      // Calculate average sentiment
      let totalSentiment = 0
      let sentimentCount = 0
      const topicsCount: { [topic: string]: number } = {}

      for (const tweet of results.tweets) {
        const sentiment = await analysisService.analyzeSentiment(tweet.text)
        totalSentiment += sentiment.score
        sentimentCount++

        // Extract topics
        const topics = analysisService.extractTopics(tweet)
        topics.topics.forEach(topic => {
          topicsCount[topic] = (topicsCount[topic] || 0) + 1
        })
      }

      results.analysis.avgSentiment = sentimentCount > 0 ? totalSentiment / sentimentCount : 0
      results.analysis.topTopics = Object.entries(topicsCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([topic]) => topic)
    }

    return NextResponse.json(results)

  } catch (error: any) {
    console.error('Monitoring error:', error)
    return NextResponse.json(
      { error: 'Failed to monitor Twitter data' },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/twitter/monitoring:
 *   get:
 *     summary: Get monitoring capabilities and rate limits
 *     tags: [Twitter Monitoring]
 *     responses:
 *       200:
 *         description: Monitoring capabilities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 capabilities:
 *                   type: object
 *                 rateLimits:
 *                   type: object
 *                 features:
 *                   type: array
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      capabilities: {
        readOnlyMode: true,
        maxUsernamesPerRequest: 10,
        maxKeywordsPerRequest: 5,
        maxTweetsPerUsername: 50,
        supportsAnalysis: true,
        supportsProfileData: true
      },
      rateLimits: {
        userTimeline: '300 requests per 15 minutes',
        searchTweets: '300 requests per 15 minutes',
        userLookup: '300 requests per 15 minutes'
      },
      features: [
        'Profile monitoring without authentication',
        'Keyword-based tweet search',
        'Sentiment analysis',
        'Topic extraction',
        'Profile insights',
        'Real-time monitoring',
        'Bulk username monitoring'
      ],
      limitations: [
        'Cannot post tweets',
        'Cannot reply to tweets', 
        'Public data only',
        'Rate limited by Twitter API'
      ]
    })
  } catch (error: any) {
    console.error('Monitoring GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
