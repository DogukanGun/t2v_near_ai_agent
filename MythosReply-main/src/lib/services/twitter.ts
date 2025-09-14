import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import axios from 'axios'

export interface TwitterCredentials {
  apiKey: string
  apiSecret: string
  accessToken?: string
  accessTokenSecret?: string
  bearerToken?: string
}

export interface AppOnlyCredentials {
  apiKey: string
  apiSecret: string
  bearerToken: string
}

export interface UserCredentials {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessTokenSecret: string
}

export interface TweetData {
  text: string
  reply_to?: string
}

export interface TwitterSearchOptions {
  query?: string
  max_results?: number
  tweet_fields?: string[]
  expansions?: string[]
  user_fields?: string[]
  start_time?: string
  end_time?: string
}

export interface TweetMetrics {
  retweet_count: number
  like_count: number
  reply_count: number
  quote_count: number
}

export interface EnhancedTweet {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics?: TweetMetrics
  context_annotations?: any[]
  entities?: {
    hashtags?: { tag: string }[]
    mentions?: { username: string, id: string }[]
    urls?: { expanded_url: string }[]
  }
  lang?: string
  possibly_sensitive?: boolean
  referenced_tweets?: {
    type: string
    id: string
  }[]
}

export class TwitterService {
  private oauth?: OAuth
  private credentials: TwitterCredentials
  private authType: 'oauth1' | 'bearer'

