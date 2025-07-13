import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    requests: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientId = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max requests per window

  if (!store[clientId]) {
    store[clientId] = {
      requests: 0,
      resetTime: now + windowMs
    };
  }

  const clientData = store[clientId];

  // Reset if window has passed
  if (now > clientData.resetTime) {
    clientData.requests = 0;
    clientData.resetTime = now + windowMs;
  }

  // Increment request count
  clientData.requests++;

  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, maxRequests - clientData.requests).toString(),
    'X-RateLimit-Reset': Math.ceil(clientData.resetTime / 1000).toString()
  });

  // Check if limit exceeded
  if (clientData.requests > maxRequests) {
    return res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests, please try again later',
        statusCode: 429,
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      }
    });
  }

  next();
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 60 * 1000); // Clean every minute 