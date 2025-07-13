import Together from 'together-ai';

export interface LinkedInContent {
  post: string;
  carousel?: string[];
  hashtags: string[];
  characterCount: number;
  slideCount: number;
  hasCarousel: boolean;
}

export interface LinkedInAgentResponse {
  success: boolean;
  data?: LinkedInContent;
  error?: string;
  tokensUsed: number;
}

export class LinkedInAgent {
  private together: Together;
  private readonly MAX_POST_LENGTH = 3000;
  private readonly MAX_CAROUSEL_SLIDES = 10;
  private readonly MAX_SLIDE_LENGTH = 1200;

  constructor() {
    this.together = new Together({
      apiKey: process.env.TOGETHER_API_KEY || '',
    });
  }

  async generate(
    content: string,
    tone: string,
    customInstructions?: string,
    targetAudience?: string
  ): Promise<LinkedInAgentResponse> {
    try {
      const prompt = this.buildGenerationPrompt(content, tone, customInstructions, targetAudience);
      
      const response = await this.together.chat.completions.create({
        model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a LinkedIn content expert. Create professional, engaging LinkedIn posts and carousels that drive meaningful engagement and establish thought leadership.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.6,
        stream: false
      });

      const generatedText = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      try {
        const linkedinContent = JSON.parse(generatedText);
        
        // Validate and format the content
        const formattedContent = this.formatLinkedInContent(linkedinContent);
        
        return {
          success: true,
          data: formattedContent,
          tokensUsed
        };
      } catch (parseError) {
        // If JSON parsing fails, create content from raw text
        return {
          success: true,
          data: this.createFromRawText(generatedText),
          tokensUsed
        };
      }
    } catch (error) {
      console.error('LinkedIn generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensUsed: 0
      };
    }
  }

  private buildGenerationPrompt(
    content: string,
    tone: string,
    customInstructions?: string,
    targetAudience?: string
  ): string {
    return `
Create LinkedIn content from the following article. Return a JSON object with this structure:

{
  "post": "Main LinkedIn post text",
  "carousel": ["Array of carousel slide texts (optional)"],
  "hashtags": ["Array of relevant hashtags"],
  "characterCount": total_characters,
  "slideCount": number_of_slides,
  "hasCarousel": boolean
}

Guidelines:
- Post must be under 3000 characters
- Use professional language appropriate for LinkedIn
- Include compelling hook, valuable insights, and call-to-action
- Tone: ${tone}
- Target audience: ${targetAudience || 'Business professionals'}
- ${customInstructions || ''}

For complex content, create a carousel with:
- Title slide (hook)
- 2-8 content slides (main points)
- Conclusion slide (call-to-action)
- Each slide under 1200 characters

Content to transform:
${content}

Return only the JSON object, no additional text.
    `;
  }

  private formatLinkedInContent(content: any): LinkedInContent {
    const post = content.post || '';
    if (post.length > this.MAX_POST_LENGTH) {
      throw new Error('Post exceeds maximum length');
    }

    const carousel = Array.isArray(content.carousel) ? content.carousel : [];
    const validCarousel = carousel
      .filter((slide: any) => typeof slide === 'string' && slide.length <= this.MAX_SLIDE_LENGTH)
      .slice(0, this.MAX_CAROUSEL_SLIDES);

    const hashtags = Array.isArray(content.hashtags) ? content.hashtags : [];
    const hasCarousel = validCarousel.length > 0;
    const characterCount = post.length + validCarousel.reduce((sum: number, slide: string) => sum + slide.length, 0);

    return {
      post,
      carousel: hasCarousel ? validCarousel : undefined,
      hashtags: hashtags.slice(0, 10),
      characterCount,
      slideCount: validCarousel.length,
      hasCarousel
    };
  }

  private createFromRawText(text: string): LinkedInContent {
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    // If text is short enough, use as single post
    if (cleanText.length <= this.MAX_POST_LENGTH) {
      return {
        post: this.optimizeLinkedInPost(cleanText),
        hashtags: this.extractHashtags(cleanText),
        characterCount: cleanText.length,
        slideCount: 0,
        hasCarousel: false
      };
    }

    // For longer text, create carousel
    const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const carousel: string[] = [];
    let currentSlide = '';

    for (const paragraph of paragraphs) {
      if (currentSlide.length + paragraph.length + 2 <= this.MAX_SLIDE_LENGTH) {
        currentSlide += (currentSlide ? '\n\n' : '') + paragraph;
      } else {
        if (currentSlide) {
          carousel.push(currentSlide);
          currentSlide = paragraph;
        }
      }
    }

    if (currentSlide) {
      carousel.push(currentSlide);
    }

    const post = this.createHookPost(cleanText);
    const hashtags = this.extractHashtags(cleanText);
    const characterCount = post.length + carousel.reduce((sum: number, slide: string) => sum + slide.length, 0);

    return {
      post,
      carousel: carousel.length > 0 ? carousel.slice(0, this.MAX_CAROUSEL_SLIDES) : undefined,
      hashtags,
      characterCount,
      slideCount: carousel.length,
      hasCarousel: carousel.length > 0
    };
  }

  private createHookPost(content: string): string {
    const firstSentence = content.split(/[.!?]+/)[0];
    const hook = firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence;
    
    return `${hook}\n\n👇 Swipe through the carousel to learn more.\n\n#LinkedIn #Content #Professional`;
  }

  private optimizeLinkedInPost(post: string): string {
    // Add LinkedIn-specific formatting
    let optimized = post;
    
    // Add line breaks for better readability
    optimized = optimized.replace(/\. /g, '.\n\n');
    
    // Add engagement elements
    if (!optimized.includes('👇') && !optimized.includes('💡') && !optimized.includes('🔥')) {
      optimized += '\n\n💡 What are your thoughts?';
    }
    
    return optimized;
  }

  private extractHashtags(text: string): string[] {
    const commonHashtags = [
      '#leadership', '#business', '#marketing', '#innovation', '#technology',
      '#productivity', '#growth', '#strategy', '#development', '#professional',
      '#career', '#networking', '#entrepreneurship', '#digital', '#success'
    ];
    
    const lowerText = text.toLowerCase();
    const relevantHashtags = commonHashtags.filter(tag => 
      lowerText.includes(tag.substring(1))
    );
    
    return relevantHashtags.slice(0, 10);
  }

  // Utility method to validate post length
  public validatePostLength(post: string): boolean {
    return post.length <= this.MAX_POST_LENGTH;
  }

  // Utility method to validate carousel slide
  public validateSlideLength(slide: string): boolean {
    return slide.length <= this.MAX_SLIDE_LENGTH;
  }

  // Utility method to count total characters
  public countTotalCharacters(post: string, carousel?: string[]): number {
    const carouselLength = carousel ? carousel.reduce((sum: number, slide: string) => sum + slide.length, 0) : 0;
    return post.length + carouselLength;
  }

  // Utility method to add engagement elements
  public addEngagementElements(post: string): string {
    const engagementQuestions = [
      'What are your thoughts?',
      'Have you experienced this?',
      'What would you add?',
      'Share your perspective below.',
      'What has worked for you?'
    ];
    
    const randomQuestion = engagementQuestions[Math.floor(Math.random() * engagementQuestions.length)];
    return `${post}\n\n💡 ${randomQuestion}`;
  }
} 