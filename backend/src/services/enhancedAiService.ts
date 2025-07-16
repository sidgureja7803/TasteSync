import Together from 'together-ai';
import { tavilyService, TavilySearchOptions, TrendingTopicsRequest, ContentResearchRequest } from './tavilyService';
import { mem0Service, MemoryContext, UserPreferences, ContentPattern, ConversationMemory } from './mem0Service';
import { trackTokenUsage } from './tokenTrackingService';

export interface EnhancedContentRequest {
  content: string;
  platform: 'twitter' | 'linkedin' | 'email';
  tone: string;
  userId: string;
  sessionId: string;
  includeResearch?: boolean;
  includeTrending?: boolean;
  useMemory?: boolean;
}

export interface EnhancedContentResponse {
  generatedContent: string;
  researchInsights?: any;
  trendingTopics?: any;
  personalizedRecommendations?: any;
  memoryContext?: any;
  sources?: string[];
  confidence: number;
  suggestions: string[];
}

export interface ResearchEnhancedRequest {
  topic: string;
  contentType: 'article' | 'social' | 'newsletter' | 'blog';
  platform: string;
  userId: string;
  competitive?: boolean;
  timeframe?: 'hour' | 'day' | 'week';
}

class EnhancedAiService {
  private together: Together;

  constructor() {
    this.together = new Together({
      apiKey: process.env.TOGETHER_API_KEY || '',
    });
  }

