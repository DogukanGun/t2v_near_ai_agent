import { prisma } from '@/lib/database'
import { EnhancedTweet, TweetMetrics } from './twitter'

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number // -1 to 1
  confidence: number // 0 to 1
}

export interface TopicExtractionResult {
  topics: string[]
  confidence: number
}

export interface EngagementAnalysis {
  engagementRate: number
  viralityScore: number
  reachPotential: number
  trending: boolean
}

export interface ProfileInsights {
  averageEngagement: number
  postingFrequency: number
  mostActiveHours: number[]
  topTopics: string[]
  sentimentTrend: SentimentResult[]
  audienceGrowth: number
}

export class TwitterAnalysisService {
  
  /**
   * Analyze sentiment of a tweet using simple keyword-based analysis
   * In production, you'd use a proper ML model or API like OpenAI
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const positiveWords = [
      'amazing', 'awesome', 'great', 'excellent', 'fantastic', 'wonderful', 'brilliant',
      'love', 'like', 'enjoy', 'happy', 'excited', 'thrilled', 'delighted',
      'success', 'win', 'winner', 'achievement', 'breakthrough', 'innovation',
      'bullish', 'moon', 'pump', 'gains', 'profit', 'diamond', 'hodl'
    ]
    
    const negativeWords = [
      'terrible', 'awful', 'bad', 'horrible', 'disgusting', 'hate', 'dislike',
      'sad', 'angry', 'frustrated', 'disappointed', 'worried', 'concerned',
      'failure', 'lose', 'loss', 'crash', 'dump', 'scam', 'rug', 'bear',
      'bearish', 'dump', 'crash', 'panic', 'sell', 'fear'
    ]

    const words = text.toLowerCase().split(/\s+/)
    let positiveScore = 0
    let negativeScore = 0

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) {
        positiveScore++
      }
      if (negativeWords.some(nw => word.includes(nw))) {
        negativeScore++
      }
    })

    const totalSentimentWords = positiveScore + negativeScore
    
    if (totalSentimentWords === 0) {
      return {
        sentiment: 'neutral',
        score: 0,
        confidence: 0.5
      }
    }

    const score = (positiveScore - negativeScore) / Math.max(totalSentimentWords, 1)
    const confidence = Math.min(totalSentimentWords / 5, 1) // More sentiment words = higher confidence
    
    let sentiment: 'positive' | 'negative' | 'neutral'
    if (score > 0.2) {
      sentiment = 'positive'
    } else if (score < -0.2) {
      sentiment = 'negative'
    } else {
      sentiment = 'neutral'
    }

    return {
      sentiment,
      score,
      confidence
    }
  }

  /**
   * Extract topics and hashtags from tweet
   */
  extractTopics(tweet: EnhancedTweet): TopicExtractionResult {
    const topics: string[] = []
    
    // Extract hashtags
    if (tweet.entities?.hashtags) {
      topics.push(...tweet.entities.hashtags.map(h => h.tag.toLowerCase()))
    }

    // Extract context annotations (topics detected by Twitter)
    if (tweet.context_annotations) {
      tweet.context_annotations.forEach(annotation => {
        if (annotation.entity?.name) {
          topics.push(annotation.entity.name.toLowerCase())
        }
      })
    }

    // Simple keyword extraction for crypto/tech topics
    const techKeywords = [
      'bitcoin', 'ethereum', 'crypto', 'blockchain', 'defi', 'nft', 'web3',
      'ai', 'ml', 'startup', 'tech', 'programming', 'coding', 'developer',
      'saas', 'fintech', 'gamefi', 'metaverse', 'dao'
    ]

    const text = tweet.text.toLowerCase()
    techKeywords.forEach(keyword => {
      if (text.includes(keyword) && !topics.includes(keyword)) {
        topics.push(keyword)
      }
    })

    return {
      topics: [...new Set(topics)], // Remove duplicates
      confidence: topics.length > 0 ? Math.min(topics.length / 3, 1) : 0
    }
  }

  /**
   * Analyze engagement metrics and calculate scores
   */
  analyzeEngagement(tweet: EnhancedTweet, authorFollowers?: number): EngagementAnalysis {
    const metrics = tweet.public_metrics
    if (!metrics) {
      return {
        engagementRate: 0,
        viralityScore: 0,
        reachPotential: 0,
        trending: false
      }
    }

    const totalEngagements = metrics.like_count + metrics.retweet_count + metrics.reply_count + metrics.quote_count
    const engagementRate = authorFollowers ? totalEngagements / authorFollowers : 0

    // Virality score based on retweets and quotes vs likes
    const shareActions = metrics.retweet_count + metrics.quote_count
    const viralityScore = totalEngagements > 0 ? shareActions / totalEngagements : 0

    // Reach potential based on engagement velocity (would need time data for accuracy)
    const reachPotential = Math.min(totalEngagements / 100, 1) // Simplified

    // Consider trending if very high engagement
    const trending = totalEngagements > 1000 && viralityScore > 0.3

    return {
      engagementRate,
      viralityScore,
      reachPotential,
      trending
    }
  }

