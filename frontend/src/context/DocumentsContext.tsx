import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { documentsService } from '../services/documentsService';
import { useToast } from '../components/ui/toast-container';

// Types
export interface Document {
  id: string;
  title: string;
  content: string;
  source: 'PASTE' | 'NOTION' | 'GOOGLE_DOCS';
  sourceId?: string;
  createdAt: string;
  updatedAt: string;
  generatedContent?: GeneratedContentSummary[];
}

export interface GeneratedContentSummary {
  id: string;
  platform: 'TWITTER' | 'LINKEDIN' | 'EMAIL' | 'FACEBOOK' | 'INSTAGRAM';
  createdAt: string;
}

export interface DocumentsContextType {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  fetchDocuments: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchDocument: (id: string) => Promise<Document | null>;
  createDocument: (title: string, content: string, source: 'PASTE' | 'NOTION' | 'GOOGLE_DOCS', sourceId?: string) => Promise<Document | null>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Create context
const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

// Provider component
export const DocumentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSignedIn } = useAuthContext();
  const toast = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Reset state when auth changes
  useEffect(() => {
    if (!isSignedIn) {
      setDocuments([]);
    }
  }, [isSignedIn]);

  // Fetch documents list
  const fetchDocuments = async (page = 1, limit = 10, search?: string) => {
    if (!isSignedIn) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await documentsService.getDocuments(page, limit, search);
      
      setDocuments(result.documents);
      setPagination(result.pagination);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
      toast.showToast('error', 'Failed to fetch documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single document
  const fetchDocument = async (id: string): Promise<Document | null> => {
    if (!isSignedIn) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const document = await documentsService.getDocument(id);
      return document;
    } catch (err) {
      setError(`Failed to fetch document with ID: ${id}`);
      console.error('Error fetching document:', err);
      toast.showToast('error', 'Failed to fetch document. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create document
  const createDocument = async (
    title: string,
    content: string,
    source: 'PASTE' | 'NOTION' | 'GOOGLE_DOCS',
    sourceId?: string
  ): Promise<Document | null> => {
    if (!isSignedIn) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newDocument = await documentsService.createDocument({
        title,
        content,
        source,
        sourceId
      });
      
      setDocuments(prev => [newDocument, ...prev]);
      toast.showToast('success', 'Document created successfully');
      return newDocument;
    } catch (err) {
      setError('Failed to create document');
      console.error('Error creating document:', err);
      toast.showToast('error', 'Failed to create document. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update document
  const updateDocument = async (id: string, data: Partial<Document>): Promise<Document | null> => {
    if (!isSignedIn) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updateData = {
        title: data.title,
        content: data.content
      };
      
      const updatedDoc = await documentsService.updateDocument(id, updateData);
      
      // Update in local state
      setDocuments(prev =>
        prev.map(doc => doc.id === id ? updatedDoc : doc)
      );
      
      toast.showToast('success', 'Document updated successfully');
      return updatedDoc;
    } catch (err) {
      setError(`Failed to update document with ID: ${id}`);
      console.error('Error updating document:', err);
      toast.showToast('error', 'Failed to update document. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete document
  const deleteDocument = async (id: string): Promise<boolean> => {
    if (!isSignedIn) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await documentsService.deleteDocument(id);
      
      if (success) {
        // Remove from local state
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        toast.showToast('success', 'Document deleted successfully');
      }
      
      return success;
    } catch (err) {
      setError(`Failed to delete document with ID: ${id}`);
      console.error('Error deleting document:', err);
      toast.showToast('error', 'Failed to delete document. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    documents,
    isLoading,
    error,
    fetchDocuments,
    fetchDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    pagination
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
};

// Custom hook to use the documents context
export const useDocuments = (): DocumentsContextType => {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
};