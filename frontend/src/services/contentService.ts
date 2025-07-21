import { api } from './api';
import { GeneratedContent } from '../context/ContentContext';

// Types
export interface GenerationOptions {
  tone?: 'professional' | 'casual' | 'friendly' | 'humorous' | 'formal';
  length?: 'short' | 'medium' | 'long';
  includeHashtags?: boolean;
  includeCta?: boolean;
  customInstructions?: string;
  targetAudience?: string;
}

export interface GenerationRequest {
  documentId: string;
  platform: 'TWITTER' | 'LINKEDIN' | 'EMAIL' | 'FACEBOOK' | 'INSTAGRAM';
  tone?: string;
  customInstructions?: string;
  targetAudience?: string;
}

export interface GenerationResponse {
  success: boolean;
  data: {
    id: string;
    content: any;
    tokensUsed: number;
  };
}

export interface ContentResponse {
  success: boolean;
  data: GeneratedContent | GeneratedContent[];
}

export interface PublishRequest {
  contentId: string;
  platform: string;
  scheduledTime?: string;
}

export interface PublishResponse {
  success: boolean;
  publishedUrl?: string;
  error?: string;
}

export interface PlatformSuggestion {
  platform: string;
  score: number;
  reason: string;
}

/**
 * Service for content generation and management API calls
 */
export const contentService = {
  /**
   * Analyze document content
   */
  analyzeContent: async (documentId: string): Promise<{
    analysis: any;
    tokensUsed: number;
  }> => {
    try {
      const response = await api.post<{
        success: boolean;
        data: any;
        tokensUsed: number;
      }>('/content/analyze', { documentId }, { withAuth: true });
      
      return {
        analysis: response.data,
        tokensUsed: response.tokensUsed
      };
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw error;
    }
  },

  /**
   * Generate content for a document
   */
  generateContent: async (request: GenerationRequest): Promise<GeneratedContent> => {
    try {
      const response = await api.post<GenerationResponse>('/content/generate', request, { withAuth: true });
      
      // Convert the response to the expected format
      const generatedContent: GeneratedContent = {
        id: response.data.id,
        documentId: request.documentId,
        platform: request.platform,
        content: typeof response.data.content === 'string'
          ? response.data.content
          : JSON.stringify(response.data.content),
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          tone: request.tone,
          customInstructions: request.customInstructions,
          targetAudience: request.targetAudience,
          tokensUsed: response.data.tokensUsed
        }
      };
      
      return generatedContent;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  },

  /**
   * Suggest optimal platforms for content
   */
  suggestPlatforms: async (documentId: string): Promise<{
    suggestions: PlatformSuggestion[];
    tokensUsed: number;
  }> => {
    try {
      const response = await api.post<{
        success: boolean;
        data: PlatformSuggestion[];
        tokensUsed: number;
      }>('/content/suggest-platforms', { documentId }, { withAuth: true });
      
      return {
        suggestions: response.data,
        tokensUsed: response.tokensUsed
      };
    } catch (error) {
      console.error('Error suggesting platforms:', error);
      throw error;
    }
  },

  /**
   * Get generated content by ID
   */
  getContent: async (contentId: string): Promise<GeneratedContent> => {
    try {
      const response = await api.get<ContentResponse>(`/content/generated/${contentId}`, { withAuth: true });
      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
      console.error(`Error fetching content with ID ${contentId}:`, error);
      throw error;
    }
  },

  /**
   * Get all generated content for a document
   */
  getContentForDocument: async (documentId: string, platform?: string): Promise<GeneratedContent[]> => {
    try {
      const params: Record<string, string> = {};
      if (platform) {
        params.platform = platform;
      }
      
      const response = await api.get<ContentResponse>(`/content/generated/${documentId}`, {
        params,
        withAuth: true
      });
      
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error(`Error fetching content for document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Update generated content
   */
  updateContent: async (
    contentId: string,
    data: { content: string; tone?: string }
  ): Promise<GeneratedContent> => {
    try {
      const response = await api.put<ContentResponse>(`/content/generated/${contentId}`, data, { withAuth: true });
      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
      console.error(`Error updating content with ID ${contentId}:`, error);
      throw error;
    }
  },

  /**
   * Delete generated content
   */
  deleteContent: async (contentId: string): Promise<boolean> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/content/generated/${contentId}`, { withAuth: true });
      return response.success;
    } catch (error) {
      console.error(`Error deleting content with ID ${contentId}:`, error);
      throw error;
    }
  },

  /**
   * Cancel an ongoing generation process
   */
  cancelGeneration: async (documentId: string, platform: string): Promise<boolean> => {
    try {
      const response = await api.post<{ success: boolean }>('/content/cancel-generation', { documentId, platform }, { withAuth: true });
      return response.success;
    } catch (error) {
      console.error('Error canceling generation:', error);
      throw error;
    }
  },

  /**
   * Get platform-specific content suggestions
   * This is a mock implementation until the backend endpoint is available
   */
  getContentSuggestions: async (
    platform: 'TWITTER' | 'LINKEDIN' | 'EMAIL' | 'FACEBOOK' | 'INSTAGRAM',
    category?: string
  ): Promise<{
    suggestions: Array<{
      id: string;
      title: string;
      template: string;
      category: string;
    }>;
  }> => {
    try {
      // This would be replaced with an actual API call when the endpoint is available
      // const params: Record<string, string> = {};
      // if (category) {
      //   params.category = category;
      // }
      // return api.get<any>(`/content/suggestions/${platform.toLowerCase()}`, {
      //   params,
      //   withAuth: true
      // });
      
      // For now, return mock data
      return {
        suggestions: [
          {
            id: '1',
            title: 'Professional Announcement',
            template: 'Excited to announce [topic]. This will [benefit]. #[industry] #[topic]',
            category: 'announcement'
          },
          {
            id: '2',
            title: 'Industry Insight',
            template: 'Here\'s my take on [topic]: [insight]. What do you think? #[industry]',
            category: 'insight'
          },
          {
            id: '3',
            title: 'Question Prompt',
            template: 'What\'s your experience with [topic]? I\'ve found that [observation]. #[industry] #[topic]',
            category: 'engagement'
          }
        ]
      };
    } catch (error) {
      console.error(`Error fetching content suggestions for ${platform}:`, error);
      throw error;
    }
  }
};