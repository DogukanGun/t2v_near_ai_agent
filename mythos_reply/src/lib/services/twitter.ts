import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import axios from 'axios'

export interface TwitterCredentials {
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
}

export class TwitterService {
  private oauth: OAuth
  private credentials: TwitterCredentials

  constructor(credentials: TwitterCredentials) {
    this.credentials = credentials
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
  }

  private getAuthHeader(url: string, method: string, data?: any) {
    const requestData = {
      url,
      method,
      data
    }

    return this.oauth.toHeader(
      this.oauth.authorize(requestData, {
        key: this.credentials.accessToken,
        secret: this.credentials.accessTokenSecret
      })
    )
  }

  async createTweet(tweetData: TweetData): Promise<any> {
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
    const tweetData: TweetData = {
      text: replyText,
      reply_to: tweetId
    }

    return this.createTweet(tweetData)
  }

  async searchTweets(options: TwitterSearchOptions): Promise<any> {
    const params = new URLSearchParams()
    
    if (options.query) params.append('query', options.query)
    if (options.max_results) params.append('max_results', options.max_results.toString())
    if (options.tweet_fields) params.append('tweet.fields', options.tweet_fields.join(','))

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

  async getUserTweets(username: string, maxResults: number = 10): Promise<any> {
    // First get user ID
    const userUrl = `https://api.twitter.com/2/users/by/username/${username}`
    const userAuthHeader = this.getAuthHeader(userUrl, 'GET')

    try {
      const userResponse = await axios.get(userUrl, {
        headers: userAuthHeader
      })

      const userId = userResponse.data.data.id

      // Then get user tweets
      const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,author_id,public_metrics`
      const tweetsAuthHeader = this.getAuthHeader(tweetsUrl, 'GET')

      const tweetsResponse = await axios.get(tweetsUrl, {
        headers: tweetsAuthHeader
      })

      return tweetsResponse.data
    } catch (error: any) {
      throw new Error(`Failed to get user tweets: ${error.response?.data?.detail || error.message}`)
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
