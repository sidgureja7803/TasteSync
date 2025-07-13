import Together from 'together-ai';

export interface TwitterContent {
  tweets: string[];
  thread: boolean;
  hashtags: string[];
  characterCount: number;
  tweetCount: number;
}

export interface TwitterAgentResponse {
  success: boolean;
  data?: TwitterContent;
  error?: string;
  tokensUsed: number;
}

export class TwitterAgent {
  private together: Together;
  private readonly MAX_TWEET_LENGTH = 280;
  private readonly MAX_THREAD_LENGTH = 25;

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
  ): Promise<TwitterAgentResponse> {
    try {
      const prompt = this.buildGenerationPrompt(content, tone, customInstructions, targetAudience);
      
      const response = await this.together.chat.completions.create({
        model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a Twitter content expert. Create engaging tweets and threads that maximize engagement while staying within Twitter\'s character limits.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.7,
        stream: false
      });

      const generatedText = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      try {
        const twitterContent = JSON.parse(generatedText);
        
        // Validate and format the content
        const formattedContent = this.formatTwitterContent(twitterContent);
        
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
      console.error('Twitter generation error:', error);
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
Create Twitter content from the following article. Return a JSON object with this structure:

{
  "tweets": ["Array of tweet text"],
  "thread": boolean,
  "hashtags": ["Array of relevant hashtags"],
  "characterCount": total_characters,
  "tweetCount": number_of_tweets
}

Guidelines:
- Each tweet must be under 280 characters
- Include 3-5 relevant hashtags
- Tone: ${tone}
- Target audience: ${targetAudience || 'General audience'}
- ${customInstructions || ''}

For longer content, create a thread (2-10 tweets) with:
- Hook tweet (engaging opening)
- Value tweets (main points)
- Call-to-action tweet (engagement driver)

Content to transform:
${content}

Return only the JSON object, no additional text.
    `;
  }

  private formatTwitterContent(content: any): TwitterContent {
    const tweets = Array.isArray(content.tweets) ? content.tweets : [content.tweets || ''];
    const validTweets = tweets.filter((tweet: any) => typeof tweet === 'string' && tweet.length <= this.MAX_TWEET_LENGTH);
    
    if (validTweets.length === 0) {
      throw new Error('No valid tweets generated');
    }

    const hashtags = Array.isArray(content.hashtags) ? content.hashtags : [];
    const thread = validTweets.length > 1;
    const characterCount = validTweets.reduce((sum: number, tweet: string) => sum + tweet.length, 0);

    return {
      tweets: validTweets.slice(0, this.MAX_THREAD_LENGTH),
      thread,
      hashtags: hashtags.slice(0, 5),
      characterCount,
      tweetCount: validTweets.length
    };
  }

  private createFromRawText(text: string): TwitterContent {
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    // Split into potential tweets
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const tweets: string[] = [];
    
    let currentTweet = '';
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentTweet.length + trimmedSentence.length + 1 <= this.MAX_TWEET_LENGTH) {
        currentTweet += (currentTweet ? ' ' : '') + trimmedSentence;
      } else {
        if (currentTweet) {
          tweets.push(currentTweet);
          currentTweet = trimmedSentence;
        }
      }
    }
    
    if (currentTweet) {
      tweets.push(currentTweet);
    }

    // If no tweets created, create one from the first 250 characters
    if (tweets.length === 0) {
      tweets.push(cleanText.substring(0, 250) + '...');
    }

    const hashtags = this.extractHashtags(cleanText);
    const thread = tweets.length > 1;
    const characterCount = tweets.reduce((sum, tweet) => sum + tweet.length, 0);

    return {
      tweets: tweets.slice(0, this.MAX_THREAD_LENGTH),
      thread,
      hashtags,
      characterCount,
      tweetCount: tweets.length
    };
  }

  private extractHashtags(text: string): string[] {
    const commonHashtags = [
      '#tech', '#business', '#marketing', '#leadership', '#innovation',
      '#productivity', '#growth', '#strategy', '#development', '#tips'
    ];
    
    const lowerText = text.toLowerCase();
    const relevantHashtags = commonHashtags.filter(tag => 
      lowerText.includes(tag.substring(1))
    );
    
    return relevantHashtags.slice(0, 5);
  }

  // Utility method to validate tweet length
  public validateTweetLength(tweet: string): boolean {
    return tweet.length <= this.MAX_TWEET_LENGTH;
  }

  // Utility method to count characters in a thread
  public countThreadCharacters(tweets: string[]): number {
    return tweets.reduce((total, tweet) => total + tweet.length, 0);
  }

  // Utility method to optimize tweet for engagement
  public optimizeTweet(tweet: string): string {
    // Add engagement drivers
    const engagementWords = ['discover', 'learn', 'secret', 'proven', 'ultimate'];
    const hasEngagement = engagementWords.some(word => 
      tweet.toLowerCase().includes(word)
    );
    
    if (!hasEngagement && tweet.length < 250) {
      return tweet + ' 💡';
    }
    
    return tweet;
  }
} 