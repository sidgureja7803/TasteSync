import Together from 'together-ai';

export interface PlatformSuggestion {
  platform: string;
  score: number;
  reasons: string[];
  optimizations: string[];
}

export interface PlatformRecommendations {
  primary: PlatformSuggestion;
  secondary: PlatformSuggestion[];
  analytics: {
    contentType: string;
    targetAudience: string;
    tone: string;
    engagement: string;
  };
}

export interface PlatformRouterResponse {
  success: boolean;
  data?: PlatformRecommendations;
  error?: string;
  tokensUsed: number;
}

export class PlatformRouterAgent {
  private together: Together;

  constructor() {
    this.together = new Together({
      apiKey: process.env.TOGETHER_API_KEY || '',
    });
  }

  async suggestPlatforms(content: string): Promise<PlatformRouterResponse> {
    try {
      const prompt = this.buildSuggestionPrompt(content);
      
      const response = await this.together.chat.completions.create({
        model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a social media strategy expert. Analyze content and recommend the best platforms for distribution based on content type, audience, and engagement potential.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.4,
        stream: false
      });

      const generatedText = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      try {
        const suggestions = JSON.parse(generatedText);
        
        // Validate and format the suggestions
        const formattedSuggestions = this.formatPlatformSuggestions(suggestions);
        
        return {
          success: true,
          data: formattedSuggestions,
          tokensUsed
        };
      } catch (parseError) {
        // If JSON parsing fails, create basic suggestions
        return {
          success: true,
          data: this.createBasicSuggestions(content),
          tokensUsed
        };
      }
    } catch (error) {
      console.error('Platform suggestion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensUsed: 0
      };
    }
  }

  private buildSuggestionPrompt(content: string): string {
    return `
Analyze the following content and suggest the best social media platforms for distribution. Return a JSON object with this structure:

{
  "primary": {
    "platform": "twitter|linkedin|email",
    "score": number_0_to_100,
    "reasons": ["Array of reasons why this platform is best"],
    "optimizations": ["Array of optimization suggestions"]
  },
  "secondary": [
    {
      "platform": "twitter|linkedin|email",
      "score": number_0_to_100,
      "reasons": ["Array of reasons"],
      "optimizations": ["Array of optimization suggestions"]
    }
  ],
  "analytics": {
    "contentType": "article|tutorial|news|opinion|case-study|list|how-to",
    "targetAudience": "professionals|developers|marketers|general|students",
    "tone": "professional|casual|educational|promotional|conversational",
    "engagement": "high|medium|low"
  }
}

Consider these factors:
- Content length and complexity
- Target audience and demographics
- Content type (educational, promotional, news, etc.)
- Engagement potential
- Platform-specific best practices
- Optimal content format for each platform

Content to analyze:
${content}

Return only the JSON object, no additional text.
    `;
  }

  private formatPlatformSuggestions(suggestions: any): PlatformRecommendations {
    const primary = suggestions.primary || {};
    const secondary = Array.isArray(suggestions.secondary) ? suggestions.secondary : [];
    const analytics = suggestions.analytics || {};

    // Validate primary suggestion
    if (!primary.platform || !['twitter', 'linkedin', 'email'].includes(primary.platform)) {
      throw new Error('Invalid primary platform suggestion');
    }

    // Validate secondary suggestions
    const validSecondary = secondary.filter((s: any) => 
      s.platform && ['twitter', 'linkedin', 'email'].includes(s.platform)
    );

    return {
      primary: {
        platform: primary.platform,
        score: Math.min(Math.max(primary.score || 0, 0), 100),
        reasons: Array.isArray(primary.reasons) ? primary.reasons : [],
        optimizations: Array.isArray(primary.optimizations) ? primary.optimizations : []
      },
      secondary: validSecondary.map((s: any) => ({
        platform: s.platform,
        score: Math.min(Math.max(s.score || 0, 0), 100),
        reasons: Array.isArray(s.reasons) ? s.reasons : [],
        optimizations: Array.isArray(s.optimizations) ? s.optimizations : []
      })),
      analytics: {
        contentType: analytics.contentType || 'article',
        targetAudience: analytics.targetAudience || 'general',
        tone: analytics.tone || 'professional',
        engagement: analytics.engagement || 'medium'
      }
    };
  }