  constructor(credentials: TwitterCredentials) {
    this.credentials = credentials
    
    // Determine authentication type
    if (credentials.accessToken && credentials.accessTokenSecret) {
      this.authType = 'oauth1'
      this.oauth = new OAuth({
        consumer: {
          key: credentials.apiKey,
          secret: credentials.apiSecret
        },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string, key) {
          return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64')
        }
      })
    } else if (credentials.bearerToken) {
      this.authType = 'bearer'
    } else {
      throw new Error('Invalid credentials: must provide either OAuth 1.0a tokens or Bearer token')
    }
  }

  private getAuthHeader(url: string, method: string, data?: any) {
    if (this.authType === 'bearer') {
      return {
        'Authorization': `Bearer ${this.credentials.bearerToken}`
      }
    } else if (this.authType === 'oauth1' && this.oauth) {
      const requestData = {
        url,
        method,
        data
      }

      return this.oauth.toHeader(
        this.oauth.authorize(requestData, {
          key: this.credentials.accessToken!,
          secret: this.credentials.accessTokenSecret!
        })
      )
    } else {
      throw new Error('Invalid authentication configuration')
    }
  }

  async createTweet(tweetData: TweetData): Promise<any> {
    if (this.authType === 'bearer') {
      throw new Error('Cannot create tweets with Bearer token authentication. User authentication required.')
    }

    const url = 'https://api.twitter.com/2/tweets'
    const authHeader = this.getAuthHeader(url, 'POST', tweetData)

    try {
      const response = await axios.post(url, tweetData, {
        headers: {
          ...authHeader,
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to create tweet: ${error.response?.data?.detail || error.message}`)
    }
  }

  async replyToTweet(tweetId: string, replyText: string): Promise<any> {
    if (this.authType === 'bearer') {
      throw new Error('Cannot reply to tweets with Bearer token authentication. User authentication required.')
    }

    const tweetData: TweetData = {
      text: replyText,
      reply_to: tweetId
    }

    return this.createTweet(tweetData)
  }

  /**
   * Create service instance for app-only authentication (read-only)
   */
  static createAppOnlyService(): TwitterService {
    return new TwitterService({
      apiKey: process.env.TWITTER_API_KEY!,
      apiSecret: process.env.TWITTER_API_SECRET!,
      bearerToken: process.env.TWITTER_BEARER_TOKEN!
    })
  }

  /**
   * Create service instance for user authentication (full access)
   */
  static createUserService(accessToken: string, accessTokenSecret: string): TwitterService {
    return new TwitterService({
      apiKey: process.env.TWITTER_API_KEY!,
      apiSecret: process.env.TWITTER_API_SECRET!,
      accessToken,
      accessTokenSecret
    })
  }

  async searchTweets(options: TwitterSearchOptions): Promise<any> {
    const params = new URLSearchParams()
    
    if (options.query) params.append('query', options.query)
    if (options.max_results) params.append('max_results', options.max_results.toString())
    if (options.tweet_fields) params.append('tweet.fields', options.tweet_fields.join(','))
    if (options.expansions) params.append('expansions', options.expansions.join(','))
    if (options.user_fields) params.append('user.fields', options.user_fields.join(','))
    if (options.start_time) params.append('start_time', options.start_time)
    if (options.end_time) params.append('end_time', options.end_time)

    const url = `https://api.twitter.com/2/tweets/search/recent?${params.toString()}`
    const authHeader = this.getAuthHeader(url, 'GET')

    try {
      const response = await axios.get(url, {
        headers: authHeader
      })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to search tweets: ${error.response?.data?.detail || error.message}`)
    }
  }

  async getUserTweets(username: string, maxResults: number = 10, includeMetrics: boolean = true): Promise<any> {
    // First get user ID
    const userUrl = `https://api.twitter.com/2/users/by/username/${username}`
    const userAuthHeader = this.getAuthHeader(userUrl, 'GET')

    try {
      const userResponse = await axios.get(userUrl, {
        headers: userAuthHeader
      })

      const userId = userResponse.data.data.id

      // Build tweet fields
      const tweetFields = ['created_at', 'author_id', 'lang', 'possibly_sensitive', 'context_annotations']
      if (includeMetrics) {
        tweetFields.push('public_metrics')
      }

      // Then get user tweets with enhanced data
      const params = new URLSearchParams({
        'max_results': maxResults.toString(),
        'tweet.fields': tweetFields.join(','),
        'expansions': 'entities.mentions.username,referenced_tweets.id',
        'user.fields': 'public_metrics,verified,description'
      })

      const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?${params.toString()}`
      const tweetsAuthHeader = this.getAuthHeader(tweetsUrl, 'GET')

      const tweetsResponse = await axios.get(tweetsUrl, {
        headers: tweetsAuthHeader
      })

      return tweetsResponse.data
    } catch (error: any) {
      throw new Error(`Failed to get user tweets: ${error.response?.data?.detail || error.message}`)
    }
  }

  async getUserProfile(username: string): Promise<any> {
    const url = `https://api.twitter.com/2/users/by/username/${username}?user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified`
    const authHeader = this.getAuthHeader(url, 'GET')

    try {
      const response = await axios.get(url, {
        headers: authHeader
      })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.response?.data?.detail || error.message}`)
    }
  }

  async getTweetById(tweetId: string, includeMetrics: boolean = true): Promise<any> {
    const tweetFields = ['created_at', 'author_id', 'lang', 'possibly_sensitive', 'context_annotations']
    if (includeMetrics) {
      tweetFields.push('public_metrics')
    }

    const params = new URLSearchParams({
      'tweet.fields': tweetFields.join(','),
      'expansions': 'author_id,entities.mentions.username,referenced_tweets.id',
      'user.fields': 'username,verified'
    })

    const url = `https://api.twitter.com/2/tweets/${tweetId}?${params.toString()}`
    const authHeader = this.getAuthHeader(url, 'GET')

    try {
      const response = await axios.get(url, {
        headers: authHeader
      })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get tweet: ${error.response?.data?.detail || error.message}`)
    }
  }

  async getMultipleTweets(tweetIds: string[], includeMetrics: boolean = true): Promise<any> {
    const tweetFields = ['created_at', 'author_id', 'lang', 'possibly_sensitive', 'context_annotations']
    if (includeMetrics) {
      tweetFields.push('public_metrics')
    }

    const params = new URLSearchParams({
      'ids': tweetIds.join(','),
      'tweet.fields': tweetFields.join(','),
      'expansions': 'author_id,entities.mentions.username,referenced_tweets.id',
      'user.fields': 'username,verified'
    })

    const url = `https://api.twitter.com/2/tweets?${params.toString()}`
    const authHeader = this.getAuthHeader(url, 'GET')

    try {
      const response = await axios.get(url, {
        headers: authHeader
      })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get tweets: ${error.response?.data?.detail || error.message}`)
    }
  }

  async deleteTweet(tweetId: string): Promise<any> {
    const url = `https://api.twitter.com/2/tweets/${tweetId}`
    const authHeader = this.getAuthHeader(url, 'DELETE')

    try {
      const response = await axios.delete(url, {
        headers: authHeader
      })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to delete tweet: ${error.response?.data?.detail || error.message}`)
    }
  }

  static async getRequestToken(apiKey: string, apiSecret: string, callbackUrl: string): Promise<any> {
    const oauth = new OAuth({
      consumer: {
        key: apiKey,
        secret: apiSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64')
      }
    })

    const requestData = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: callbackUrl }
    }

    const authHeader = oauth.toHeader(oauth.authorize(requestData))

    try {
      const response = await axios.post(requestData.url, requestData.data, {
        headers: {
          ...authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      const params = new URLSearchParams(response.data)
      return {
        oauth_token: params.get('oauth_token'),
        oauth_token_secret: params.get('oauth_token_secret'),
        oauth_callback_confirmed: params.get('oauth_callback_confirmed')
      }
    } catch (error: any) {
      throw new Error(`Failed to get request token: ${error.response?.data || error.message}`)
    }
  }

  static async getAccessToken(apiKey: string, apiSecret: string, oauthToken: string, oauthTokenSecret: string, oauthVerifier: string): Promise<any> {
    const oauth = new OAuth({
      consumer: {
        key: apiKey,
        secret: apiSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64')
      }
    })

    const requestData = {
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
      data: { oauth_verifier: oauthVerifier }
    }

    const authHeader = oauth.toHeader(oauth.authorize(requestData, {
      key: oauthToken,
      secret: oauthTokenSecret
    }))

    try {
      const response = await axios.post(requestData.url, requestData.data, {
        headers: {
          ...authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      const params = new URLSearchParams(response.data)
      return {
        oauth_token: params.get('oauth_token'),
        oauth_token_secret: params.get('oauth_token_secret'),
        user_id: params.get('user_id'),
        screen_name: params.get('screen_name')
      }
    } catch (error: any) {
      throw new Error(`Failed to get access token: ${error.response?.data || error.message}`)
    }
  }
}
