import { Request, Response } from 'express';
import { CopilotBackend, OpenAIAdapter } from '@copilotkit/backend';
import Together from 'together-ai';
import { trackTokenUsage } from '../services/tokenTrackingService';
import { enhancedAiService } from '../services/enhancedAiService';
import { tavilyService } from '../services/tavilyService';
import { mem0Service } from '../services/mem0Service';

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// Use standard OpenAI adapter
const openaiAdapter = new OpenAIAdapter();

// Initialize CopilotKit backend
const copilotKit = new CopilotBackend({
  actions: [
    {
      name: 'rewrite_content',
      description: 'Rewrite content for different tones and platforms with research and memory enhancement',
      argumentAnnotations: [
        {
          name: 'content',
          type: 'string',
          description: 'The content to rewrite',
          required: true,
        },
        {
          name: 'tone',
          type: 'string',
          description: 'The desired tone (professional, casual, friendly, formal, humorous)',
          required: true,
        },
        {
          name: 'platform',
          type: 'string',
          description: 'The target platform (twitter, linkedin, email)',
          required: true,
        },
        {
          name: 'includeResearch',
          type: 'boolean',
          description: 'Whether to include research insights',
          required: false,
        },
        {
          name: 'includeTrending',
          type: 'boolean',
          description: 'Whether to include trending topics',
          required: false,
        },
        {
          name: 'useMemory',
          type: 'boolean',
          description: 'Whether to use personalized memory',
          required: false,
        },
        {
          name: 'userId',
          type: 'string',
          description: 'User ID for personalization',
          required: false,
        },
      ],
      implementation: async ({ content, tone, platform, includeResearch, includeTrending, useMemory, userId }: any) => {
        try {
          const sessionId = Date.now().toString();
          
          const enhancedResponse = await enhancedAiService.generateEnhancedContent({
            content,
            platform: platform as 'twitter' | 'linkedin' | 'email',
            tone,
            userId: userId || 'anonymous',
            sessionId,
            includeResearch: includeResearch || false,
            includeTrending: includeTrending || false,
            useMemory: useMemory || false,
          });

          return {
            rewrittenContent: enhancedResponse.generatedContent,
            researchInsights: enhancedResponse.researchInsights,
            trendingTopics: enhancedResponse.trendingTopics,
            personalizedRecommendations: enhancedResponse.personalizedRecommendations,
            sources: enhancedResponse.sources,
            confidence: enhancedResponse.confidence,
            suggestions: enhancedResponse.suggestions,
          };
        } catch (error) {
          console.error('Enhanced rewrite error:', error);
          return {
            rewrittenContent: content,
            error: 'Failed to enhance content',
          };
        }
      },
    },
    {
      name: 'research_topic',
      description: 'Research a topic using real-time web search and provide insights',
      argumentAnnotations: [
        {
          name: 'topic',
          type: 'string',
          description: 'The topic to research',
          required: true,
        },
        {
          name: 'contentType',
          type: 'string',
          description: 'Type of content (article, social, newsletter, blog)',
          required: false,
        },
        {
          name: 'platform',
          type: 'string',
          description: 'Target platform for the content',
          required: false,
        },
        {
          name: 'competitive',
          type: 'boolean',
          description: 'Include competitive analysis',
          required: false,
        },
        {
          name: 'userId',
          type: 'string',
          description: 'User ID for personalization',
          required: false,
        },
      ],
      implementation: async ({ topic, contentType, platform, competitive, userId }: any) => {
        try {
          const researchResponse = await enhancedAiService.createResearchEnhancedContent({
            topic,
            contentType: contentType || 'article',
            platform: platform || 'general',
            userId: userId || 'anonymous',
            competitive: competitive || false,
          });

          return {
            content: researchResponse.content,
            research: researchResponse.research,
            insights: researchResponse.insights,
            competitiveAnalysis: researchResponse.competitiveAnalysis,
            sources: researchResponse.sources,
          };
        } catch (error) {
          console.error('Research topic error:', error);
          return {
            content: `Unable to research topic: ${topic}`,
            error: 'Research failed',
          };
        }
      },
    },
    {
      name: 'get_trending_topics',
      description: 'Get trending topics for a specific platform and timeframe',
      argumentAnnotations: [
        {
          name: 'platform',
          type: 'string',
          description: 'Platform (twitter, linkedin, general)',
          required: true,
        },
        {
          name: 'timeframe',
          type: 'string',
          description: 'Timeframe (hour, day, week)',
          required: false,
        },
        {
          name: 'industry',
          type: 'string',
          description: 'Industry focus',
          required: false,
        },
        {
          name: 'userId',
          type: 'string',
          description: 'User ID for personalization',
          required: false,
        },
      ],
      implementation: async ({ platform, timeframe, industry, userId }: any) => {
        try {
          const trendingTopics = await tavilyService.getTrendingTopics({
            platform: platform as 'twitter' | 'linkedin' | 'general',
            timeframe: timeframe as 'hour' | 'day' | 'week' || 'day',
            industry: industry || undefined,
          }, userId || 'anonymous');

          return {
            topics: trendingTopics.topics,
            lastUpdated: trendingTopics.lastUpdated,
            platform,
            timeframe: timeframe || 'day',
          };
        } catch (error) {
          console.error('Get trending topics error:', error);
          return {
            topics: [],
            error: 'Failed to get trending topics',
          };
        }
      },
    },
    {
      name: 'verify_content',
      description: 'Verify content claims with real-time fact checking',
      argumentAnnotations: [
        {
          name: 'content',
          type: 'string',
          description: 'Content to verify',
          required: true,
        },
        {
          name: 'userId',
          type: 'string',
          description: 'User ID for tracking',
          required: false,
        },
      ],
      implementation: async ({ content, userId }: any) => {
        try {
          const verification = await enhancedAiService.verifyContentClaims(
            content,
            userId || 'anonymous'
          );

          return {
            verifications: verification.verifications,
            overallCredibility: verification.overallCredibility,
            flaggedClaims: verification.flaggedClaims,
            suggestedCorrections: verification.suggestedCorrections,
          };
        } catch (error) {
          console.error('Verify content error:', error);
          return {
            verifications: [],
            overallCredibility: 0.5,
            error: 'Content verification failed',
          };
        }
      },
    },
    {
      name: 'get_personalized_recommendations',
      description: 'Get personalized content recommendations based on user memory',
      argumentAnnotations: [
        {
          name: 'topic',
          type: 'string',
          description: 'Topic for recommendations',
          required: true,
        },
        {
          name: 'userId',
          type: 'string',
          description: 'User ID for personalization',
          required: true,
        },
      ],
      implementation: async ({ topic, userId }: any) => {
        try {
          const recommendations = await mem0Service.getPersonalizedRecommendations(
            { userId },
            topic
          );

          return {
            recommendations: recommendations.recommendations,
            patterns: recommendations.patterns,
            insights: recommendations.insights,
            topic,
          };
        } catch (error) {
          console.error('Get personalized recommendations error:', error);
          return {
            recommendations: [],
            patterns: [],
            insights: [],
            error: 'Failed to get personalized recommendations',
          };
        }
      },
    },
    {
      name: 'store_user_preferences',
      description: 'Store user preferences for personalized content generation',
      argumentAnnotations: [
        {
          name: 'preferences',
          type: 'object',
          description: 'User preferences object',
          required: true,
        },
        {
          name: 'userId',
          type: 'string',
          description: 'User ID',
          required: true,
        },
      ],
      implementation: async ({ preferences, userId }: any) => {
        try {
          await mem0Service.storeUserPreferences(
            { userId },
            preferences as any
          );

          return {
            success: true,
            message: 'User preferences stored successfully',
          };
        } catch (error) {
          console.error('Store user preferences error:', error);
          return {
            success: false,
            error: 'Failed to store user preferences',
          };
        }
      },
    },
    {
      name: 'get_content_analytics',
      description: 'Get personalized content analytics and performance insights',
      argumentAnnotations: [
        {
          name: 'userId',
          type: 'string',
          description: 'User ID',
          required: true,
        },
      ],
      implementation: async ({ userId }: any) => {
        try {
          const analytics = await enhancedAiService.getPersonalizedAnalytics(userId);

          return {
            analytics: analytics.contentAnalytics,
            recommendations: analytics.recommendations,
            trends: analytics.trends,
            performance: analytics.performance,
          };
        } catch (error) {
          console.error('Get content analytics error:', error);
          return {
            analytics: null,
            recommendations: [],
            trends: null,
            performance: null,
            error: 'Failed to get content analytics',
          };
        }
      },
    },
    {
      name: 'provide_feedback',
      description: 'Provide feedback on generated content to improve future recommendations',
      argumentAnnotations: [
        {
          name: 'contentId',
          type: 'string',
          description: 'Content ID',
          required: true,
        },
        {
          name: 'rating',
          type: 'number',
          description: 'Rating (1-5)',
          required: true,
        },
        {
          name: 'platform',
          type: 'string',
          description: 'Platform',
          required: true,
        },
        {
          name: 'tone',
          type: 'string',
          description: 'Tone',
          required: true,
        },
        {
          name: 'contentType',
          type: 'string',
          description: 'Content type',
          required: true,
        },
        {
          name: 'comments',
          type: 'string',
          description: 'Additional comments',
          required: false,
        },
        {
          name: 'userId',
          type: 'string',
          description: 'User ID',
          required: true,
        },
      ],
      implementation: async ({ contentId, rating, platform, tone, contentType, comments, userId }: any) => {
        try {
          await enhancedAiService.storeFeedback(userId, {
            contentId,
            rating,
            platform,
            tone,
            contentType,
            comments,
          });

          return {
            success: true,
            message: 'Feedback stored successfully',
          };
        } catch (error) {
          console.error('Provide feedback error:', error);
          return {
            success: false,
            error: 'Failed to store feedback',
          };
        }
      },
    },
  ],
});

export const copilotKitHandler = async (req: Request, res: Response) => {
  try {
    const handler = copilotKit.streamHttpServerResponse(req, res, openaiAdapter);
    await handler;
  } catch (error) {
    console.error('CopilotKit handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default copilotKitHandler; 