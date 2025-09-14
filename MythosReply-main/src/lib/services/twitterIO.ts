// TwitterIO API service for analytics and user data
export interface TwitterIOTweet {
  type: string;
  id: string;
  url: string;
  text: string;
  source: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  viewCount: number;
  createdAt: string;
  lang: string;
  bookmarkCount: number;
  isReply: boolean;
  inReplyToId?: string;
  conversationId: string;
  inReplyToUserId?: string;
  inReplyToUsername?: string;
  author: {
    type: string;
    userName: string;
    url: string;
    id: string;
    name: string;
    isBlueVerified: boolean;
    verifiedType: string;
    profilePicture: string;
    coverPicture: string;
    description: string;
    location: string;
    followers: number;
    following: number;
    canDm: boolean;
    createdAt: string;
    favouritesCount: number;
    hasCustomTimelines: boolean;
    isTranslator: boolean;
    mediaCount: number;
    statusesCount: number;
    withheldInCountries: string[];
    affiliatesHighlightedLabel: any;
    possiblySensitive: boolean;
    pinnedTweetIds: string[];
    isAutomated: boolean;
    automatedBy: string;
    unavailable: boolean;
    message: string;
    unavailableReason: string;
    profile_bio: {
      description: string;
      entities: any;
    };
  };
}

export interface TwitterIOSearchResponse {
  tweets: TwitterIOTweet[];
  has_next_page: boolean;
  next_cursor: string;
}

export interface SearchParams {
  query: string;
  queryType?: 'Latest' | 'Top';
  cursor?: string;
}

export interface UserTweetsParams {
  userId?: string;
  userName?: string;
  cursor?: string;
  includeReplies?: boolean;
}

export interface UserTweetsResponse {
  tweets: TwitterIOTweet[];
  has_next_page: boolean;
  next_cursor: string;
  status: 'success' | 'error';
  message: string;
}

export class TwitterIOService {
  private static readonly BASE_URL = 'https://api.twitterapi.io';
  private static readonly API_KEY = process.env.TWITTERIO_KEY;

