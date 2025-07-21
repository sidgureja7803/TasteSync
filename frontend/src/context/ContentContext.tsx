import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { contentService, GenerationRequest } from '../services/contentService';
import { useToast } from '../components/ui/toast-container';

// Types
export interface GeneratedContent {
  id: string;
  documentId: string;
  platform: 'TWITTER' | 'LINKEDIN' | 'EMAIL' | 'FACEBOOK' | 'INSTAGRAM';
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface ContentGenerationStatus {
  isGenerating: boolean;
  progress: number; // 0-100
  platform?: string;
  documentId?: string;
  error?: string;
}

export interface ContentContextType {
  generatedContent: GeneratedContent[];
  contentGenerationStatus: ContentGenerationStatus;
  isLoading: boolean;
  error: string | null;
  
  // Content generation methods
  generateContent: (documentId: string, platform: string, options?: Record<string, any>) => Promise<GeneratedContent | null>;
  cancelGeneration: () => void;
  
  // Content management methods
  fetchGeneratedContent: (documentId: string) => Promise<GeneratedContent[]>;
  updateGeneratedContent: (contentId: string, data: Partial<GeneratedContent>) => Promise<GeneratedContent | null>;
  deleteGeneratedContent: (contentId: string) => Promise<boolean>;
  publishContent: (contentId: string, platform: string) => Promise<boolean>;
}

// Create context
const ContentContext = createContext<ContentContextType | undefined>(undefined);

// Provider component
export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSignedIn } = useAuthContext();
  const toast = useToast();
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contentGenerationStatus, setContentGenerationStatus] = useState<ContentGenerationStatus>({
    isGenerating: false,
    progress: 0
  });

  // Reset state when auth changes
  React.useEffect(() => {
    if (!isSignedIn) {
      setGeneratedContent([]);
      setContentGenerationStatus({
        isGenerating: false,
        progress: 0
      });
    }
  }, [isSignedIn]);

  // Generate content for a document
  const generateContent = async (
    documentId: string,
    platform: string,
    options?: Record<string, any>
  ): Promise<GeneratedContent | null> => {
    if (!isSignedIn) return null;
    
    setIsLoading(true);
    setError(null);
    setContentGenerationStatus({
      isGenerating: true,
      progress: 0,
      platform,
      documentId
    });
    
    try {
      // Prepare the generation request
      const request: GenerationRequest = {
        documentId,
        platform: platform as any,
        tone: options?.tone,
        customInstructions: options?.customInstructions,
        targetAudience: options?.targetAudience
      };
      
      // Start a progress simulation
      const progressInterval = setInterval(() => {
        setContentGenerationStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90) // Cap at 90% until complete
        }));
      }, 500);
      
      // Call the API
      const newContent = await contentService.generateContent(request);
      
      // Clear the interval and set progress to 100%
      clearInterval(progressInterval);
      setContentGenerationStatus(prev => ({
        ...prev,
        progress: 100
      }));
      
      // Add to state
      setGeneratedContent(prev => [newContent, ...prev]);
      
      // Show success toast
      toast.showToast('success', 'Content generated successfully');
      
      return newContent;
    } catch (err) {
      setError(`Failed to generate content for platform: ${platform}`);
      console.error('Error generating content:', err);
      toast.showToast('error', `Failed to generate content for ${platform}. Please try again.`);
      return null;
    } finally {
      setIsLoading(false);
      setContentGenerationStatus({
        isGenerating: false,
        progress: 0
      });
    }
  };

  // Cancel ongoing generation
  const cancelGeneration = async () => {
    if (!contentGenerationStatus.documentId || !contentGenerationStatus.platform) {
      setContentGenerationStatus({
        isGenerating: false,
        progress: 0
      });
      return;
    }
    
    try {
      await contentService.cancelGeneration(
        contentGenerationStatus.documentId,
        contentGenerationStatus.platform
      );
      
      toast.showToast('info', 'Content generation cancelled');
    } catch (err) {
      console.error('Error cancelling generation:', err);
    } finally {
      setContentGenerationStatus({
        isGenerating: false,
        progress: 0
      });
    }
  };

  // Fetch generated content for a document
  const fetchGeneratedContent = async (documentId: string): Promise<GeneratedContent[]> => {
    if (!isSignedIn) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await contentService.getContentForDocument(documentId);
      setGeneratedContent(content);
      return content;
    } catch (err) {
      setError(`Failed to fetch generated content for document: ${documentId}`);
      console.error('Error fetching generated content:', err);
      toast.showToast('error', 'Failed to fetch generated content. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Update generated content
  const updateGeneratedContent = async (
    contentId: string,
    data: Partial<GeneratedContent>
  ): Promise<GeneratedContent | null> => {
    if (!isSignedIn) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract content and tone from the data
      const updateData = {
        content: data.content || '',
        tone: data.metadata?.tone
      };
      
      // Call the API
      const updatedContent = await contentService.updateContent(contentId, updateData);
      
      // Update in local state
      setGeneratedContent(prev =>
        prev.map(content => content.id === contentId ? updatedContent : content)
      );
      
      toast.showToast('success', 'Content updated successfully');
      return updatedContent;
    } catch (err) {
      setError(`Failed to update content with ID: ${contentId}`);
      console.error('Error updating content:', err);
      toast.showToast('error', 'Failed to update content. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete generated content
  const deleteGeneratedContent = async (contentId: string): Promise<boolean> => {
    if (!isSignedIn) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the API
      const success = await contentService.deleteContent(contentId);
      
      if (success) {
        // Remove from local state
        setGeneratedContent(prev => prev.filter(content => content.id !== contentId));
        toast.showToast('success', 'Content deleted successfully');
      }
      
      return success;
    } catch (err) {
      setError(`Failed to delete content with ID: ${contentId}`);
      console.error('Error deleting content:', err);
      toast.showToast('error', 'Failed to delete content. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Publish content to platform
  const publishContent = async (contentId: string, platform: string): Promise<boolean> => {
    if (!isSignedIn) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a placeholder until the actual publish API is implemented
      // In a real implementation, we would call something like:
      // const result = await contentService.publishContent(contentId, platform);
      
      // For now, we'll just update the local state
      const updatedContentList = generatedContent.map(content =>
        content.id === contentId
          ? {
              ...content,
              status: 'PUBLISHED' as const,
              publishedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : content
      );
      
      setGeneratedContent(updatedContentList);
      toast.showToast('success', `Content published to ${platform} successfully`);
      return true;
    } catch (err) {
      setError(`Failed to publish content with ID: ${contentId} to ${platform}`);
      console.error('Error publishing content:', err);
      toast.showToast('error', `Failed to publish content to ${platform}. Please try again.`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    generatedContent,
    contentGenerationStatus,
    isLoading,
    error,
    generateContent,
    cancelGeneration,
    fetchGeneratedContent,
    updateGeneratedContent,
    deleteGeneratedContent,
    publishContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

// Custom hook to use the content context
export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};