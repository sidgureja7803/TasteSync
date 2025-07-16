import { MemoryClient } from 'mem0ai';
import { trackTokenUsage } from './tokenTrackingService';

export interface MemoryContext {
  userId?: string;
  sessionId?: string;
  conversationId?: string;
  agentId?: string;
}

export interface UserPreferences {
  writingStyle: 'formal' | 'casual' | 'professional' | 'creative' | 'technical';
  tonePreference: string[];
  preferredPlatforms: string[];
  contentTypes: string[];
  targetAudience: string[];
  industryFocus: string[];
  topicInterests: string[];
  languagePreference: string;
  contentLength: 'short' | 'medium' | 'long';
  engagementStyle: 'direct' | 'storytelling' | 'data-driven' | 'emotional';
}

export interface ContentPattern {
  type: 'success' | 'failure' | 'preference';
  platform: string;
  tone: string;
  engagement: number;
  feedback: string;
  contentSample: string;
  timestamp: Date;
}

export interface ConversationMemory {
  userId: string;
  sessionId: string;
  messageId: string;
  userMessage: string;
  aiResponse: string;
  context: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | 'neutral';
}

export interface MemorySearchOptions {
  limit?: number;
  categories?: string[];
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'all';
  relevanceThreshold?: number;
}

class Mem0Service {
  private client: MemoryClient;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.MEM0_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('MEM0_API_KEY is required');
    }
    this.client = new MemoryClient({ apiKey: this.apiKey });
  }

  /**
   * Store user preferences in memory
   */
  async storeUserPreferences(context: MemoryContext, preferences: UserPreferences): Promise<void> {
    try {
      const content = `User preferences: writing style is ${preferences.writingStyle}, prefers tones: ${preferences.tonePreference.join(', ')}, platforms: ${preferences.preferredPlatforms.join(', ')}, content types: ${preferences.contentTypes.join(', ')}, target audience: ${preferences.targetAudience.join(', ')}, industry focus: ${preferences.industryFocus.join(', ')}, topic interests: ${preferences.topicInterests.join(', ')}, language: ${preferences.languagePreference}, content length: ${preferences.contentLength}, engagement style: ${preferences.engagementStyle}`;

      await this.client.add([{
        role: 'user',
        content: content,
      }], {
        user_id: context.userId || 'anonymous',
        metadata: {
          type: 'user_preferences',
          category: 'profile',
          timestamp: new Date().toISOString(),
        }
      });

      // Track token usage
      if (context.userId) {
        await trackTokenUsage(
          context.userId,
          'mem0-store',
          Math.floor(content.length / 4),
          'mem0_store_preferences'
        );
      }

    } catch (error) {
      console.error('Error storing user preferences:', error);
      throw new Error(`Failed to store preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve user preferences from memory
   */
  async getUserPreferences(context: MemoryContext): Promise<UserPreferences | null> {
    try {
      const memories = await this.client.search('user preferences writing style', {
        user_id: context.userId || 'anonymous',
        limit: 1,
      });

      if (memories.length > 0 && memories[0].memory) {
        // Parse the memory content to extract preferences
        const content = memories[0].memory;
        const preferences = this.parsePreferencesFromMemory(content);
        return preferences;
      }

      return null;
    } catch (error) {
      console.error('Error retrieving user preferences:', error);
      return null;
    }
  }

  /**
   * Store content creation patterns and feedback
   */
  async storeContentPattern(context: MemoryContext, pattern: ContentPattern): Promise<void> {
    try {
      const content = `Content pattern: ${pattern.type} pattern on ${pattern.platform} with ${pattern.tone} tone achieved ${pattern.engagement} engagement. Feedback: ${pattern.feedback}. Sample content: ${pattern.contentSample.substring(0, 200)}`;

      await this.client.add([{
        role: 'user',
        content: content,
      }], {
        user_id: context.userId || 'anonymous',
        metadata: {
          type: 'content_pattern',
          category: 'performance',
          platform: pattern.platform,
          tone: pattern.tone,
          patternType: pattern.type,
          engagement: pattern.engagement,
          timestamp: pattern.timestamp.toISOString(),
        }
      });

      // Track token usage
      if (context.userId) {
        await trackTokenUsage(
          context.userId,
          'mem0-store',
          Math.floor(content.length / 4),
          'mem0_store_pattern'
        );
      }

    } catch (error) {
      console.error('Error storing content pattern:', error);
      throw new Error(`Failed to store pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get successful content patterns for recommendations
   */
  async getSuccessfulPatterns(context: MemoryContext, platform?: string, tone?: string): Promise<ContentPattern[]> {
    try {
      let query = 'successful content pattern';
      if (platform) query += ` ${platform}`;
      if (tone) query += ` ${tone}`;

      const memories = await this.client.search(query, {
        user_id: context.userId || 'anonymous',
        limit: 10,
      });

      const patterns: ContentPattern[] = [];
      for (const memory of memories) {
        if (memory.memory) {
          const pattern = this.parsePatternFromMemory(memory.memory);
          if (pattern) {
            patterns.push(pattern);
          }
        }
      }

      return patterns;
    } catch (error) {
      console.error('Error retrieving successful patterns:', error);
      return [];
    }
  }

  /**
   * Store conversation memory for context
   */
  async storeConversation(context: MemoryContext, conversation: ConversationMemory): Promise<void> {
    try {
      const content = `Conversation: User asked "${conversation.userMessage}" and I responded "${conversation.aiResponse}". Context: ${conversation.context}`;

      await this.client.add([{
        role: 'user',
        content: content,
      }], {
        user_id: context.userId || 'anonymous',
        metadata: {
          type: 'conversation',
          category: 'interaction',
          sessionId: conversation.sessionId,
          messageId: conversation.messageId,
          timestamp: conversation.timestamp.toISOString(),
          feedback: conversation.feedback || 'neutral',
        }
      });

      // Track token usage
      if (context.userId) {
        await trackTokenUsage(
          context.userId,
          'mem0-store',
          Math.floor(content.length / 4),
          'mem0_store_conversation'
        );
      }

    } catch (error) {
      console.error('Error storing conversation:', error);
      throw new Error(`Failed to store conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get conversation history for context
   */
  async getConversationHistory(context: MemoryContext, options: MemorySearchOptions = {}): Promise<ConversationMemory[]> {
    try {
      const memories = await this.client.search('conversation user asked', {
        user_id: context.userId || 'anonymous',
        limit: options.limit || 20,
      });

      const conversations: ConversationMemory[] = [];
      for (const memory of memories) {
        if (memory.memory) {
          const conversation = this.parseConversationFromMemory(memory.memory);
          if (conversation) {
            conversations.push(conversation);
          }
        }
      }

      return conversations;
    } catch (error) {
      console.error('Error retrieving conversation history:', error);
      return [];
    }
  }

  /**
   * Store personalized content recommendations
   */
  async storePersonalizedInsight(context: MemoryContext, insight: {
    topic: string;
    recommendation: string;
    reasoning: string;
    confidence: number;
  }): Promise<void> {
    try {
      const content = `Personalized insight for ${insight.topic}: ${insight.recommendation}. Reasoning: ${insight.reasoning}. Confidence: ${insight.confidence}`;

      await this.client.add([{
        role: 'user',
        content: content,
      }], {
        user_id: context.userId || 'anonymous',
        metadata: {
          type: 'personalized_insight',
          category: 'recommendation',
          topic: insight.topic,
          confidence: insight.confidence,
          timestamp: new Date().toISOString(),
        }
      });

    } catch (error) {
      console.error('Error storing personalized insight:', error);
      throw new Error(`Failed to store insight: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get personalized recommendations based on stored memories
   */
  async getPersonalizedRecommendations(context: MemoryContext, topic: string): Promise<{
    recommendations: string[];
    patterns: ContentPattern[];
    insights: string[];
  }> {
    try {
      // Get relevant memories
      const [preferences, patterns, insightMemories] = await Promise.all([
        this.getUserPreferences(context),
        this.getSuccessfulPatterns(context),
        this.client.search(`personalized insight ${topic}`, {
          user_id: context.userId || 'anonymous',
          limit: 5,
        }),
      ]);

      // Generate recommendations based on memory
      const recommendations = this.generateRecommendations(preferences, patterns, topic);
      const insights = insightMemories.map(memory => memory.memory || '').filter(Boolean);

      return {
        recommendations,
        patterns: patterns.slice(0, 5),
        insights,
      };
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return {
        recommendations: [],
        patterns: [],
        insights: [],
      };
    }
  }

  /**
   * Update user preferences based on feedback
   */
  async updatePreferencesFromFeedback(context: MemoryContext, feedback: {
    action: string;
    result: 'positive' | 'negative';
    platform: string;
    tone: string;
    contentType: string;
  }): Promise<void> {
    try {
      const content = `Feedback: ${feedback.action} on ${feedback.platform} with ${feedback.tone} tone resulted in ${feedback.result} outcome for ${feedback.contentType} content`;

      await this.client.add([{
        role: 'user',
        content: content,
      }], {
        user_id: context.userId || 'anonymous',
        metadata: {
          type: 'feedback',
          category: 'learning',
          action: feedback.action,
          result: feedback.result,
          platform: feedback.platform,
          tone: feedback.tone,
          contentType: feedback.contentType,
          timestamp: new Date().toISOString(),
        }
      });

    } catch (error) {
      console.error('Error updating preferences from feedback:', error);
      throw new Error(`Failed to update preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search memories by content and context
   */
  async searchMemories(context: MemoryContext, query: string, options: MemorySearchOptions = {}): Promise<any[]> {
    try {
      const memories = await this.client.search(query, {
        user_id: context.userId || 'anonymous',
        limit: options.limit || 10,
      });

      // Track token usage
      if (context.userId) {
        await trackTokenUsage(
          context.userId,
          'mem0-search',
          Math.floor(query.length / 4),
          'mem0_search'
        );
      }

      return memories;
    } catch (error) {
      console.error('Error searching memories:', error);
      return [];
    }
  }

  /**
   * Delete specific memories
   */
  async deleteMemories(context: MemoryContext, memoryIds: string[]): Promise<void> {
    try {
      for (const memoryId of memoryIds) {
        await this.client.delete(memoryId);
      }
    } catch (error) {
      console.error('Error deleting memories:', error);
      throw new Error(`Failed to delete memories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's content creation analytics from memory
   */
  async getContentAnalytics(context: MemoryContext): Promise<{
    totalContent: number;
    successRate: number;
    preferredPlatforms: string[];
    effectiveTones: string[];
    recentPatterns: ContentPattern[];
  }> {
    try {
      const patterns = await this.getSuccessfulPatterns(context);
      const allMemories = await this.searchMemories(context, 'content pattern', { limit: 100 });

      const analytics = {
        totalContent: allMemories.length,
        successRate: patterns.length / Math.max(allMemories.length, 1),
        preferredPlatforms: this.extractTopPlatforms(patterns),
        effectiveTones: this.extractTopTones(patterns),
        recentPatterns: patterns.slice(0, 5),
      };

      return analytics;
    } catch (error) {
      console.error('Error getting content analytics:', error);
      return {
        totalContent: 0,
        successRate: 0,
        preferredPlatforms: [],
        effectiveTones: [],
        recentPatterns: [],
      };
    }
  }

  // Helper methods
  private parsePreferencesFromMemory(content: string): UserPreferences {
    // Extract preferences from memory content with fallbacks
    const defaultPreferences: UserPreferences = {
      writingStyle: 'professional',
      tonePreference: ['professional'],
      preferredPlatforms: ['twitter', 'linkedin'],
      contentTypes: ['article'],
      targetAudience: ['general'],
      industryFocus: ['technology'],
      topicInterests: ['ai', 'technology'],
      languagePreference: 'english',
      contentLength: 'medium',
      engagementStyle: 'direct',
    };

    try {
      // Simple parsing - in a real implementation, you'd use more sophisticated parsing
      const writingStyleMatch = content.match(/writing style is (\w+)/);
      if (writingStyleMatch) {
        defaultPreferences.writingStyle = writingStyleMatch[1] as any;
      }

      const tonesMatch = content.match(/prefers tones: ([^,]+)/);
      if (tonesMatch) {
        defaultPreferences.tonePreference = tonesMatch[1].split(', ');
      }

      const platformsMatch = content.match(/platforms: ([^,]+)/);
      if (platformsMatch) {
        defaultPreferences.preferredPlatforms = platformsMatch[1].split(', ');
      }

      return defaultPreferences;
    } catch (error) {
      console.error('Error parsing preferences from memory:', error);
      return defaultPreferences;
    }
  }

  private parsePatternFromMemory(content: string): ContentPattern | null {
    try {
      // Simple parsing - extract pattern information
      const match = content.match(/Content pattern: (\w+) pattern on (\w+) with (\w+) tone achieved ([\d.]+) engagement/);
      if (match) {
        return {
          type: match[1] as 'success' | 'failure' | 'preference',
          platform: match[2],
          tone: match[3],
          engagement: parseFloat(match[4]),
          feedback: 'positive', // simplified
          contentSample: 'sample content', // simplified
          timestamp: new Date(),
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private parseConversationFromMemory(content: string): ConversationMemory | null {
    try {
      // Simple parsing - extract conversation information
      const match = content.match(/Conversation: User asked "(.+?)" and I responded "(.+?)"/);
      if (match) {
        return {
          userId: 'user',
          sessionId: 'session',
          messageId: 'message',
          userMessage: match[1],
          aiResponse: match[2],
          context: 'context',
          timestamp: new Date(),
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private generateRecommendations(preferences: UserPreferences | null, patterns: ContentPattern[], topic: string): string[] {
    const recommendations = [];

    if (preferences) {
      recommendations.push(`Use your preferred ${preferences.writingStyle} writing style for ${topic}`);
      recommendations.push(`Focus on ${preferences.preferredPlatforms.join(', ')} platforms`);
      recommendations.push(`Target ${preferences.targetAudience.join(', ')} audience`);
    }

    if (patterns.length > 0) {
      const topPlatform = this.extractTopPlatforms(patterns)[0];
      const topTone = this.extractTopTones(patterns)[0];
      if (topPlatform && topTone) {
        recommendations.push(`Consider using ${topTone} tone on ${topPlatform} - it's been successful for you`);
      }
    }

    return recommendations.slice(0, 5);
  }

  private extractTopPlatforms(patterns: ContentPattern[]): string[] {
    const platformCount = patterns.reduce((acc, pattern) => {
      acc[pattern.platform] = (acc[pattern.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(platformCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([platform]) => platform);
  }

  private extractTopTones(patterns: ContentPattern[]): string[] {
    const toneCount = patterns.reduce((acc, pattern) => {
      acc[pattern.tone] = (acc[pattern.tone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(toneCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tone]) => tone);
  }
}

export const mem0Service = new Mem0Service(); 