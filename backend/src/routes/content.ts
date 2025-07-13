import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { prisma } from '../index';
import { ContentAnalystAgent } from '../agents/ContentAnalystAgent';
import { TwitterAgent } from '../agents/TwitterAgent';
import { LinkedInAgent } from '../agents/LinkedInAgent';
import { EmailAgent } from '../agents/EmailAgent';
import { PlatformRouterAgent } from '../agents/PlatformRouterAgent';
import { trackTokenUsage } from '../services/tokenTrackingService';

const router = Router();

// POST /api/content/analyze - Analyze document content
router.post('/analyze', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.body;
  const userId = req.user!.id;

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  // Get document
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: user.id }
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      error: { message: 'Document not found' }
    });
  }

  // Check if user has enough credits
  if (user.credits < 100) {
    return res.status(402).json({
      success: false,
      error: { message: 'Insufficient credits' }
    });
  }

  // Analyze content with AI
  const analyst = new ContentAnalystAgent();
  const analysisResult = await analyst.analyze(document.content);

  // Track token usage
  await trackTokenUsage(user.id, 'deepseek-v3', analysisResult.tokensUsed, 'content_analysis');

  // Deduct credits
  await prisma.user.update({
    where: { id: user.id },
    data: { credits: user.credits - analysisResult.tokensUsed }
  });

  res.json({
    success: true,
    data: analysisResult.data,
    tokensUsed: analysisResult.tokensUsed
  });
}));

// POST /api/content/generate - Generate platform-specific content
router.post('/generate', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { documentId, platform, tone, customInstructions, targetAudience } = req.body;
  const userId = req.user!.id;

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  // Get document
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: user.id }
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      error: { message: 'Document not found' }
    });
  }

  // Check if user has enough credits
  if (user.credits < 200) {
    return res.status(402).json({
      success: false,
      error: { message: 'Insufficient credits' }
    });
  }

  let agent;
  let generationResult;

  // Select appropriate agent based on platform
  switch (platform) {
    case 'twitter':
      agent = new TwitterAgent();
      generationResult = await agent.generate(document.content, tone, customInstructions, targetAudience);
      break;
    case 'linkedin':
      agent = new LinkedInAgent();
      generationResult = await agent.generate(document.content, tone, customInstructions, targetAudience);
      break;
    case 'email':
      agent = new EmailAgent();
      generationResult = await agent.generate(document.content, tone, customInstructions, targetAudience);
      break;
    default:
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid platform' }
      });
  }

  // Track token usage
  await trackTokenUsage(user.id, 'deepseek-v3', generationResult.tokensUsed, 'content_generation');

  // Save generated content
  const generatedContent = await prisma.generatedContent.create({
    data: {
      documentId,
      platform: platform.toUpperCase(),
      tone,
      content: JSON.stringify(generationResult.data),
      metadata: {
        customInstructions,
        targetAudience,
        model: 'deepseek-v3'
      },
      tokensUsed: generationResult.tokensUsed,
      userId: user.id
    }
  });

  // Deduct credits
  await prisma.user.update({
    where: { id: user.id },
    data: { credits: user.credits - generationResult.tokensUsed }
  });

  res.json({
    success: true,
    data: {
      id: generatedContent.id,
      content: generationResult.data,
      tokensUsed: generationResult.tokensUsed
    }
  });
}));

// POST /api/content/suggest-platforms - Suggest optimal platforms for content
router.post('/suggest-platforms', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.body;
  const userId = req.user!.id;

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  // Get document
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: user.id }
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      error: { message: 'Document not found' }
    });
  }

  // Check if user has enough credits
  if (user.credits < 50) {
    return res.status(402).json({
      success: false,
      error: { message: 'Insufficient credits' }
    });
  }

  // Get platform suggestions
  const router = new PlatformRouterAgent();
  const suggestions = await router.suggestPlatforms(document.content);

  // Track token usage
  await trackTokenUsage(user.id, 'deepseek-v3', suggestions.tokensUsed, 'platform_suggestion');

  // Deduct credits
  await prisma.user.update({
    where: { id: user.id },
    data: { credits: user.credits - suggestions.tokensUsed }
  });

  res.json({
    success: true,
    data: suggestions.data,
    tokensUsed: suggestions.tokensUsed
  });
}));

// GET /api/content/generated/:documentId - Get generated content for a document
router.get('/generated/:documentId', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const userId = req.user!.id;
  const { platform } = req.query;

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  const where = {
    documentId,
    userId: user.id,
    ...(platform && { platform: (platform as string).toUpperCase() })
  };

  const generatedContent = await prisma.generatedContent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      document: {
        select: {
          title: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: generatedContent.map(content => ({
      ...content,
      content: JSON.parse(content.content)
    }))
  });
}));

// PUT /api/content/generated/:id - Update generated content
router.put('/generated/:id', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, tone } = req.body;
  const userId = req.user!.id;

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  const updatedContent = await prisma.generatedContent.updateMany({
    where: { id, userId: user.id },
    data: {
      ...(content && { content: JSON.stringify(content) }),
      ...(tone && { tone })
    }
  });

  if (updatedContent.count === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Generated content not found' }
    });
  }

  const result = await prisma.generatedContent.findUnique({
    where: { id }
  });

  res.json({
    success: true,
    data: {
      ...result,
      content: JSON.parse(result!.content)
    }
  });
}));

// DELETE /api/content/generated/:id - Delete generated content
router.delete('/generated/:id', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  const deletedContent = await prisma.generatedContent.deleteMany({
    where: { id, userId: user.id }
  });

  if (deletedContent.count === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Generated content not found' }
    });
  }

  res.json({
    success: true,
    message: 'Generated content deleted successfully'
  });
}));

export default router; 