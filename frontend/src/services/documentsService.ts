import { api } from './api';
import { Document, GeneratedContentSummary } from '../context/DocumentsContext';

// Types
export interface DocumentsResponse {
  success: boolean;
  data: {
    documents: Document[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface DocumentResponse {
  success: boolean;
  data: Document;
}

export interface DocumentCreateData {
  title: string;
  content: string;
  source: 'PASTE' | 'NOTION' | 'GOOGLE_DOCS';
  sourceId?: string;
}

export interface DocumentUpdateData {
  title?: string;
  content?: string;
}

export interface ImportOptions {
  source: 'NOTION' | 'GOOGLE_DOCS';
  sourceId: string;
  url?: string;
  accessToken?: string;
}

/**
 * Service for document-related API calls
 */
export const documentsService = {
  /**
   * Get a list of documents with pagination
   */
  getDocuments: async (
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<DocumentsResponse['data']> => {
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString()
      };

      if (search) {
        params.search = search;
      }

      const response = await api.get<DocumentsResponse>('/documents', {
        params,
        withAuth: true
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  /**
   * Get a single document by ID
   */
  getDocument: async (id: string): Promise<Document> => {
    try {
      const response = await api.get<DocumentResponse>(`/documents/${id}`, { withAuth: true });
      return response.data;
    } catch (error) {
      console.error(`Error fetching document with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new document by direct input
   */
  createDocument: async (data: DocumentCreateData): Promise<Document> => {
    try {
      const response = await api.post<DocumentResponse>('/documents/import', data, { withAuth: true });
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  /**
   * Update an existing document
   */
  updateDocument: async (id: string, data: DocumentUpdateData): Promise<Document> => {
    try {
      const response = await api.put<DocumentResponse>(`/documents/${id}`, data, { withAuth: true });
      return response.data;
    } catch (error) {
      console.error(`Error updating document with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a document
   */
  deleteDocument: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/documents/${id}`, { withAuth: true });
      return response.success;
    } catch (error) {
      console.error(`Error deleting document with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Import a document from an external source
   */
  importDocument: async (options: ImportOptions): Promise<Document> => {
    try {
      const response = await api.post<DocumentResponse>('/documents/import', options, { withAuth: true });
      return response.data;
    } catch (error) {
      console.error('Error importing document:', error);
      throw error;
    }
  },

  /**
   * Get a list of available documents from an external source
   * This is a mock implementation until the backend endpoint is available
   */
  getExternalDocuments: async (source: 'NOTION' | 'GOOGLE_DOCS'): Promise<{
    documents: Array<{
      id: string;
      title: string;
      lastUpdated: string;
    }>;
  }> => {
    try {
      // This would be replaced with an actual API call when the endpoint is available
      // return api.get<any>(`/documents/external/${source.toLowerCase()}`, { withAuth: true });
      
      // For now, return mock data
      return {
        documents: [
          {
            id: 'ext1',
            title: 'External Document 1',
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'ext2',
            title: 'External Document 2',
            lastUpdated: new Date().toISOString()
          }
        ]
      };
    } catch (error) {
      console.error(`Error fetching external documents from ${source}:`, error);
      throw error;
    }
  },

  /**
   * Get generated content for a document
   */
  getGeneratedContent: async (documentId: string): Promise<GeneratedContentSummary[]> => {
    try {
      const response = await api.get<{ success: boolean; data: GeneratedContentSummary[] }>(
        `/content/generated/${documentId}`,
        { withAuth: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching generated content for document ${documentId}:`, error);
      throw error;
    }
  }
};