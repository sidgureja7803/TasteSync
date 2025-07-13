import Together from 'together-ai';

export interface EmailContent {
  subject: string;
  body: string;
  preheader?: string;
  wordCount: number;
  estimatedReadTime: number;
}

export interface EmailAgentResponse {
  success: boolean;
  data?: EmailContent;
  error?: string;
  tokensUsed: number;
}

export class EmailAgent {
  private together: Together;
  private readonly MAX_SUBJECT_LENGTH = 50;
  private readonly MAX_PREHEADER_LENGTH = 100;
  private readonly MAX_BODY_LENGTH = 10000;

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
  ): Promise<EmailAgentResponse> {
    try {
      const prompt = this.buildGenerationPrompt(content, tone, customInstructions, targetAudience);
      
      const response = await this.together.chat.completions.create({
        model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an email marketing expert. Create compelling email content that drives engagement and action while maintaining professional standards and deliverability.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.5,
        stream: false
      });

      const generatedText = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      try {
        const emailContent = JSON.parse(generatedText);
        
        // Validate and format the content
        const formattedContent = this.formatEmailContent(emailContent);
        
        return {
          success: true,
          data: formattedContent,
          tokensUsed
        };
      } catch (parseError) {
        // If JSON parsing fails, create content from raw text
        return {
          success: true,
          data: this.createFromRawText(generatedText, content),
          tokensUsed
        };
      }
    } catch (error) {
      console.error('Email generation error:', error);
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
Create email content from the following article. Return a JSON object with this structure:

{
  "subject": "Compelling subject line (under 50 characters)",
  "body": "Email body content in HTML format",
  "preheader": "Optional preheader text (under 100 characters)",
  "wordCount": number_of_words,
  "estimatedReadTime": number_in_minutes
}

Guidelines:
- Subject line must be under 50 characters and compelling
- Body should be well-structured with clear sections
- Use HTML formatting for better readability
- Include a clear call-to-action
- Tone: ${tone}
- Target audience: ${targetAudience || 'Newsletter subscribers'}
- ${customInstructions || ''}

Email structure:
- Greeting
- Hook/Opening
- Main content (organized in sections)
- Key takeaways
- Call-to-action
- Closing

Content to transform:
${content}

Return only the JSON object, no additional text.
    `;
  }

  private formatEmailContent(content: any): EmailContent {
    const subject = content.subject || '';
    if (subject.length > this.MAX_SUBJECT_LENGTH) {
      throw new Error('Subject line exceeds maximum length');
    }

    const body = content.body || '';
    if (body.length > this.MAX_BODY_LENGTH) {
      throw new Error('Email body exceeds maximum length');
    }

    const preheader = content.preheader || '';
    if (preheader.length > this.MAX_PREHEADER_LENGTH) {
      throw new Error('Preheader exceeds maximum length');
    }

    const wordCount = this.countWords(body);
    const estimatedReadTime = Math.ceil(wordCount / 200); // Average reading speed

    return {
      subject,
      body,
      preheader: preheader || undefined,
      wordCount,
      estimatedReadTime
    };
  }

  private createFromRawText(text: string, originalContent: string): EmailContent {
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    // Generate subject line from first sentence or title
    const firstLine = cleanText.split('\n')[0];
    const subject = this.generateSubject(firstLine, originalContent);
    
    // Format body as HTML
    const body = this.formatAsHtmlEmail(cleanText);
    
    // Generate preheader
    const preheader = this.generatePreheader(cleanText);
    
    const wordCount = this.countWords(body);
    const estimatedReadTime = Math.ceil(wordCount / 200);

    return {
      subject,
      body,
      preheader,
      wordCount,
      estimatedReadTime
    };
  }

  private generateSubject(firstLine: string, originalContent: string): string {
    const keywords = this.extractKeywords(originalContent);
    const actionWords = ['Discover', 'Learn', 'Master', 'Unlock', 'Transform'];
    
    let subject = firstLine.substring(0, this.MAX_SUBJECT_LENGTH - 10);
    
    // Add action word if space allows
    if (subject.length < 30 && keywords.length > 0) {
      const actionWord = actionWords[Math.floor(Math.random() * actionWords.length)];
      subject = `${actionWord} ${keywords[0]}`;
    }
    
    return subject.substring(0, this.MAX_SUBJECT_LENGTH);
  }

  private generatePreheader(content: string): string {
    const secondSentence = content.split(/[.!?]+/)[1];
    if (secondSentence) {
      return secondSentence.trim().substring(0, this.MAX_PREHEADER_LENGTH);
    }
    return 'Inside: Key insights and actionable tips';
  }

  private formatAsHtmlEmail(content: string): string {
    const sections = content.split('\n\n').filter(section => section.trim().length > 0);
    
    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .highlight { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
        .cta { background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <h1>Hi there! 👋</h1>
`;

    sections.forEach((section, index) => {
      if (index === 0) {
        html += `<p><strong>${section}</strong></p>`;
      } else if (index === sections.length - 1) {
        html += `<div class="highlight"><p>${section}</p></div>`;
      } else {
        html += `<p>${section}</p>`;
      }
    });

    html += `
    <a href="#" class="cta">Read More</a>
    
    <div class="footer">
        <p>Thanks for reading! If you found this valuable, please share it with your network.</p>
        <p>Best regards,<br>The TasteSync Team</p>
    </div>
</body>
</html>
`;

    return html;
  }

  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    
    const keywords = words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .reduce((acc: Record<string, number>, word: string) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(keywords)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([word]) => word);
  }

  private countWords(text: string): number {
    return text.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  }

  // Utility method to validate subject line
  public validateSubjectLine(subject: string): boolean {
    return subject.length <= this.MAX_SUBJECT_LENGTH;
  }

  // Utility method to calculate spam score
  public calculateSpamScore(subject: string, body: string): number {
    const spamWords = ['free', 'guarantee', 'urgent', 'act now', 'limited time', 'click here', 'buy now'];
    const content = (subject + ' ' + body).toLowerCase();
    
    let score = 0;
    spamWords.forEach(word => {
      if (content.includes(word)) {
        score += 1;
      }
    });

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.3) score += 2;

    // Check for excessive punctuation
    const punctuationRatio = (content.match(/[!?]{2,}/g) || []).length;
    if (punctuationRatio > 0) score += 1;

    return score;
  }

  // Utility method to optimize subject line for deliverability
  public optimizeSubjectLine(subject: string): string {
    // Remove spam words and excessive punctuation
    let optimized = subject.replace(/free|guarantee|urgent|act now/gi, '');
    optimized = optimized.replace(/[!?]{2,}/g, '!');
    
    // Ensure it's under the limit
    if (optimized.length > this.MAX_SUBJECT_LENGTH) {
      optimized = optimized.substring(0, this.MAX_SUBJECT_LENGTH - 3) + '...';
    }
    
    return optimized.trim();
  }

  // Utility method to generate A/B test subject lines
  public generateSubjectLineVariations(originalSubject: string): string[] {
    const variations = [];
    
    // Question format
    variations.push(originalSubject.replace(/\.$/, '?'));
    
    // Number format
    variations.push(`5 ${originalSubject.toLowerCase()}`);
    
    // Personal format
    variations.push(`Your ${originalSubject.toLowerCase()}`);
    
    // Emoji format
    variations.push(`${originalSubject} 🚀`);
    
    return variations.filter(v => v.length <= this.MAX_SUBJECT_LENGTH);
  }
} 