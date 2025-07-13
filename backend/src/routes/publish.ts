import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { prisma } from '../index';

const router = Router();

// Simple placeholder for Dev.to publishing
async function publishToDevTo(article: any): Promise<any> {
  // TODO: Implement actual Dev.to publishing
  return {
    id: Date.now(),
    url: `https://dev.to/placeholder/${Date.now()}`,
    title: article.title,
    published: false
  };
}

// POST /api/publish/devto - Publish content to Dev.to
router.post('/devto', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { contentId, title, tags, canonical_url } = req.body;
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

  // Get the generated content
  const content = await prisma.generatedContent.findFirst({
    where: { 
      id: contentId, 
      userId: user.id 
    },
    include: {
      document: true
    }
  });

  if (!content) {
    return res.status(404).json({
      success: false,
      error: { message: 'Content not found' }
    });
  }

  try {
    // Parse the content
    const parsedContent = JSON.parse(content.content);
    
    // Determine the article body based on platform
    let articleBody = '';
    if (content.platform === 'EMAIL') {
      articleBody = parsedContent.body || '';
    } else if (content.platform === 'LINKEDIN') {
      articleBody = parsedContent.post || '';
      if (parsedContent.carousel) {
        articleBody += '\n\n' + parsedContent.carousel.join('\n\n');
      }
    } else if (content.platform === 'TWITTER') {
      articleBody = parsedContent.tweets.join('\n\n');
    }

    // Publish to Dev.to
    const publishResult = await publishToDevTo({
      title: title || content.document.title,
      body_markdown: articleBody,
      tags: tags || [],
      canonical_url: canonical_url || null,
      published: false // Draft by default
    });

    // Update the content record to track publication
    await prisma.generatedContent.update({
      where: { id: contentId },
      data: {
        metadata: {
          ...((content.metadata as any) || {}),
          publishedTo: 'devto',
          publishedAt: new Date().toISOString(),
          devToId: publishResult.id,
          devToUrl: publishResult.url
        }
      }
    });

    res.json({
      success: true,
      data: {
        message: 'Content published to Dev.to successfully',
        devToUrl: publishResult.url,
        devToId: publishResult.id,
        status: 'draft'
      }
    });
  } catch (error) {
    console.error('Dev.to publishing error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to publish to Dev.to' }
    });
  }
}));

// POST /api/publish/export - Export content in various formats
router.post('/export', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { contentId, format = 'markdown' } = req.body;
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

  // Get the generated content
  const content = await prisma.generatedContent.findFirst({
    where: { 
      id: contentId, 
      userId: user.id 
    },
    include: {
      document: true
    }
  });

  if (!content) {
    return res.status(404).json({
      success: false,
      error: { message: 'Content not found' }
    });
  }

  try {
    const parsedContent = JSON.parse(content.content);
    let exportedContent = '';
    let filename = '';

    switch (format) {
      case 'markdown':
        exportedContent = formatAsMarkdown(parsedContent, content.platform);
        filename = `${content.document.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        break;
      
      case 'html':
        exportedContent = formatAsHtml(parsedContent, content.platform);
        filename = `${content.document.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
        break;
      
      case 'txt':
        exportedContent = formatAsText(parsedContent, content.platform);
        filename = `${content.document.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        break;
      
      case 'json':
        exportedContent = JSON.stringify(parsedContent, null, 2);
        filename = `${content.document.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid export format' }
        });
    }

    res.json({
      success: true,
      data: {
        content: exportedContent,
        filename,
        format,
        size: Buffer.byteLength(exportedContent, 'utf8')
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to export content' }
    });
  }
}));