  static async advancedSearch(params: SearchParams): Promise<TwitterIOSearchResponse> {
    console.log('🔍 TwitterIO - Starting advanced search:', params);
    
    if (!this.API_KEY) {
      throw new Error('TWITTERIO_KEY is not configured');
    }

    const url = new URL(`${this.BASE_URL}/twitter/tweet/advanced_search`);
    url.searchParams.append('query', params.query);
    url.searchParams.append('queryType', params.queryType || 'Latest');
    
    if (params.cursor) {
      url.searchParams.append('cursor', params.cursor);
    }

    console.log('📡 TwitterIO - Making request to:', url.toString());

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-API-Key': this.API_KEY,
          'Content-Type': 'application/json',
        },
      });

      console.log('📨 TwitterIO - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ TwitterIO - Error response:', errorText);
        throw new Error(`TwitterIO API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ TwitterIO - Search successful, found tweets:', data.tweets?.length);
      
      return data;
    } catch (error) {
      console.error('💥 TwitterIO - Search failed:', error);
      throw error;
    }
  }

  static async getUserLastTweets(params: UserTweetsParams): Promise<UserTweetsResponse> {
    console.log('🔍 TwitterIO - Getting user last tweets:', params);
    
    if (!this.API_KEY) {
      throw new Error('TWITTERIO_KEY is not configured');
    }

    const url = new URL(`${this.BASE_URL}/twitter/user/last_tweets`);
    
    if (params.userId) {
      url.searchParams.append('userId', params.userId);
    } else if (params.userName) {
      url.searchParams.append('userName', params.userName);
    } else {
      throw new Error('Either userId or userName must be provided');
    }
    
    if (params.cursor) {
      url.searchParams.append('cursor', params.cursor);
    } else {
      url.searchParams.append('cursor', '');
    }

    if (params.includeReplies !== undefined) {
      url.searchParams.append('includeReplies', params.includeReplies.toString());
    }

    console.log('📡 TwitterIO - Making user tweets request to:', url.toString());

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-API-Key': this.API_KEY,
          'Content-Type': 'application/json',
        },
      });

      console.log('📨 TwitterIO - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ TwitterIO - Error response:', errorText);
        throw new Error(`TwitterIO API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ TwitterIO - User tweets successful, response keys:', Object.keys(data));
      console.log('🔍 TwitterIO - Response structure:', {
        hasStatus: 'status' in data,
        hasMessage: 'message' in data,
        hasTweets: 'tweets' in data,
        hasData: 'data' in data,
        statusValue: data.status,
        messageValue: data.message,
        tweetsType: typeof data.tweets,
        tweetsIsArray: Array.isArray(data.tweets),
        tweetsLength: data.tweets?.length,
        dataType: typeof data.data,
        dataKeys: data.data ? Object.keys(data.data) : 'no data key'
      });
      
      // Try to access tweets from different possible locations
      let tweets = data.tweets || data.data?.tweets || [];
      console.log('📊 TwitterIO - Final tweets array length:', tweets.length);
      console.log('📊 TwitterIO - First tweet sample:', tweets[0] ? {
        id: tweets[0].id,
        text: tweets[0].text?.substring(0, 50),
        author: tweets[0].author?.userName
      } : 'no tweets');
      
      return {
        tweets: tweets,
        has_next_page: data.has_next_page || data.data?.has_next_page || false,
        next_cursor: data.next_cursor || data.data?.next_cursor || '',
        status: data.status || 'success',
        message: data.message || 'Success'
      };
    } catch (error) {
      console.error('💥 TwitterIO - User tweets failed:', error);
      throw error;
    }
  }

  // Generate search query from user preferences
  static buildSearchQuery(options: {
    keywords?: string[];
    excludeKeywords?: string[];
    fromUsers?: string[];
    mentions?: string[];
    hashtags?: string[];
    minLikes?: number;
    minRetweets?: number;
    minReplies?: number;
    hasMedia?: boolean;
    isReply?: boolean;
    lang?: string;
    sinceDate?: string;
    untilDate?: string;
  }): string {
    const queryParts: string[] = [];

    // Add keywords
    if (options.keywords && options.keywords.length > 0) {
      const keywordQuery = options.keywords.length > 1 
        ? `(${options.keywords.join(' OR ')})` 
        : options.keywords[0];
      queryParts.push(keywordQuery);
    }

    // Exclude keywords
    if (options.excludeKeywords && options.excludeKeywords.length > 0) {
      options.excludeKeywords.forEach(keyword => {
        queryParts.push(`-${keyword}`);
      });
    }

    // From specific users
    if (options.fromUsers && options.fromUsers.length > 0) {
      const userQuery = options.fromUsers.length > 1
        ? `(${options.fromUsers.map(user => `from:${user}`).join(' OR ')})`
        : `from:${options.fromUsers[0]}`;
      queryParts.push(userQuery);
    }

    // Mentions
    if (options.mentions && options.mentions.length > 0) {
      options.mentions.forEach(user => {
        queryParts.push(`@${user}`);
      });
    }

    // Hashtags
    if (options.hashtags && options.hashtags.length > 0) {
      options.hashtags.forEach(tag => {
        queryParts.push(`#${tag}`);
      });
    }

    // Engagement filters
    if (options.minLikes) {
      queryParts.push(`min_faves:${options.minLikes}`);
    }

    if (options.minRetweets) {
      queryParts.push(`min_retweets:${options.minRetweets}`);
    }

    if (options.minReplies) {
      queryParts.push(`min_replies:${options.minReplies}`);
    }

    // Media filter
    if (options.hasMedia) {
      queryParts.push('filter:media');
    }

    // Reply filter
    if (options.isReply !== undefined) {
      if (options.isReply) {
        queryParts.push('filter:replies');
      } else {
        queryParts.push('-filter:replies');
      }
    }

    // Language
    if (options.lang) {
      queryParts.push(`lang:${options.lang}`);
    }

    // Date range
    if (options.sinceDate) {
      queryParts.push(`since:${options.sinceDate}`);
    }

    if (options.untilDate) {
      queryParts.push(`until:${options.untilDate}`);
    }

    const query = queryParts.join(' ');
    console.log('🔍 TwitterIO - Built search query:', query);
    return query;
  }

  // Helper method to extract trending topics and engagement patterns
  static analyzeSearchResults(results: TwitterIOSearchResponse): {
    topAuthors: Array<{ username: string; followers: number; engagement: number; tweets: number }>;
    averageEngagement: { likes: number; retweets: number; replies: number };
    commonKeywords: string[];
    peakTimes: string[];
  } {
    const tweets = results.tweets;
    
    // Author analysis
    const authorStats = new Map<string, { followers: number; totalEngagement: number; tweetCount: number }>();
    
    tweets.forEach(tweet => {
      const username = tweet.author.userName;
      const engagement = tweet.likeCount + tweet.retweetCount + tweet.replyCount;
      
      if (authorStats.has(username)) {
        const stats = authorStats.get(username)!;
        stats.totalEngagement += engagement;
        stats.tweetCount += 1;
      } else {
        authorStats.set(username, {
          followers: tweet.author.followers,
          totalEngagement: engagement,
          tweetCount: 1
        });
      }
    });

    const topAuthors = Array.from(authorStats.entries())
      .map(([username, stats]) => ({
        username,
        followers: stats.followers,
        engagement: stats.totalEngagement / stats.tweetCount,
        tweets: stats.tweetCount
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);

    // Calculate average engagement
    const totalTweets = tweets.length;
    const avgLikes = tweets.reduce((sum, t) => sum + t.likeCount, 0) / totalTweets;
    const avgRetweets = tweets.reduce((sum, t) => sum + t.retweetCount, 0) / totalTweets;
    const avgReplies = tweets.reduce((sum, t) => sum + t.replyCount, 0) / totalTweets;

    // Extract common keywords (simple implementation)
    const allText = tweets.map(t => t.text.toLowerCase()).join(' ');
    const words = allText.match(/\b\w+\b/g) || [];
    const wordCount = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 3) { // Filter out short words
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });

    const commonKeywords = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    // Analyze peak times (hours when tweets were created)
    const hourCounts = new Map<number, number>();
    tweets.forEach(tweet => {
      const hour = new Date(tweet.createdAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const peakTimes = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    return {
      topAuthors,
      averageEngagement: { likes: avgLikes, retweets: avgRetweets, replies: avgReplies },
      commonKeywords,
      peakTimes
    };
  }
}