  /**
   * Generate content with research, trending topics, and personalized memory
   */
  async generateEnhancedContent(request: EnhancedContentRequest): Promise<EnhancedContentResponse> {
    const startTime = Date.now();
    const memoryContext: MemoryContext = {
      userId: request.userId,
      sessionId: request.sessionId,
    };

    try {
      // Parallel execution for better performance
      const [
        researchInsights,
        trendingTopics,
        personalizedRecommendations,
        conversationHistory
      ] = await Promise.all([
        request.includeResearch ? this.getResearchInsights(request) : Promise.resolve(null),
        request.includeTrending ? this.getTrendingInsights(request) : Promise.resolve(null),
        request.useMemory ? mem0Service.getPersonalizedRecommendations(memoryContext, request.content) : Promise.resolve(null),
        request.useMemory ? mem0Service.getConversationHistory(memoryContext, { limit: 5 }) : Promise.resolve(null)
      ]);

      // Build enhanced context for content generation
      const enhancedContext = this.buildEnhancedContext({
        originalContent: request.content,
        platform: request.platform,
        tone: request.tone,
        researchInsights,
        trendingTopics,
        personalizedRecommendations,
        conversationHistory
      });

      // Generate content with enhanced context
      const generatedContent = await this.generateContentWithContext(enhancedContext, request);

      // Store interaction in memory for future personalization
      if (request.useMemory) {
        await this.storeInteractionMemory(memoryContext, {
          userRequest: request.content,
          generatedContent,
          platform: request.platform,
          tone: request.tone,
          context: enhancedContext
        });
      }

      const responseTime = Date.now() - startTime;

      // Track token usage
      await trackTokenUsage(
        request.userId,
        'deepseek-v3-enhanced',
        Math.floor((request.content.length + generatedContent.length) / 4),
        'enhanced_content_generation'
      );

      return {
        generatedContent,
        researchInsights,
        trendingTopics,
        personalizedRecommendations,
        memoryContext: {
          preferences: personalizedRecommendations,
          conversationHistory: conversationHistory?.slice(0, 3)
        },
        sources: this.extractSources(researchInsights, trendingTopics),
        confidence: this.calculateConfidence(researchInsights, trendingTopics, personalizedRecommendations),
        suggestions: this.generateSuggestions(personalizedRecommendations, trendingTopics)
      };

    } catch (error) {
      console.error('Enhanced content generation error:', error);
      throw new Error(`Enhanced content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Research-enhanced content creation
   */
  async createResearchEnhancedContent(request: ResearchEnhancedRequest): Promise<{
    content: string;
    research: any;
    insights: string[];
    competitiveAnalysis?: any;
    sources: string[];
  }> {
    const memoryContext: MemoryContext = { userId: request.userId };

    try {
      // Get comprehensive research
      const research = await tavilyService.researchContent({
        topic: request.topic,
        contentType: request.contentType,
        competitive: request.competitive || false
      }, request.userId);

      // Get trending topics related to the topic
      const trendingTopics = await tavilyService.getTrendingTopics({
        platform: request.platform as any,
        timeframe: request.timeframe || 'day'
      }, request.userId);

      // Get personalized recommendations
      const personalizedRecommendations = await mem0Service.getPersonalizedRecommendations(
        memoryContext,
        request.topic
      );

      // Generate content based on research
      const content = await this.generateResearchBasedContent({
        topic: request.topic,
        contentType: request.contentType,
        platform: request.platform,
        research,
        trendingTopics,
        personalizedRecommendations
      });

      // Store successful pattern if content is generated
      if (content) {
        await mem0Service.storeContentPattern(memoryContext, {
          type: 'success',
          platform: request.platform,
          tone: 'research-driven',
          engagement: 0.8, // Placeholder - would be updated based on actual performance
          feedback: 'Research-enhanced content generated successfully',
          contentSample: content.substring(0, 200),
          timestamp: new Date()
        });
      }

      return {
        content,
        research,
        insights: research.insights.map(insight => insight.summary),
        competitiveAnalysis: research.competitiveAnalysis,
        sources: research.insights.flatMap(insight => insight.sources)
      };

    } catch (error) {
      console.error('Research-enhanced content creation error:', error);
      throw new Error(`Research-enhanced content creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify content claims with real-time fact checking
   */
  async verifyContentClaims(content: string, userId: string): Promise<{
    verifications: any[];
    overallCredibility: number;
    flaggedClaims: string[];
    suggestedCorrections: string[];
  }> {
    try {
      // Extract claims from content
      const claims = this.extractClaims(content);
      
      // Verify claims using Tavily
      const verifications = await tavilyService.verifyInformation(claims, userId);

      // Calculate overall credibility
      const overallCredibility = this.calculateOverallCredibility(verifications.verifications);

      // Identify flagged claims
      const flaggedClaims = verifications.verifications
        .filter(v => !v.isVerified || v.confidence < 0.7)
        .map(v => v.claim);

      // Generate suggested corrections
      const suggestedCorrections = await this.generateCorrections(flaggedClaims, verifications.verifications);

      return {
        verifications: verifications.verifications,
        overallCredibility,
        flaggedClaims,
        suggestedCorrections
      };

    } catch (error) {
      console.error('Content verification error:', error);
      throw new Error(`Content verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get personalized content analytics and insights
   */
  async getPersonalizedAnalytics(userId: string): Promise<{
    contentAnalytics: any;
    recommendations: string[];
    trends: any;
    performance: any;
  }> {
    const memoryContext: MemoryContext = { userId };

    try {
      const [contentAnalytics, trendingTopics] = await Promise.all([
        mem0Service.getContentAnalytics(memoryContext),
        tavilyService.getTrendingTopics({
          platform: 'general',
          timeframe: 'week'
        }, userId)
      ]);

      const recommendations = this.generateAnalyticsRecommendations(contentAnalytics, trendingTopics);

      return {
        contentAnalytics,
        recommendations,
        trends: trendingTopics,
        performance: {
          successRate: contentAnalytics.successRate,
          totalContent: contentAnalytics.totalContent,
          topPerformingPlatforms: contentAnalytics.preferredPlatforms,
          effectiveTones: contentAnalytics.effectiveTones
        }
      };

    } catch (error) {
      console.error('Personalized analytics error:', error);
      throw new Error(`Personalized analytics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store user feedback to improve future recommendations
   */
  async storeFeedback(userId: string, feedback: {
    contentId: string;
    rating: number;
    platform: string;
    tone: string;
    contentType: string;
    comments?: string;
  }): Promise<void> {
    const memoryContext: MemoryContext = { userId };

    try {
      // Store feedback in memory
      await mem0Service.updatePreferencesFromFeedback(memoryContext, {
        action: 'content_generation',
        result: feedback.rating >= 3 ? 'positive' : 'negative',
        platform: feedback.platform,
        tone: feedback.tone,
        contentType: feedback.contentType
      });

      // Store as content pattern
      await mem0Service.storeContentPattern(memoryContext, {
        type: feedback.rating >= 3 ? 'success' : 'failure',
        platform: feedback.platform,
        tone: feedback.tone,
        engagement: feedback.rating / 5,
        feedback: feedback.comments || `User rated ${feedback.rating}/5`,
        contentSample: `Content for ${feedback.contentType} on ${feedback.platform}`,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Feedback storage error:', error);
      throw new Error(`Feedback storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods
  private async getResearchInsights(request: EnhancedContentRequest): Promise<any> {
    return await tavilyService.researchContent({
      topic: request.content,
      contentType: 'social',
      targetAudience: 'general'
    }, request.userId);
  }

  private async getTrendingInsights(request: EnhancedContentRequest): Promise<any> {
    const platform = request.platform === 'email' ? 'general' : request.platform;
    return await tavilyService.getTrendingTopics({
      platform: platform as 'twitter' | 'linkedin' | 'general',
      timeframe: 'day'
    }, request.userId);
  }

  private buildEnhancedContext(params: {
    originalContent: string;
    platform: string;
    tone: string;
    researchInsights?: any;
    trendingTopics?: any;
    personalizedRecommendations?: any;
    conversationHistory?: any;
  }): string {
    let context = `Original content: ${params.originalContent}\n`;
    context += `Platform: ${params.platform}\n`;
    context += `Tone: ${params.tone}\n\n`;

    if (params.researchInsights) {
      context += `Research insights: ${params.researchInsights.insights.map((i: any) => i.summary).join(', ')}\n`;
    }

    if (params.trendingTopics) {
      context += `Trending topics: ${params.trendingTopics.topics.map((t: any) => t.topic).join(', ')}\n`;
    }

    if (params.personalizedRecommendations) {
      context += `Personalized recommendations: ${params.personalizedRecommendations.recommendations.join(', ')}\n`;
    }

    if (params.conversationHistory && params.conversationHistory.length > 0) {
      context += `Previous conversations: ${params.conversationHistory.map((c: any) => c.userMessage).join(', ')}\n`;
    }

    return context;
  }

  private async generateContentWithContext(context: string, request: EnhancedContentRequest): Promise<string> {
    const prompt = `
Based on the following context, generate optimized content for ${request.platform} with a ${request.tone} tone:

${context}

Platform guidelines:
- Twitter: Concise, engaging, max 280 characters
- LinkedIn: Professional, informative, business-focused  
- Email: Clear subject line, structured content, call-to-action

Generate content that:
1. Incorporates relevant research insights
2. Aligns with trending topics where appropriate
3. Follows personalized recommendations
4. Maintains the specified tone
5. Optimizes for the target platform

Content:`;

    const response = await this.together.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async generateResearchBasedContent(params: {
    topic: string;
    contentType: string;
    platform: string;
    research: any;
    trendingTopics: any;
    personalizedRecommendations: any;
  }): Promise<string> {
    const prompt = `
Create a ${params.contentType} about ${params.topic} for ${params.platform} based on the following research:

Research insights: ${params.research.insights.map((i: any) => i.summary).join('\n')}

Trending topics: ${params.trendingTopics.topics.map((t: any) => t.topic).join(', ')}

Personalized recommendations: ${params.personalizedRecommendations.recommendations.join('\n')}

Create compelling, accurate, and engaging content that:
1. Integrates key research findings
2. Connects to trending topics where relevant
3. Follows personalized recommendations
4. Is optimized for ${params.platform}
5. Maintains factual accuracy

Content:`;

    const response = await this.together.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.6,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async storeInteractionMemory(context: MemoryContext, interaction: {
    userRequest: string;
    generatedContent: string;
    platform: string;
    tone: string;
    context: string;
  }): Promise<void> {
    const conversation: ConversationMemory = {
      userId: context.userId || 'anonymous',
      sessionId: context.sessionId || 'session',
      messageId: Date.now().toString(),
      userMessage: interaction.userRequest,
      aiResponse: interaction.generatedContent,
      context: interaction.context,
      timestamp: new Date()
    };

    await mem0Service.storeConversation(context, conversation);
  }

  private extractSources(researchInsights: any, trendingTopics: any): string[] {
    const sources: string[] = [];
    
    if (researchInsights && researchInsights.insights) {
      sources.push(...researchInsights.insights.flatMap((insight: any) => insight.sources));
    }
    
    if (trendingTopics && trendingTopics.topics) {
      sources.push(...trendingTopics.topics.flatMap((topic: any) => topic.urls));
    }
    
    return [...new Set(sources)];
  }

  private calculateConfidence(researchInsights: any, trendingTopics: any, personalizedRecommendations: any): number {
    let confidence = 0.5; // Base confidence
    
    if (researchInsights && researchInsights.insights.length > 0) confidence += 0.2;
    if (trendingTopics && trendingTopics.topics.length > 0) confidence += 0.2;
    if (personalizedRecommendations && personalizedRecommendations.recommendations.length > 0) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private generateSuggestions(personalizedRecommendations: any, trendingTopics: any): string[] {
    const suggestions: string[] = [];
    
    if (personalizedRecommendations) {
      suggestions.push(...personalizedRecommendations.recommendations.slice(0, 3));
    }
    
    if (trendingTopics) {
      suggestions.push(`Consider incorporating trending topic: ${trendingTopics.topics[0]?.topic}`);
    }
    
    return suggestions;
  }

  private extractClaims(content: string): string[] {
    // Simple claim extraction - in production, use more sophisticated NLP
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.filter(sentence => 
      sentence.includes('is') || 
      sentence.includes('has') || 
      sentence.includes('will') ||
      sentence.includes('studies show') ||
      sentence.includes('research indicates')
    ).slice(0, 5);
  }

  private calculateOverallCredibility(verifications: any[]): number {
    if (verifications.length === 0) return 0.5;
    
    const avgConfidence = verifications.reduce((sum, v) => sum + v.confidence, 0) / verifications.length;
    const verifiedCount = verifications.filter(v => v.isVerified).length;
    const verificationRate = verifiedCount / verifications.length;
    
    return (avgConfidence + verificationRate) / 2;
  }

  private async generateCorrections(flaggedClaims: string[], verifications: any[]): Promise<string[]> {
    const corrections: string[] = [];
    
    for (const claim of flaggedClaims) {
      const verification = verifications.find(v => v.claim === claim);
      if (verification && verification.explanation) {
        corrections.push(`Consider revising: "${claim}" - ${verification.explanation}`);
      }
    }
    
    return corrections;
  }

  private generateAnalyticsRecommendations(analytics: any, trends: any): string[] {
    const recommendations: string[] = [];
    
    if (analytics.successRate < 0.5) {
      recommendations.push('Consider experimenting with different tones and platforms');
    }
    
    if (analytics.preferredPlatforms.length > 0) {
      recommendations.push(`Focus on your top-performing platforms: ${analytics.preferredPlatforms.join(', ')}`);
    }
    
    if (trends.topics.length > 0) {
      recommendations.push(`Consider creating content about trending topic: ${trends.topics[0].topic}`);
    }
    
    return recommendations;
  }
}

export const enhancedAiService = new EnhancedAiService(); 