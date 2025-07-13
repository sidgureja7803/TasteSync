import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { prisma } from '../index';
import { getUserTokenUsage } from '../services/tokenTrackingService';

const router = Router();

// GET /api/tokens/usage - Get user's token usage statistics
router.get('/usage', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { period = 'month' } = req.query;

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

  // Get token usage statistics
  const usage = await getUserTokenUsage(user.id, period as 'day' | 'week' | 'month');

  // Get current credits
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { credits: true, plan: true }
  });

  res.json({
    success: true,
    data: {
      ...usage,
      currentCredits: currentUser?.credits || 0,
      plan: currentUser?.plan || 'FREE',
      period
    }
  });
}));

// GET /api/tokens/credits - Get user's current credits
router.get('/credits', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      credits: true,
      plan: true,
      createdAt: true
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  // Calculate credit limits based on plan
  const creditLimits = {
    FREE: 10000,
    PRO: 100000,
    ENTERPRISE: 1000000
  };

  const maxCredits = creditLimits[user.plan as keyof typeof creditLimits];
  const usedCredits = maxCredits - user.credits;
  const usagePercentage = (usedCredits / maxCredits) * 100;

  res.json({
    success: true,
    data: {
      currentCredits: user.credits,
      maxCredits,
      usedCredits,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      plan: user.plan,
      memberSince: user.createdAt
    }
  });
}));

// POST /api/tokens/purchase - Purchase additional credits (placeholder)
router.post('/purchase', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { amount, paymentMethod } = req.body;

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

  // Validate purchase amount
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid purchase amount' }
    });
  }

  // TODO: Implement actual payment processing
  // For now, this is a placeholder that simulates credit purchase
  
  // Calculate credit packages
  const creditPackages = {
    5000: 5.00,   // $5 for 5K credits
    25000: 20.00, // $20 for 25K credits
    100000: 75.00, // $75 for 100K credits
    500000: 300.00 // $300 for 500K credits
  };

  const cost = creditPackages[amount as keyof typeof creditPackages];
  
  if (!cost) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid credit package' }
    });
  }

  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Add credits to user account
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      credits: user.credits + amount
    }
  });

  res.json({
    success: true,
    data: {
      message: 'Credits purchased successfully',
      creditsAdded: amount,
      newBalance: updatedUser.credits,
      cost,
      transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  });
}));

// GET /api/tokens/pricing - Get credit pricing information
router.get('/pricing', asyncHandler(async (req: Request, res: Response) => {
  const pricing = {
    packages: [
      {
        id: 'starter',
        credits: 5000,
        price: 5.00,
        pricePerCredit: 0.001,
        popular: false,
        description: 'Perfect for trying out TasteSync'
      },
      {
        id: 'professional',
        credits: 25000,
        price: 20.00,
        pricePerCredit: 0.0008,
        popular: true,
        description: 'Best value for regular content creators'
      },
      {
        id: 'business',
        credits: 100000,
        price: 75.00,
        pricePerCredit: 0.00075,
        popular: false,
        description: 'For teams and high-volume users'
      },
      {
        id: 'enterprise',
        credits: 500000,
        price: 300.00,
        pricePerCredit: 0.0006,
        popular: false,
        description: 'Maximum value for enterprise users'
      }
    ],
    plans: {
      FREE: {
        monthlyCredits: 10000,
        price: 0,
        features: ['Basic content generation', 'All platforms', 'Email support']
      },
      PRO: {
        monthlyCredits: 100000,
        price: 29.99,
        features: ['Priority generation', 'Advanced analytics', 'Custom tones', 'Priority support']
      },
      ENTERPRISE: {
        monthlyCredits: 1000000,
        price: 99.99,
        features: ['Unlimited generation', 'Team collaboration', 'Custom integrations', 'Dedicated support']
      }
    }
  };

  res.json({
    success: true,
    data: pricing
  });
}));

// GET /api/tokens/history - Get detailed token usage history
router.get('/history', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 20, operation } = req.query;

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
    ...(operation && { operation: operation as string })
  };

  const [history, total] = await Promise.all([
    prisma.tokenUsage.findMany({
      where,
      skip: offset,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.tokenUsage.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      history,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

export default router; 