import { prisma } from '@/lib/database'
import { TwitterService, TwitterCredentials } from './twitter'
import { OpenRouterService, ReplyGenerationOptions } from './openrouter'

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

  constructor(twitterCredentials: TwitterCredentials) {
    this.twitterService = new TwitterService(twitterCredentials)
    this.openRouterService = new OpenRouterService()
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
      } else if (job.targetUsername) {
        // Monitor user's tweets
        const userTweets = await this.twitterService.getUserTweets(job.targetUsername, 5)
        tweetsToReplyTo = userTweets.data || []
      } else if (job.keywords && job.keywords !== '[]') {
        // Search for tweets with keywords
        const keywordsArray = JSON.parse(job.keywords)
        if (keywordsArray.length > 0) {
          const searchQuery = keywordsArray.join(' OR ')
          const searchResults = await this.twitterService.searchTweets({
            query: searchQuery,
            max_results: 10,
            tweet_fields: ['created_at', 'author_id', 'public_metrics']
          })
          tweetsToReplyTo = searchResults.data || []
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
          if (job.useAI) {
            const aiOptions: ReplyGenerationOptions = {
              originalTweet: tweet.text || 'Tweet content not available',
              context: `Replying as ${job.twitterAccount.twitterUsername}`,
              tone: job.aiTone as any,
              maxLength: 280,
              includeHashtags: job.aiIncludeHashtags,
              includeEmojis: job.aiIncludeEmojis,
              customInstructions: job.aiInstructions || undefined
            }

            replyText = await this.openRouterService.generateReply(
              aiOptions, 
              job.aiModelId || undefined
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
        currentReplies: { lt: 10 } // Use a default max value or retrieve from configuration
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
