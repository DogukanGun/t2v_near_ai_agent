import { prisma } from '@/lib/database'
import { TwitterService, TwitterCredentials, EnhancedTweet } from './twitter'
import { OpenRouterService, ReplyGenerationOptions } from './openrouter'
import { TwitterAnalysisService } from './twitterAnalysis'

export interface ReplyJobConfig {
  id: string
  twitterAccountId: string
  targetTweetId?: string
  targetUsername?: string
  keywords: string
  replyText: string
  useAI: boolean
  aiConfig?: {
    tone: 'professional' | 'casual' | 'humorous' | 'supportive' | 'promotional'
    includeHashtags: boolean
    includeEmojis: boolean
    customInstructions?: string
    modelId?: string
  }
  maxReplies: number
  currentReplies: number
  isActive: boolean
}

export class ReplyAgentService {
  private twitterService: TwitterService
  private openRouterService: OpenRouterService
  private analysisService: TwitterAnalysisService

  constructor(twitterCredentials: TwitterCredentials) {
    this.twitterService = new TwitterService(twitterCredentials)
    this.openRouterService = new OpenRouterService()
    this.analysisService = new TwitterAnalysisService()
  }

  async processReplyJob(jobId: string): Promise<void> {
    const job = await prisma.replyJob.findUnique({
      where: { id: jobId },
      include: {
        twitterAccount: true,
        user: true
      }
    })

    if (!job || !job.isActive || job.currentReplies >= job.maxReplies) {
      return
    }

    try {
      // Different strategies based on target type
      let tweetsToReplyTo: any[] = []

      if (job.targetTweetId) {
        // Reply to specific tweet
        tweetsToReplyTo = [{ id: job.targetTweetId }]
      } else if (job.targetUsernames || job.targetUsername) {
        // Monitor user's tweets - support both new multiple usernames and legacy single username
        const usernamesToMonitor = job.targetUsernames 
          ? JSON.parse(job.targetUsernames)
          : (job.targetUsername ? [job.targetUsername] : [])
        
        // Fetch tweets from all target usernames with enhanced data
        for (const username of usernamesToMonitor) {
          try {
            const userTweets = await this.twitterService.getUserTweets(username, 5, true)
            if (userTweets.data) {
              // Store tweets for analysis
              for (const tweet of userTweets.data) {
                await this.analysisService.storeTweet(tweet as EnhancedTweet, jobId, [username])
              }
              tweetsToReplyTo.push(...userTweets.data)
            }
          } catch (error) {
            console.error(`Failed to fetch tweets for ${username}:`, error)
            // Continue with other usernames even if one fails
          }
        }
      } else if (job.keywords && job.keywords !== '[]') {
        // Search for tweets with keywords
        const keywordsArray = JSON.parse(job.keywords)
        if (keywordsArray.length > 0) {
          const searchQuery = keywordsArray.join(' OR ')
          const searchResults = await this.twitterService.searchTweets({
            query: searchQuery,
            max_results: 10,
            tweet_fields: ['created_at', 'author_id', 'public_metrics', 'context_annotations', 'lang'],
            expansions: ['author_id', 'entities.mentions.username'],
            user_fields: ['username', 'public_metrics', 'verified']
          })
          
          if (searchResults.data) {
            // Store tweets for analysis
            for (const tweet of searchResults.data) {
              await this.analysisService.storeTweet(tweet as EnhancedTweet, jobId, keywordsArray)
            }
            tweetsToReplyTo = searchResults.data
          }
        }
      }

      // Filter out tweets we've already replied to
      const repliedTweetIds = await prisma.reply.findMany({
        where: { replyJobId: jobId },
        select: { tweetId: true }
      })

      const repliedIds = new Set(repliedTweetIds.map(r => r.tweetId))
      tweetsToReplyTo = tweetsToReplyTo.filter(tweet => !repliedIds.has(tweet.id))

      // Process replies
      const remainingReplies = job.maxReplies - job.currentReplies
      const tweetsToProcess = tweetsToReplyTo.slice(0, remainingReplies)

      for (const tweet of tweetsToProcess) {
        try {
          let replyText = job.replyText

          // Generate AI reply if enabled
          if (job.useAI && job.aiConfig) {
            const aiOptions: ReplyGenerationOptions = {
              originalTweet: tweet.text || 'Tweet content not available',
              context: `Replying as ${job.twitterAccount.twitterUsername}`,
              tone: job.aiConfig.tone,
              maxLength: 280,
              includeHashtags: job.aiConfig.includeHashtags,
              includeEmojis: job.aiConfig.includeEmojis,
              customInstructions: job.aiConfig.customInstructions
            }

            replyText = await this.openRouterService.generateReply(
              aiOptions, 
              job.aiConfig.modelId
            )
          }

          // Post the reply
          const replyResult = await this.twitterService.replyToTweet(tweet.id, replyText)

          // Record the successful reply
          await prisma.reply.create({
            data: {
              replyJobId: jobId,
              tweetId: tweet.id,
              replyTweetId: replyResult.data.id,
              content: replyText,
              successful: true
            }
          })

          // Update reply count
          await prisma.replyJob.update({
            where: { id: jobId },
            data: {
              currentReplies: { increment: 1 },
              lastProcessedAt: new Date()
            }
          })

          // Add delay to avoid rate limiting
          await this.delay(5000) // 5 second delay between replies

        } catch (error: any) {
          console.error(`Failed to reply to tweet ${tweet.id}:`, error)

          // Record the failed reply
          await prisma.reply.create({
            data: {
              replyJobId: jobId,
              tweetId: tweet.id,
              replyTweetId: '',
              content: job.replyText,
              successful: false,
              errorMessage: error.message
            }
          })
        }
      }

      // Update last processed time
      await prisma.replyJob.update({
        where: { id: jobId },
        data: { lastProcessedAt: new Date() }
      })

    } catch (error: any) {
      console.error(`Error processing reply job ${jobId}:`, error)
    }
  }

