import axios from 'axios';

interface DevToArticle {
  title: string;
  body_markdown: string;
  tags: string[];
  canonical_url?: string | null;
  published: boolean;
}

interface DevToResponse {
  id: number;
  url: string;
  title: string;
  published: boolean;
}

export async function publishToDevTo(article: DevToArticle): Promise<DevToResponse> {
  try {
    const apiKey = process.env.DEVTO_API_KEY;
    
    if (!apiKey) {
      throw new Error('Dev.to API key not configured');
    }

    const response = await axios.post(
      'https://dev.to/api/articles',
      {
        article: {
          title: article.title,
          body_markdown: article.body_markdown,
          tags: article.tags,
          canonical_url: article.canonical_url,
          published: article.published
        }
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      id: response.data.id,
      url: response.data.url,
      title: response.data.title,
      published: response.data.published
    };
  } catch (error) {
    console.error('Dev.to publishing error:', error);
    throw new Error('Failed to publish to Dev.to');
  }
}

// Placeholder for Medium publishing (to be implemented)
export async function publishToMedium(article: any): Promise<any> {
  throw new Error('Medium publishing not yet implemented');
}

// Placeholder for Hashnode publishing (to be implemented)
export async function publishToHashnode(article: any): Promise<any> {
  throw new Error('Hashnode publishing not yet implemented');
}

// Utility function to validate article content
export function validateArticle(article: DevToArticle): string[] {
  const errors: string[] = [];

  if (!article.title || article.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!article.body_markdown || article.body_markdown.trim().length === 0) {
    errors.push('Body content is required');
  }

  if (article.title && article.title.length > 250) {
    errors.push('Title must be 250 characters or less');
  }

  if (article.tags && article.tags.length > 4) {
    errors.push('Maximum 4 tags allowed');
  }

  if (article.tags) {
    article.tags.forEach(tag => {
      if (tag.length > 25) {
        errors.push(`Tag "${tag}" must be 25 characters or less`);
      }
    });
  }

  return errors;
}

// Utility function to format content for Dev.to
export function formatForDevTo(content: string, platform: string): string {
  let formatted = content;

  // Add platform-specific formatting
  switch (platform) {
    case 'TWITTER':
      formatted = `## Twitter Thread\n\n${formatted}`;
      break;
    case 'LINKEDIN':
      formatted = `## LinkedIn Post\n\n${formatted}`;
      break;
    case 'EMAIL':
      formatted = `## Newsletter Content\n\n${formatted}`;
      break;
  }

  // Add footer
  formatted += '\n\n---\n\n*This content was generated using TasteSync - Transform your long-form content into engaging social media posts.*';

  return formatted;
}

// Utility function to suggest tags based on content
export function suggestTags(content: string): string[] {
  const commonTags = [
    'webdev', 'javascript', 'react', 'nodejs', 'python', 'programming',
    'tutorial', 'beginners', 'productivity', 'career', 'discuss',
    'showdev', 'news', 'opensource', 'devops', 'database', 'frontend',
    'backend', 'fullstack', 'mobile', 'design', 'ux', 'ui', 'startup',
    'business', 'marketing', 'learning', 'tips', 'guide', 'howto'
  ];

  const lowerContent = content.toLowerCase();
  const suggestedTags = commonTags.filter(tag => 
    lowerContent.includes(tag) || lowerContent.includes(tag.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase())
  );

  return suggestedTags.slice(0, 4); // Max 4 tags
}

// Utility function to generate canonical URL
export function generateCanonicalUrl(originalUrl?: string): string | null {
  if (!originalUrl) return null;
  
  // Validate URL format
  try {
    new URL(originalUrl);
    return originalUrl;
  } catch {
    return null;
  }
} 