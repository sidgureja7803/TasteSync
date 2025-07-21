import { api } from './api';

// Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  credits: number;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar?: string;
}

export interface UsageStats {
  documentsCount: number;
  generatedContentCount: number;
  publishedContentCount: number;
  tokensUsed: number;
  tokensRemaining: number;
}

/**
 * Service for authentication and user profile related API calls
 */
export const authService = {
  /**
   * Get the current user's profile from the backend
   */
  getCurrentUser: async (): Promise<UserProfile> => {
    try {
      const response = await api.get<{ success: boolean; data: UserProfile }>('/auth/me', { withAuth: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update the current user's profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    try {
      const response = await api.put<{ success: boolean; data: UserProfile }>('/auth/me', data, { withAuth: true });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Get user's usage statistics
   * This is a mock implementation until the backend endpoint is available
   */
  getUsageStats: async (): Promise<UsageStats> => {
    try {
      // This would be replaced with an actual API call when the endpoint is available
      // return api.get<UsageStats>('/auth/usage', { withAuth: true });
      
      // For now, return mock data
      const user = await authService.getCurrentUser();
      
      return {
        documentsCount: 10,
        generatedContentCount: 25,
        publishedContentCount: 15,
        tokensUsed: 5000,
        tokensRemaining: user.credits
      };
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      throw error;
    }
  },

  /**
   * Sync Clerk user data with our backend
   * This should be called when the user logs in or when their Clerk profile changes
   */
  syncUserData: async (clerkUser: any): Promise<UserProfile> => {
    try {
      // This would be an API call to sync the Clerk user data with our backend
      // For now, we'll just return the current user profile
      return authService.getCurrentUser();
    } catch (error) {
      console.error('Error syncing user data:', error);
      throw error;
    }
  }
};