// GET /api/publish/platforms - Get available publishing platforms
router.get('/platforms', asyncHandler(async (req: Request, res: Response) => {
  const platforms = [
    {
      id: 'devto',
      name: 'Dev.to',
      description: 'Publish to the Dev.to developer community',
      icon: '📝',
      supported: true,
      formats: ['markdown', 'html'],
      requirements: ['Dev.to API key']
    },
    {
      id: 'medium',
      name: 'Medium',
      description: 'Publish to Medium (coming soon)',
      icon: '📰',
      supported: false,
      formats: ['markdown', 'html'],
      requirements: ['Medium API key']
    },
    {
      id: 'hashnode',
      name: 'Hashnode',
      description: 'Publish to Hashnode (coming soon)',
      icon: '🌐',
      supported: false,
      formats: ['markdown'],
      requirements: ['Hashnode API key']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Post directly to LinkedIn (coming soon)',
      icon: '💼',
      supported: false,
      formats: ['text'],
      requirements: ['LinkedIn API access']
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Post directly to Twitter (coming soon)',
      icon: '🐦',
      supported: false,
      formats: ['text'],
      requirements: ['Twitter API access']
    }
  ];

  res.json({
    success: true,
    data: platforms
  });
}));

// GET /api/publish/history - Get publishing history
router.get('/history', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 10 } = req.query;

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

  const offset = (Number(page) - 1) * Number(limit);

  // Get published content
  const [publishedContent, total] = await Promise.all([
    prisma.generatedContent.findMany({
      where: {
        userId: user.id,
        metadata: {
          path: ['publishedTo'],
          not: null
        }
      },
      include: {
        document: {
          select: {
            title: true
          }
        }
      },
      skip: offset,
      take: Number(limit),
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.generatedContent.count({
      where: {
        userId: user.id,
        metadata: {
          path: ['publishedTo'],
          not: null
        }
      }
    })
  ]);

  const formattedHistory = publishedContent.map((content: any) => ({
    id: content.id,
    title: content.document.title,
    platform: content.platform,
    publishedTo: (content.metadata as any)?.publishedTo,
    publishedAt: (content.metadata as any)?.publishedAt,
    url: (content.metadata as any)?.devToUrl || (content.metadata as any)?.mediumUrl,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt
  }));

  res.json({
    success: true,
    data: {
      history: formattedHistory,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Helper functions for formatting content
function formatAsMarkdown(content: any, platform: string): string {
  switch (platform) {
    case 'TWITTER':
      return content.tweets.join('\n\n---\n\n');
    case 'LINKEDIN':
      let markdown = content.post + '\n\n';
      if (content.carousel) {
        markdown += '## Carousel Slides\n\n';
        content.carousel.forEach((slide: string, index: number) => {
          markdown += `### Slide ${index + 1}\n\n${slide}\n\n`;
        });
      }
      return markdown;
    case 'EMAIL':
      return `# ${content.subject}\n\n${content.body}`;
    default:
      return JSON.stringify(content, null, 2);
  }
}

function formatAsHtml(content: any, platform: string): string {
  switch (platform) {
    case 'EMAIL':
      return content.body; // Already in HTML format
    case 'TWITTER':
      return `<div class="twitter-content">${content.tweets.map((tweet: string) => `<p>${tweet}</p>`).join('')}</div>`;
    case 'LINKEDIN':
      let html = `<div class="linkedin-content"><p>${content.post}</p>`;
      if (content.carousel) {
        html += '<div class="carousel">';
        content.carousel.forEach((slide: string, index: number) => {
          html += `<div class="slide"><h3>Slide ${index + 1}</h3><p>${slide}</p></div>`;
        });
        html += '</div>';
      }
      html += '</div>';
      return html;
    default:
      return `<pre>${JSON.stringify(content, null, 2)}</pre>`;
  }
}

function formatAsText(content: any, platform: string): string {
  switch (platform) {
    case 'TWITTER':
      return content.tweets.join('\n\n');
    case 'LINKEDIN':
      let text = content.post + '\n\n';
      if (content.carousel) {
        text += 'Carousel Slides:\n\n';
        content.carousel.forEach((slide: string, index: number) => {
          text += `Slide ${index + 1}:\n${slide}\n\n`;
        });
      }
      return text;
    case 'EMAIL':
      return content.body.replace(/<[^>]*>/g, ''); // Strip HTML tags
    default:
      return JSON.stringify(content, null, 2);
  }
}

export default router; 