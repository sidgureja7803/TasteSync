import Together from 'together-ai';

export interface ContentAnalysis {
  summary: string;
  keyPoints: string[];
  tone: string;
  targetAudience: string;
  suggestedPlatforms: string[];
  topics: string[];
  sentiments: string[];
  wordCount: number;
  readingTime: number;
  complexity: 'simple' | 'medium' | 'complex';
}

export interface AgentResponse {
  success: boolean;
  data?: ContentAnalysis;
  error?: string;
  tokensUsed: number;
}

export class ContentAnalystAgent {
  private together: Together;

  constructor() {
    this.together = new Together({
      apiKey: process.env.TOGETHER_API_KEY || '',
    });
  }

  async analyze(content: string): Promise<AgentResponse> {
    try {
      const prompt = this.buildAnalysisPrompt(content);
      
      const response = await this.together.chat.completions.create({
        model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a content analyst expert. Analyze the provided content and return a structured JSON response with insights about the content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
        stream: false
      });

      const analysisText = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      try {
        const analysis = JSON.parse(analysisText);
        
        return {
          success: true,
          data: analysis,
          tokensUsed
        };
      } catch (parseError) {
        // If JSON parsing fails, create a basic analysis
        return {
          success: true,
          data: this.createBasicAnalysis(content, analysisText),
          tokensUsed
        };
      }
    } catch (error) {
      console.error('Content analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensUsed: 0
      };
    }
  }

  private buildAnalysisPrompt(content: string): string {
    return `
Analyze the following content and provide a detailed analysis in JSON format with the following structure:

{
  "summary": "Brief summary of the content (2-3 sentences)",
  "keyPoints": ["Array of main key points"],
  "tone": "Overall tone (professional, casual, conversational, etc.)",
  "targetAudience": "Primary target audience",
  "suggestedPlatforms": ["Array of recommended social media platforms"],
  "topics": ["Array of main topics/themes"],
  "sentiments": ["Array of emotional sentiments"],
  "wordCount": number,
  "readingTime": number_in_minutes,
  "complexity": "simple|medium|complex"
}

Content to analyze:
${content}

Return only the JSON object, no additional text.
    `;
  }

  private createBasicAnalysis(content: string, analysisText: string): ContentAnalysis {
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    return {
      summary: analysisText.substring(0, 200) + '...',
      keyPoints: this.extractKeyPoints(content),
      tone: this.detectTone(content),
      targetAudience: 'General audience',
      suggestedPlatforms: ['twitter', 'linkedin'],
      topics: this.extractTopics(content),
      sentiments: ['neutral'],
      wordCount,
      readingTime,
      complexity: wordCount > 500 ? 'complex' : wordCount > 200 ? 'medium' : 'simple'
    };
  }

  private extractKeyPoints(content: string): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  private detectTone(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('exciting') || lowerContent.includes('amazing') || lowerContent.includes('great')) {
      return 'enthusiastic';
    } else if (lowerContent.includes('important') || lowerContent.includes('significant')) {
      return 'professional';
    } else if (lowerContent.includes('hey') || lowerContent.includes('folks')) {
      return 'casual';
    }
    
    return 'neutral';
  }

  private extractTopics(content: string): string[] {
    const commonTopics = [
      'technology', 'business', 'marketing', 'design', 'development',
      'leadership', 'innovation', 'strategy', 'growth', 'productivity'
    ];
    
    const lowerContent = content.toLowerCase();
    return commonTopics.filter(topic => lowerContent.includes(topic));
  }
} 