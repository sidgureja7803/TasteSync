import { prisma } from '../index';

export async function trackTokenUsage(
  userId: string,
  model: string,
  tokensUsed: number,
  operation: string
): Promise<void> {
  try {
    // Calculate cost based on model and tokens
    const cost = calculateCost(model, tokensUsed);

    await prisma.tokenUsage.create({
      data: {
        userId,
        model,
        inputTokens: Math.floor(tokensUsed * 0.7), // Estimate input tokens
        outputTokens: Math.floor(tokensUsed * 0.3), // Estimate output tokens
        totalTokens: tokensUsed,
        cost,
        operation,
      },
    });
  } catch (error) {
    console.error('Error tracking token usage:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

function calculateCost(model: string, tokens: number): number {
  // Pricing per 1000 tokens (example rates)
  const pricing = {
    'deepseek-v3': 0.0014, // $0.0014 per 1k tokens
    'gpt-4': 0.03,
    'gpt-3.5-turbo': 0.002,
    'claude-3': 0.015,
  };

  const rate = pricing[model as keyof typeof pricing] || 0.001;
  return (tokens / 1000) * rate;
}

export async function getUserTokenUsage(userId: string, period: 'day' | 'week' | 'month' = 'month') {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  const usage = await prisma.tokenUsage.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const summary = usage.reduce(
    (acc: { totalTokens: number; totalCost: number; operations: number }, curr: any) => ({
      totalTokens: acc.totalTokens + curr.totalTokens,
      totalCost: acc.totalCost + curr.cost,
      operations: acc.operations + 1,
    }),
    { totalTokens: 0, totalCost: 0, operations: 0 }
  );

  const byModel = usage.reduce((acc: Record<string, { tokens: number; cost: number; operations: number }>, curr: any) => {
    if (!acc[curr.model]) {
      acc[curr.model] = { tokens: 0, cost: 0, operations: 0 };
    }
    acc[curr.model].tokens += curr.totalTokens;
    acc[curr.model].cost += curr.cost;
    acc[curr.model].operations += 1;
    return acc;
  }, {} as Record<string, { tokens: number; cost: number; operations: number }>);

  const byOperation = usage.reduce((acc: Record<string, { tokens: number; cost: number; operations: number }>, curr: any) => {
    if (!acc[curr.operation]) {
      acc[curr.operation] = { tokens: 0, cost: 0, operations: 0 };
    }
    acc[curr.operation].tokens += curr.totalTokens;
    acc[curr.operation].cost += curr.cost;
    acc[curr.operation].operations += 1;
    return acc;
  }, {} as Record<string, { tokens: number; cost: number; operations: number }>);

  return {
    summary,
    byModel,
    byOperation,
    usage,
  };
} 