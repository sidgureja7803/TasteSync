import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { enhancedAiService } from '../services/enhancedAiService';
import { tavilyService } from '../services/tavilyService';
import { mem0Service } from '../services/mem0Service';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/enhanced/generate-content
 * Generate enhanced content with research, trends, and memory
 */
router.post('/generate-content', async (req: Request, res: Response) => {
  try {
    const {
      content,
      platform,
      tone,
      includeResearch = false,
      includeTrending = false,
      useMemory = false,
    } = req.body;

    if (!content || !platform || !tone) {
      return res.status(400).json({
        error: 'Missing required fields: content, platform, tone',
      });
    }

    const enhancedResponse = await enhancedAiService.generateEnhancedContent({
      content,
      platform,
      tone,
      userId: req.user?.id || 'anonymous',
      sessionId: Date.now().toString(),
      includeResearch,
      includeTrending,
      useMemory,
    });

    res.json({
      success: true,
      data: enhancedResponse,
    });
  } catch (error) {
    console.error('Enhanced content generation error:', error);
    res.status(500).json({
      error: 'Failed to generate enhanced content',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/enhanced/research-content
 * Research and create content based on a topic
 */
router.post('/research-content', async (req: Request, res: Response) => {
  try {
    const {
      topic,
      contentType = 'article',
      platform = 'general',
      competitive = false,
      timeframe = 'day',
    } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: 'Missing required field: topic',
      });
    }

    const researchResponse = await enhancedAiService.createResearchEnhancedContent({
      topic,
      contentType,
      platform,
      userId: req.user?.id || 'anonymous',
      competitive,
      timeframe,
    });

    res.json({
      success: true,
      data: researchResponse,
    });
  } catch (error) {
    console.error('Research content error:', error);
    res.status(500).json({
      error: 'Failed to research content',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/enhanced/verify-content
 * Verify content claims with fact-checking
 */
router.post('/verify-content', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Missing required field: content',
      });
    }

    const verification = await enhancedAiService.verifyContentClaims(
      content,
      req.user?.id || 'anonymous'
    );

    res.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    console.error('Content verification error:', error);
    res.status(500).json({
      error: 'Failed to verify content',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/enhanced/trending-topics
 * Get trending topics for a platform
 */
router.get('/trending-topics', async (req: Request, res: Response) => {
  try {
    const {
      platform = 'general',
      timeframe = 'day',
      industry,
    } = req.query;

    const trendingTopics = await tavilyService.getTrendingTopics({
      platform: platform as 'twitter' | 'linkedin' | 'general',
      timeframe: timeframe as 'hour' | 'day' | 'week',
      industry: industry as string,
    }, req.user?.id || 'anonymous');

    res.json({
      success: true,
      data: trendingTopics,
    });
  } catch (error) {
    console.error('Trending topics error:', error);
    res.status(500).json({
      error: 'Failed to get trending topics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/enhanced/search
 * Search the web for information
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const {
      query,
      searchDepth = 'basic',
      maxResults = 10,
      includeDomains,
      excludeDomains,
      includeAnswer = true,
      includeRawContent = true,
      includeImages = false,
    } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Missing required field: query',
      });
    }

    const searchResults = await tavilyService.search({
      query,
      searchDepth,
      maxResults,
      includeDomains,
      excludeDomains,
      includeAnswer,
      includeRawContent,
      includeImages,
      userId: req.user?.id || 'anonymous',
    });

    res.json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to search',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/enhanced/analytics
 * Get personalized analytics
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    const analytics = await enhancedAiService.getPersonalizedAnalytics(userId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/enhanced/feedback
 * Store user feedback
 */
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const {
      contentId,
      rating,
      platform,
      tone,
      contentType,
      comments,
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    if (!contentId || !rating || !platform || !tone || !contentType) {
      return res.status(400).json({
        error: 'Missing required fields: contentId, rating, platform, tone, contentType',
      });
    }

    await enhancedAiService.storeFeedback(userId, {
      contentId,
      rating,
      platform,
      tone,
      contentType,
      comments,
    });

    res.json({
      success: true,
      message: 'Feedback stored successfully',
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      error: 'Failed to store feedback',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/enhanced/preferences
 * Store user preferences
 */
router.post('/preferences', async (req: Request, res: Response) => {
  try {
    const { preferences } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    if (!preferences) {
      return res.status(400).json({
        error: 'Missing required field: preferences',
      });
    }

    await mem0Service.storeUserPreferences(
      { userId },
      preferences
    );

    res.json({
      success: true,
      message: 'Preferences stored successfully',
    });
  } catch (error) {
    console.error('Preferences error:', error);
    res.status(500).json({
      error: 'Failed to store preferences',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/enhanced/preferences
 * Get user preferences
 */
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    const preferences = await mem0Service.getUserPreferences({ userId });

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      error: 'Failed to get preferences',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/enhanced/recommendations
 * Get personalized recommendations
 */
router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    if (!topic) {
      return res.status(400).json({
        error: 'Missing required field: topic',
      });
    }

    const recommendations = await mem0Service.getPersonalizedRecommendations(
      { userId },
      topic
    );

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/enhanced/memory/analytics
 * Get memory analytics
 */
router.get('/memory/analytics', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    const analytics = await mem0Service.getContentAnalytics({ userId });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Memory analytics error:', error);
    res.status(500).json({
      error: 'Failed to get memory analytics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/enhanced/memory/patterns
 * Get successful content patterns
 */
router.get('/memory/patterns', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { platform, tone } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    const patterns = await mem0Service.getSuccessfulPatterns(
      { userId },
      platform as string,
      tone as string
    );

    res.json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    console.error('Memory patterns error:', error);
    res.status(500).json({
      error: 'Failed to get memory patterns',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router; 