  async processAllActiveJobs(): Promise<void> {
    const activeJobs = await prisma.replyJob.findMany({
      where: {
        isActive: true,
        currentReplies: { lt: prisma.raw('max_replies') }
      },
      include: {
        twitterAccount: true
      }
    })

    for (const job of activeJobs) {
      try {
        // Create Twitter service for this specific account
        const twitterCredentials: TwitterCredentials = {
          apiKey: process.env.TWITTER_API_KEY!,
          apiSecret: process.env.TWITTER_API_SECRET!,
          accessToken: job.twitterAccount.accessToken,
          accessTokenSecret: job.twitterAccount.accessTokenSecret
        }

        const agentService = new ReplyAgentService(twitterCredentials)
        await agentService.processReplyJob(job.id)

        // Add delay between processing different jobs
        await this.delay(2000)

      } catch (error: any) {
        console.error(`Error processing job ${job.id}:`, error)
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static async startReplyJob(jobId: string): Promise<void> {
    const job = await prisma.replyJob.findUnique({
      where: { id: jobId },
      include: { twitterAccount: true }
    })

    if (!job) {
      throw new Error('Reply job not found')
    }

    const twitterCredentials: TwitterCredentials = {
      apiKey: process.env.TWITTER_API_KEY!,
      apiSecret: process.env.TWITTER_API_SECRET!,
      accessToken: job.twitterAccount.accessToken,
      accessTokenSecret: job.twitterAccount.accessTokenSecret
    }

    const agentService = new ReplyAgentService(twitterCredentials)
    await agentService.processReplyJob(jobId)
  }

  static async stopReplyJob(jobId: string): Promise<void> {
    await prisma.replyJob.update({
      where: { id: jobId },
      data: { isActive: false }
    })
  }

  static async getJobStats(jobId: string): Promise<any> {
    const job = await prisma.replyJob.findUnique({
      where: { id: jobId },
      include: {
        replies: true,
        twitterAccount: {
          select: { twitterUsername: true }
        }
      }
    })

    if (!job) {
      throw new Error('Reply job not found')
    }

    const successfulReplies = job.replies.filter(r => r.successful).length
    const failedReplies = job.replies.filter(r => !r.successful).length

    return {
      ...job,
      stats: {
        totalReplies: job.replies.length,
        successfulReplies,
        failedReplies,
        successRate: job.replies.length > 0 ? (successfulReplies / job.replies.length) * 100 : 0,
        remainingReplies: job.maxReplies - job.currentReplies
      }
    }
  }
}
