import { TavilyClient } from 'tavily';
import { trackTokenUsage } from './tokenTrackingService';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
  favicon?: string;
}

export interface TavilySearchOptions {
  query: string;
  searchDepth?: 'basic' | 'advanced';
  maxResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  includeAnswer?: boolean;
  includeRawContent?: boolean;
  includeImages?: boolean;
  userId?: string;
}

export interface TrendingTopicsRequest {
  platform: 'twitter' | 'linkedin' | 'general';
  industry?: string;
  timeframe?: 'hour' | 'day' | 'week';
  region?: string;
}

export interface ContentResearchRequest {
  topic: string;
  contentType: 'article' | 'social' | 'newsletter' | 'blog';
  targetAudience?: string;
  competitive?: boolean;
}

class TavilyService {
  private client: TavilyClient;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('TAVILY_API_KEY is required');
    }
    this.client = new TavilyClient({ apiKey: this.apiKey });
  }

  /**
   * Basic search functionality
   */
  async search(options: TavilySearchOptions): Promise<{
    results: TavilySearchResult[];
    answer?: string;
    query: string;
    responseTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      const searchResponse = await this.client.search({
        query: options.query,
        search_depth: options.searchDepth || 'basic',
        max_results: options.maxResults || 10,
        include_domains: options.includeDomains,
        exclude_domains: options.excludeDomains,
        include_answer: options.includeAnswer ?? true,
        include_raw_content: options.includeRawContent ?? true,
        include_images: options.includeImages ?? false,
      });

      const results: TavilySearchResult[] = searchResponse.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: parseFloat(result.score) || 0,
        published_date: result.published_date,
        favicon: result.favicon,
      }));

      const responseTime = Date.now() - startTime;

      // Track token usage for cost management
      if (options.userId) {
        await trackTokenUsage(
          options.userId,
          'tavily-search',
          Math.floor(JSON.stringify(results).length / 4),
          'tavily_search'
        );
      }

      return {
        results,
        answer: searchResponse.answer,
        query: options.query,
        responseTime,
      };

    } catch (error) {
      console.error('Tavily search error:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Research trending topics for content creation
   */
  async getTrendingTopics(request: TrendingTopicsRequest, userId?: string): Promise<{
    topics: Array<{
      topic: string;
      relevance: number;
      sentiment: 'positive' | 'negative' | 'neutral';
      urls: string[];
      summary: string;
    }>;
    lastUpdated: string;
  }> {
    const queries = this.buildTrendingQueries(request);
    const allResults: TavilySearchResult[] = [];

    // Search multiple trending-related queries
    for (const query of queries) {
      const searchResult = await this.search({
        query,
        searchDepth: 'advanced',
        maxResults: 5,
        includeAnswer: true,
        userId,
      });
      allResults.push(...searchResult.results);
    }

    // Process and categorize results
    const topics = await this.processTrendingTopics(allResults);

    return {
      topics,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Research content for specific topics
   */
  async researchContent(request: ContentResearchRequest, userId?: string): Promise<{
    insights: Array<{
      title: string;
      summary: string;
      keyPoints: string[];
      sources: string[];
      sentiment: string;
      credibility: number;
    }>;
    competitiveAnalysis?: Array<{
      competitor: string;
      approach: string;
      strength: string;
      opportunity: string;
    }>;
    suggestions: string[];
  }> {
    const queries = this.buildContentResearchQueries(request);
    const allResults: TavilySearchResult[] = [];

    for (const query of queries) {
      const searchResult = await this.search({
        query,
        searchDepth: 'advanced',
        maxResults: 8,
        includeAnswer: true,
        userId,
      });
      allResults.push(...searchResult.results);
    }

    const insights = await this.processContentInsights(allResults);
    const competitiveAnalysis = request.competitive 
      ? await this.processCompetitiveAnalysis(allResults, request.topic)
      : undefined;

    const suggestions = await this.generateContentSuggestions(insights, request);

    return {
      insights,
      competitiveAnalysis,
      suggestions,
    };
  }

  /**
   * Get real-time information for content verification
   */
  async verifyInformation(claims: string[], userId?: string): Promise<{
    verifications: Array<{
      claim: string;
      isVerified: boolean;
      confidence: number;
      sources: string[];
      explanation: string;
      lastChecked: string;
    }>;
  }> {
    const verifications = [];

    for (const claim of claims) {
      const searchResult = await this.search({
        query: `verify fact check "${claim}"`,
        searchDepth: 'advanced',
        maxResults: 5,
        includeAnswer: true,
        userId,
      });

      const verification = await this.processFactCheck(claim, searchResult.results);
      verifications.push({
        ...verification,
        lastChecked: new Date().toISOString(),
      });
    }

    return { verifications };
  }

  // Helper methods
  private buildTrendingQueries(request: TrendingTopicsRequest): string[] {
    const { platform, industry, timeframe } = request;
    const baseQueries = [
      `trending ${platform} topics ${timeframe || 'today'}`,
      `viral ${platform} content ${timeframe || 'today'}`,
      `${platform} trending hashtags ${timeframe || 'today'}`,
    ];

    if (industry) {
      baseQueries.push(
        `${industry} trending topics ${platform}`,
        `${industry} news ${platform} ${timeframe || 'today'}`
      );
    }

    return baseQueries;
  }

  private buildContentResearchQueries(request: ContentResearchRequest): string[] {
    const { topic, contentType, targetAudience } = request;
    const queries = [
      `${topic} ${contentType} content examples`,
      `${topic} latest news updates`,
      `${topic} industry insights`,
      `${topic} best practices`,
    ];

    if (targetAudience) {
      queries.push(`${topic} for ${targetAudience}`);
    }

    if (request.competitive) {
      queries.push(`${topic} competitor analysis`);
    }

    return queries;
  }

  private async processTrendingTopics(results: TavilySearchResult[]): Promise<Array<{
    topic: string;
    relevance: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    urls: string[];
    summary: string;
  }>> {
    // Group results by similar topics and analyze sentiment
    const topics = [];
    const processedTopics = new Set();

    for (const result of results) {
      const topic = this.extractTopicFromTitle(result.title);
      if (!processedTopics.has(topic)) {
        processedTopics.add(topic);
        
        const relatedResults = results.filter(r => 
          r.title.toLowerCase().includes(topic.toLowerCase()) ||
          r.content.toLowerCase().includes(topic.toLowerCase())
        );

        topics.push({
          topic,
          relevance: relatedResults.length * 0.1 + Math.random() * 0.1, // Simplified relevance scoring
          sentiment: this.analyzeSentiment(relatedResults),
          urls: relatedResults.map(r => r.url),
          summary: this.generateTopicSummary(relatedResults),
        });
      }
    }

    return topics.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }

  private async processContentInsights(results: TavilySearchResult[]): Promise<Array<{
    title: string;
    summary: string;
    keyPoints: string[];
    sources: string[];
    sentiment: string;
    credibility: number;
  }>> {
    return results.map(result => ({
      title: result.title,
      summary: this.generateSummary(result.content),
      keyPoints: this.extractKeyPoints(result.content),
      sources: [result.url],
      sentiment: this.analyzeSentiment([result]),
      credibility: result.score,
    }));
  }

  private async processCompetitiveAnalysis(results: TavilySearchResult[], topic: string): Promise<Array<{
    competitor: string;
    approach: string;
    strength: string;
    opportunity: string;
  }>> {
    // Simplified competitive analysis
    return results.slice(0, 5).map(result => ({
      competitor: this.extractCompetitorName(result.url),
      approach: this.summarizeApproach(result.content),
      strength: this.identifyStrength(result.content),
      opportunity: this.identifyOpportunity(result.content),
    }));
  }

  private async generateContentSuggestions(insights: any[], request: ContentResearchRequest): Promise<string[]> {
    const suggestions = [
      `Create a comprehensive guide about ${request.topic}`,
      `Develop a case study showcasing ${request.topic} success stories`,
      `Write an opinion piece on the future of ${request.topic}`,
      `Create an infographic summarizing key ${request.topic} statistics`,
      `Develop a how-to tutorial for ${request.topic}`,
    ];

    return suggestions.slice(0, 5);
  }

  private async processFactCheck(claim: string, results: TavilySearchResult[]): Promise<{
    claim: string;
    isVerified: boolean;
    confidence: number;
    sources: string[];
    explanation: string;
  }> {
    const factCheckSources = results.filter(r => 
      r.url.includes('factcheck') || 
      r.url.includes('snopes') || 
      r.url.includes('politifact') ||
      r.content.toLowerCase().includes('fact check')
    );

    return {
      claim,
      isVerified: factCheckSources.length > 0,
      confidence: Math.min(factCheckSources.length * 0.3, 1.0),
      sources: factCheckSources.map(s => s.url),
      explanation: factCheckSources.length > 0 
        ? factCheckSources[0].content.substring(0, 200) + '...'
        : 'No fact-checking sources found',
    };
  }

  // Utility methods
  private extractTopicFromTitle(title: string): string {
    return title.split(' ').slice(0, 3).join(' ');
  }

  private analyzeSentiment(results: TavilySearchResult[]): 'positive' | 'negative' | 'neutral' {
    // Simplified sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'success', 'growth'];
    const negativeWords = ['bad', 'terrible', 'awful', 'failure', 'decline', 'crisis', 'problem'];

    const allText = results.map(r => r.content).join(' ').toLowerCase();
    const positiveCount = positiveWords.reduce((count, word) => count + (allText.match(new RegExp(word, 'g')) || []).length, 0);
    const negativeCount = negativeWords.reduce((count, word) => count + (allText.match(new RegExp(word, 'g')) || []).length, 0);

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private generateTopicSummary(results: TavilySearchResult[]): string {
    return results[0]?.content.substring(0, 200) + '...' || 'No summary available';
  }

  private generateSummary(content: string): string {
    return content.substring(0, 300) + '...';
  }

  private extractKeyPoints(content: string): string[] {
    const sentences = content.split('.').filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  private extractCompetitorName(url: string): string {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.split('.')[0];
    } catch {
      return 'Unknown';
    }
  }

  private summarizeApproach(content: string): string {
    return content.substring(0, 100) + '...';
  }

  private identifyStrength(content: string): string {
    return 'Comprehensive content coverage'; // Simplified
  }

  private identifyOpportunity(content: string): string {
    return 'Better user engagement'; // Simplified
  }
}

export const tavilyService = new TavilyService(); 