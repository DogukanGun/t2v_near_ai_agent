import { OpenRouterService } from './openrouter';

export interface TargetingStrategy {
  keywords: string[];
  excludeKeywords: string[];
  hashtags: string[];
  targetUsers: string[];
  searchQueries: string[];
  engagementFilters: {
    minLikes: number;
    minRetweets: number;
    minReplies: number;
  };
  explanation: string;
}

export class KeywordGeneratorService {
  static async generateTargetingStrategy(userPrompt: string): Promise<TargetingStrategy> {
    console.log('🎯 Keyword Generator - Processing user prompt:', userPrompt);

    const systemPrompt = `You are an expert Twitter marketing strategist. Based on the user's description of their target audience and goals, generate a comprehensive targeting strategy.

Return a JSON object with this exact structure:
{
  "keywords": ["array", "of", "relevant", "keywords"],
  "excludeKeywords": ["words", "to", "exclude"],
  "hashtags": ["hashtag1", "hashtag2"],
  "targetUsers": ["username1", "username2"],
  "searchQueries": ["complete twitter search query 1", "query 2"],
  "engagementFilters": {
    "minLikes": 10,
    "minRetweets": 5,
    "minReplies": 2
  },
  "explanation": "Brief explanation of the strategy"
}

Guidelines:
1. Keywords should be 1-3 words each, highly relevant to the target audience
2. ExcludeKeywords should filter out irrelevant content (spam, unrelated topics)
3. Hashtags should be popular and relevant (without # symbol)
4. TargetUsers should be influential accounts in the space (without @ symbol)
5. SearchQueries should use Twitter advanced search syntax
6. EngagementFilters should ensure quality content
7. Focus on finding tweets where meaningful replies would add value

User's target description: "${userPrompt}"`;

    try {
      const response = await OpenRouterService.generateCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a targeting strategy for: ${userPrompt}` }
      ]);

      console.log('🤖 OpenRouter response:', response);

      // Try to extract JSON from the response
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // If no JSON found, create a fallback response
        console.log('⚠️ No JSON found in response, creating fallback');
        return this.createFallbackStrategy(userPrompt);
      }

      const strategy = JSON.parse(jsonMatch[0]) as TargetingStrategy;
      console.log('✅ Generated targeting strategy:', strategy);
      
      return strategy;
    } catch (error) {
      console.error('💥 Error generating targeting strategy:', error);
      return this.createFallbackStrategy(userPrompt);
    }
  }

  private static createFallbackStrategy(userPrompt: string): TargetingStrategy {
    // Extract basic keywords from user prompt
    const words = userPrompt.toLowerCase().match(/\b\w+\b/g) || [];
    const keywords = words.filter(word => word.length > 3).slice(0, 5);

    return {
      keywords,
      excludeKeywords: ['spam', 'bot', 'fake', 'scam'],
      hashtags: ['business', 'startup', 'tech'],
      targetUsers: [],
      searchQueries: [keywords.join(' OR ')],
      engagementFilters: {
        minLikes: 5,
        minRetweets: 2,
        minReplies: 1
      },
      explanation: `Basic strategy generated from your description. Keywords extracted: ${keywords.join(', ')}`
    };
  }

  static async generateReplyStrategy(tweetText: string, targetAudience: string): Promise<{
    shouldReply: boolean;
    replyAngle: string;
    suggestedReply: string;
    confidence: number;
  }> {
    console.log('💬 Reply Generator - Analyzing tweet for reply opportunity');

    const systemPrompt = `You are an expert at identifying valuable reply opportunities on Twitter. Analyze the given tweet and determine if it's worth replying to based on the target audience.

Return a JSON object with this structure:
{
  "shouldReply": true/false,
  "replyAngle": "brief description of the reply angle",
  "suggestedReply": "suggested reply text (max 280 chars)",
  "confidence": 0.8
}

Criteria for good reply opportunities:
- Tweet has engagement potential (not too old, has some likes/replies)
- Author seems genuine and engaged
- Topic aligns with target audience interests
- Opportunity to add value, not just promote
- Can naturally contribute to the conversation

Target audience: ${targetAudience}
Tweet: "${tweetText}"`;

    try {
      const response = await OpenRouterService.generateCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Should I reply to this tweet? Analyze: ${tweetText}` }
      ]);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          shouldReply: false,
          replyAngle: 'Could not analyze',
          suggestedReply: '',
          confidence: 0
        };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('💥 Error generating reply strategy:', error);
      return {
        shouldReply: false,
        replyAngle: 'Analysis failed',
        suggestedReply: '',
        confidence: 0
      };
    }
  }

  static optimizeSearchQuery(baseQuery: string, results: any[]): string {
    // Analyze results and suggest query improvements
    if (results.length === 0) {
      return baseQuery.replace(' AND ', ' OR '); // Make query broader
    }
    
    if (results.length > 100) {
      return `${baseQuery} min_faves:10`; // Add engagement filter
    }

    return baseQuery;
  }
}
