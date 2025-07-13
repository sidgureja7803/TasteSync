import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { prisma } from '../index';
import { importFromNotion } from '../services/notionService';
import { importFromGoogleDocs } from '../services/googleDocsService';

const router = Router();

// POST /api/documents/import - Import content from external sources
router.post('/import', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { source, url, documentId, accessToken } = req.body;
  const userId = req.user!.id;

  let content = '';
  let title = '';
  let sourceId = '';

  switch (source) {
    case 'notion':
      const notionData = await importFromNotion(url, accessToken);
      content = notionData.content;
      title = notionData.title;
      sourceId = notionData.id;
      break;

    case 'google-docs':
      const googleData = await importFromGoogleDocs(documentId, accessToken);
      content = googleData.content;
      title = googleData.title;
      sourceId = googleData.id;
      break;

    case 'paste':
      content = req.body.content;
      title = req.body.title || 'Untitled Document';
      break;

    default:
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid source type' }
      });
  }

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

  // Create document
  const document = await prisma.document.create({
    data: {
      title,
      content,
      source: source.toUpperCase(),
      sourceId: sourceId || null,
      userId: user.id,
    },
  });

  res.json({
    success: true,
    data: document,
  });
}));

// GET /api/documents - Get user's documents
router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 10, search } = req.query;

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

  const where = {
    userId: user.id,
    ...(search && {
      OR: [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
      ],
    }),
  };

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip: offset,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        generatedContent: {
          select: {
            id: true,
            platform: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.document.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      documents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
}));

// GET /api/documents/:id - Get specific document
router.get('/:id', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
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

  const document = await prisma.document.findFirst({
    where: { id, userId: user.id },
    include: {
      generatedContent: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      error: { message: 'Document not found' },
    });
  }

  res.json({
    success: true,
    data: document,
  });
}));

// PUT /api/documents/:id - Update document
router.put('/:id', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;
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

  const document = await prisma.document.updateMany({
    where: { id, userId: user.id },
    data: {
      ...(title && { title }),
      ...(content && { content }),
    },
  });

  if (document.count === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Document not found' },
    });
  }

  const updatedDocument = await prisma.document.findUnique({
    where: { id },
  });

  res.json({
    success: true,
    data: updatedDocument,
  });
}));

// DELETE /api/documents/:id - Delete document
router.delete('/:id', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
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

  const document = await prisma.document.deleteMany({
    where: { id, userId: user.id },
  });

  if (document.count === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Document not found' },
    });
  }

  res.json({
    success: true,
    message: 'Document deleted successfully',
  });
}));

export default router; 