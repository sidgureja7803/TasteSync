import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { prisma } from '../index';

const router = Router();

// POST /api/auth/webhook - Clerk webhook for user creation/updates
router.post('/webhook', asyncHandler(async (req, res) => {
  const { type, data } = req.body;

  switch (type) {
    case 'user.created':
      await prisma.user.create({
        data: {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          avatar: data.image_url,
        },
      });
      break;

    case 'user.updated':
      await prisma.user.update({
        where: { clerkId: data.id },
        data: {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          avatar: data.image_url,
        },
      });
      break;

    case 'user.deleted':
      await prisma.user.delete({
        where: { clerkId: data.id },
      });
      break;
  }

  res.json({ success: true });
}));

// GET /api/auth/me - Get current user profile
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { clerkId: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      credits: true,
      plan: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' },
    });
  }

  res.json({
    success: true,
    data: user,
  });
}));

// PUT /api/auth/me - Update user profile
router.put('/me', authMiddleware, asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  const user = await prisma.user.update({
    where: { clerkId: req.user.id },
    data: {
      ...(name && { name }),
      ...(avatar && { avatar }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      credits: true,
      plan: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
}));

export default router; 