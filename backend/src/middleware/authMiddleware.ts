import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { createError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw createError('No token provided', 401);
    }

    // For now, we'll use a simple mock user for development
    // TODO: Implement proper Clerk verification
    req.user = {
      id: 'user_mock_id',
      email: 'test@example.com',
      name: 'Test User',
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      // For now, we'll use a simple mock user for development
      // TODO: Implement proper Clerk verification
      req.user = {
        id: 'user_mock_id',
        email: 'test@example.com',
        name: 'Test User',
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on auth errors
    next();
  }
}; 