  /**
   * Store analyzed tweet in database
   */
  async storeTweet(tweet: EnhancedTweet, sourceJobId?: string, sourceKeywords?: string[]): Promise<void> {
    try {
      const sentiment = await this.analyzeSentiment(tweet.text)
      const topics = this.extractTopics(tweet)
      
      // Extract hashtags, mentions, URLs
      const hashtags = tweet.entities?.hashtags?.map(h => h.tag) || []
      const mentions = tweet.entities?.mentions?.map(m => m.username) || []
      const urls = tweet.entities?.urls?.map(u => u.expanded_url) || []

      await prisma.scrapedTweet.upsert({
        where: { tweetId: tweet.id },
        update: {
          // Update metrics on existing tweets
          likeCount: tweet.public_metrics?.like_count || 0,
          retweetCount: tweet.public_metrics?.retweet_count || 0,
          replyCount: tweet.public_metrics?.reply_count || 0,
          quoteCount: tweet.public_metrics?.quote_count || 0,
        },
        create: {
          tweetId: tweet.id,
          authorId: tweet.author_id,
          authorUsername: '', // Would need to resolve from author_id
          content: tweet.text,
          createdAt: new Date(tweet.created_at),
          
          // Engagement metrics
          likeCount: tweet.public_metrics?.like_count || 0,
          retweetCount: tweet.public_metrics?.retweet_count || 0,
          replyCount: tweet.public_metrics?.reply_count || 0,
          quoteCount: tweet.public_metrics?.quote_count || 0,
          
          // Analysis data
          sentiment: sentiment.sentiment,
          sentimentScore: sentiment.score,
          topics: JSON.stringify(topics.topics),
          hashtags: JSON.stringify(hashtags),
          mentions: JSON.stringify(mentions),
          urls: JSON.stringify(urls),
          
          // Language and content
          language: tweet.lang,
          isRetweet: tweet.referenced_tweets?.some(ref => ref.type === 'retweeted') || false,
          retweetedFrom: tweet.referenced_tweets?.find(ref => ref.type === 'retweeted')?.id,
          
          // Source tracking
          sourceJobId,
          sourceKeywords: sourceKeywords ? JSON.stringify(sourceKeywords) : null
        }
      })

      // Store detailed analysis
      await prisma.tweetAnalysis.create({
        data: {
          tweetId: tweet.id,
          analysisType: 'sentiment',
          result: JSON.stringify(sentiment),
          confidence: sentiment.confidence
        }
      })

      await prisma.tweetAnalysis.create({
        data: {
          tweetId: tweet.id,
          analysisType: 'topic',
          result: JSON.stringify(topics),
          confidence: topics.confidence
        }
      })

    } catch (error) {
      console.error('Failed to store tweet analysis:', error)
    }
  }