  private createBasicSuggestions(content: string): PlatformRecommendations {
    const wordCount = content.split(/\s+/).length;
    const contentLower = content.toLowerCase();
    
    // Analyze content characteristics
    const isTechnical = /programming|code|development|api|software|technology/i.test(content);
    const isProfessional = /business|strategy|leadership|management|professional/i.test(content);
    const isNews = /today|yesterday|recently|breaking|announcement/i.test(content);
    const isEducational = /how to|tutorial|guide|learn|steps|tips/i.test(content);

    let primaryPlatform = 'twitter';
    let primaryScore = 70;
    let primaryReasons = ['Good for quick engagement'];

    // Decision logic
    if (wordCount > 500 && isProfessional) {
      primaryPlatform = 'linkedin';
      primaryScore = 85;
      primaryReasons = ['Professional content', 'Longer format suitable', 'Business audience'];
    } else if (wordCount > 1000 && isEducational) {
      primaryPlatform = 'email';
      primaryScore = 80;
      primaryReasons = ['Educational content', 'Detailed format', 'Engaged subscribers'];
    } else if (isNews || wordCount < 200) {
      primaryPlatform = 'twitter';
      primaryScore = 75;
      primaryReasons = ['Breaking news format', 'Quick consumption', 'Viral potential'];
    }

    // Create secondary suggestions
    const platforms = ['twitter', 'linkedin', 'email'];
    const secondary = platforms
      .filter(p => p !== primaryPlatform)
      .map(platform => ({
        platform,
        score: Math.max(primaryScore - 15, 40),
        reasons: this.getDefaultReasons(platform),
        optimizations: this.getDefaultOptimizations(platform)
      }));

    return {
      primary: {
        platform: primaryPlatform,
        score: primaryScore,
        reasons: primaryReasons,
        optimizations: this.getDefaultOptimizations(primaryPlatform)
      },
      secondary,
      analytics: {
        contentType: isEducational ? 'how-to' : isProfessional ? 'article' : 'news',
        targetAudience: isTechnical ? 'developers' : isProfessional ? 'professionals' : 'general',
        tone: isProfessional ? 'professional' : 'casual',
        engagement: isNews ? 'high' : isEducational ? 'medium' : 'low'
      }
    };
  }

  private getDefaultReasons(platform: string): string[] {
    const reasons = {
      twitter: ['Real-time engagement', 'Hashtag discovery', 'Viral potential'],
      linkedin: ['Professional audience', 'Thought leadership', 'B2B networking'],
      email: ['Direct communication', 'Detailed content', 'Engaged subscribers']
    };
    return reasons[platform as keyof typeof reasons] || [];
  }

  private getDefaultOptimizations(platform: string): string[] {
    const optimizations = {
      twitter: ['Use trending hashtags', 'Create thread for longer content', 'Add engaging visuals'],
      linkedin: ['Include professional insights', 'Use LinkedIn articles', 'Engage with comments'],
      email: ['Compelling subject line', 'Clear call-to-action', 'Mobile-friendly format']
    };
    return optimizations[platform as keyof typeof optimizations] || [];
  }

  // Utility method to analyze content type
  public analyzeContentType(content: string): string {
    const contentLower = content.toLowerCase();
    
    if (/how to|tutorial|guide|steps|instructions/i.test(content)) {
      return 'how-to';
    } else if (/opinion|think|believe|perspective|view/i.test(content)) {
      return 'opinion';
    } else if (/case study|example|success story/i.test(content)) {
      return 'case-study';
    } else if (/\d+\s+(ways|tips|reasons|steps|methods)/i.test(content)) {
      return 'list';
    } else if (/news|announcement|update|breaking/i.test(content)) {
      return 'news';
    } else if (/learn|understand|explain|education/i.test(content)) {
      return 'tutorial';
    }
    
    return 'article';
  }

  // Utility method to calculate engagement potential
  public calculateEngagementScore(content: string): number {
    let score = 50; // Base score
    
    // Positive factors
    if (/\?/.test(content)) score += 10; // Questions engage
    if (/\d+/.test(content)) score += 5; // Numbers attract attention
    if (/how to|tips|guide/i.test(content)) score += 15; // Educational content
    if (/free|secret|ultimate|proven/i.test(content)) score += 10; // Power words
    
    // Negative factors
    if (content.length > 2000) score -= 10; // Too long
    if (content.split(' ').length < 50) score -= 5; // Too short
    if (!/[.!?]/.test(content)) score -= 5; // Poor formatting
    
    return Math.min(Math.max(score, 0), 100);
  }

  // Utility method to suggest optimal posting times
  public suggestPostingTimes(platform: string, audience: string): string[] {
    const times = {
      twitter: {
        general: ['9:00 AM', '3:00 PM', '7:00 PM'],
        professionals: ['8:00 AM', '12:00 PM', '6:00 PM'],
        developers: ['10:00 AM', '2:00 PM', '8:00 PM']
      },
      linkedin: {
        general: ['8:00 AM', '12:00 PM', '5:00 PM'],
        professionals: ['7:30 AM', '12:00 PM', '5:30 PM'],
        developers: ['9:00 AM', '1:00 PM', '6:00 PM']
      },
      email: {
        general: ['10:00 AM', '2:00 PM', '6:00 PM'],
        professionals: ['9:00 AM', '1:00 PM', '5:00 PM'],
        developers: ['11:00 AM', '3:00 PM', '7:00 PM']
      }
    };
    
    return times[platform as keyof typeof times]?.[audience as keyof typeof times[keyof typeof times]] || times[platform as keyof typeof times]?.general || [];
  }
} 