  /**
   * Analyze a user profile and store analytics
   */
  async analyzeProfile(username: string, tweets: EnhancedTweet[], profileData?: any): Promise<ProfileInsights> {
    if (tweets.length === 0) {
      return {
        averageEngagement: 0,
        postingFrequency: 0,
        mostActiveHours: [],
        topTopics: [],
        sentimentTrend: [],
        audienceGrowth: 0
      }
    }

    // Calculate average engagement
    const totalEngagements = tweets.reduce((sum, tweet) => {
      const metrics = tweet.public_metrics
      return sum + (metrics ? metrics.like_count + metrics.retweet_count + metrics.reply_count : 0)
    }, 0)
    const averageEngagement = totalEngagements / tweets.length

    // Calculate posting frequency (tweets per day)
    const dates = tweets.map(t => new Date(t.created_at)).sort()
    const daysDiff = dates.length > 1 ? 
      (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24) : 1
    const postingFrequency = tweets.length / Math.max(daysDiff, 1)

    // Find most active hours
    const hourCounts: { [hour: number]: number } = {}
    tweets.forEach(tweet => {
      const hour = new Date(tweet.created_at).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    const mostActiveHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))

    // Extract top topics
    const topicCounts: { [topic: string]: number } = {}
    tweets.forEach(tweet => {
      const topics = this.extractTopics(tweet)
      topics.topics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
      })
    })
    const topTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic)

    // Calculate sentiment trend (simplified)
    const sentimentTrend = await Promise.all(
      tweets.slice(0, 10).map(tweet => this.analyzeSentiment(tweet.text))
    )

    // Store or update profile analytics
    try {
      await prisma.profileAnalytics.upsert({
        where: { username },
        update: {
          avgLikesPerTweet: tweets.reduce((sum, t) => sum + (t.public_metrics?.like_count || 0), 0) / tweets.length,
          avgRepliesPerTweet: tweets.reduce((sum, t) => sum + (t.public_metrics?.reply_count || 0), 0) / tweets.length,
          avgRetweetsPerTweet: tweets.reduce((sum, t) => sum + (t.public_metrics?.retweet_count || 0), 0) / tweets.length,
          engagementRate: averageEngagement,
          mostActiveHours: JSON.stringify(mostActiveHours),
          postingFrequency,
          topTopics: JSON.stringify(topTopics),
          sentimentTrend: JSON.stringify(sentimentTrend),
          lastUpdated: new Date()
        },
        create: {
          username,
          userId: profileData?.id || '',
          displayName: profileData?.name,
          bio: profileData?.description,
          followersCount: profileData?.public_metrics?.followers_count || 0,
          followingCount: profileData?.public_metrics?.following_count || 0,
          tweetCount: profileData?.public_metrics?.tweet_count || 0,
          listedCount: profileData?.public_metrics?.listed_count || 0,
          verified: profileData?.verified || false,
          avgLikesPerTweet: tweets.reduce((sum, t) => sum + (t.public_metrics?.like_count || 0), 0) / tweets.length,
          avgRepliesPerTweet: tweets.reduce((sum, t) => sum + (t.public_metrics?.reply_count || 0), 0) / tweets.length,
          avgRetweetsPerTweet: tweets.reduce((sum, t) => sum + (t.public_metrics?.retweet_count || 0), 0) / tweets.length,
          engagementRate: averageEngagement,
          mostActiveHours: JSON.stringify(mostActiveHours),
          postingFrequency,
          topTopics: JSON.stringify(topTopics),
          sentimentTrend: JSON.stringify(sentimentTrend)
        }
      })
    } catch (error) {
      console.error('Failed to store profile analytics:', error)
    }

    return {
      averageEngagement,
      postingFrequency,
      mostActiveHours,
      topTopics,
      sentimentTrend,
      audienceGrowth: 0 // Would need historical data
    }
  }

  /**
   * Get trending topics from stored tweets
   */
  async getTrendingTopics(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<{ topic: string; count: number; sentiment: number }[]> {
    const since = new Date()
    switch (timeframe) {
      case 'hour':
        since.setHours(since.getHours() - 1)
        break
      case 'day':
        since.setDate(since.getDate() - 1)
        break
      case 'week':
        since.setDate(since.getDate() - 7)
        break
    }

    const tweets = await prisma.scrapedTweet.findMany({
      where: {
        scrapedAt: {
          gte: since
        }
      },
      select: {
        topics: true,
        sentimentScore: true
      }
    })

    const topicStats: { [topic: string]: { count: number; totalSentiment: number } } = {}

    tweets.forEach(tweet => {
      if (tweet.topics) {
        const topics = JSON.parse(tweet.topics) as string[]
        topics.forEach(topic => {
          if (!topicStats[topic]) {
            topicStats[topic] = { count: 0, totalSentiment: 0 }
          }
          topicStats[topic].count++
          topicStats[topic].totalSentiment += tweet.sentimentScore || 0
        })
      }
    })

    return Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        count: stats.count,
        sentiment: stats.totalSentiment / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }

  /**
   * Get sentiment analysis for a specific topic
   */
  async getTopicSentiment(topic: string, timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    overall: SentimentResult
    timeline: { date: string; sentiment: number; count: number }[]
  }> {
    const since = new Date()
    switch (timeframe) {
      case 'day':
        since.setDate(since.getDate() - 1)
        break
      case 'week':
        since.setDate(since.getDate() - 7)
        break
      case 'month':
        since.setMonth(since.getMonth() - 1)
        break
    }

    const tweets = await prisma.scrapedTweet.findMany({
      where: {
        topics: {
          contains: topic
        },
        scrapedAt: {
          gte: since
        }
      },
      select: {
        sentimentScore: true,
        sentiment: true,
        scrapedAt: true
      },
      orderBy: {
        scrapedAt: 'desc'
      }
    })

    if (tweets.length === 0) {
      return {
        overall: { sentiment: 'neutral', score: 0, confidence: 0 },
        timeline: []
      }
    }

    // Calculate overall sentiment
    const totalScore = tweets.reduce((sum, t) => sum + (t.sentimentScore || 0), 0)
    const avgScore = totalScore / tweets.length
    
    let overallSentiment: 'positive' | 'negative' | 'neutral'
    if (avgScore > 0.2) overallSentiment = 'positive'
    else if (avgScore < -0.2) overallSentiment = 'negative'
    else overallSentiment = 'neutral'

    // Create timeline (group by day)
    const dailyStats: { [date: string]: { total: number; count: number } } = {}
    tweets.forEach(tweet => {
      const date = tweet.scrapedAt.toISOString().split('T')[0]
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, count: 0 }
      }
      dailyStats[date].total += tweet.sentimentScore || 0
      dailyStats[date].count++
    })

    const timeline = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        sentiment: stats.total / stats.count,
        count: stats.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      overall: {
        sentiment: overallSentiment,
        score: avgScore,
        confidence: Math.min(tweets.length / 50, 1)
      },
      timeline
    }
  }
}
