import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Trash2,
  RefreshCw,
  Share2,
  BarChart2,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Globe,
  Eye,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  TrendingUp,
  Users,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ContentPlatform } from '../components/content/ContentCard';
import { useDocuments } from '../context/DocumentsContext';
import { useContent } from '../context/ContentContext';
import { useToast } from '../components/ui/toast-container';

const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'preview' | 'analytics'>('preview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [document, setDocument] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  
  const { fetchDocument, deleteDocument } = useDocuments();
  const { fetchGeneratedContent, generateContent, publishContent } = useContent();
  const toast = useToast();
  
  // Platforms derived from generated content
  const [platforms, setPlatforms] = useState<ContentPlatform[]>([]);
  
  // Load document and content data
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch document
        const doc = await fetchDocument(id);
        if (doc) {
          setDocument(doc);
          
          // Fetch generated content
          const content = await fetchGeneratedContent(id);
          setGeneratedContent(content);
          
          // Extract platforms from generated content
          const platformSet = new Set<ContentPlatform>();
          content.forEach(item => {
            const platform = item.platform.toLowerCase() as ContentPlatform;
            if (platform) platformSet.add(platform);
          });
          
          // If no platforms yet, add a default one
          if (platformSet.size === 0) {
            platformSet.add('web');
          }
          
          setPlatforms(Array.from(platformSet));
        } else {
          toast.showToast('error', 'Document not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error loading content details:', error);
        toast.showToast('error', 'Failed to load content details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  // Determine content status
  const getContentStatus = (): string => {
    if (!document) return 'draft';
    if (generatedContent.length > 0) {
      const published = generatedContent.some(c => c.status === 'PUBLISHED');
      if (published) return 'published';
      return 'scheduled'; // If content is generated but not published
    }
    return 'draft';
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get platform icon based on platform type
  const getPlatformIcon = (platform: ContentPlatform) => {
    switch (platform) {
      case 'twitter':
        return <Twitter size={16} className="text-[#1DA1F2]" />;
      case 'instagram':
        return <Instagram size={16} className="text-[#E1306C]" />;
      case 'facebook':
        return <Facebook size={16} className="text-[#4267B2]" />;
      case 'linkedin':
        return <Linkedin size={16} className="text-[#0077B5]" />;
      case 'youtube':
        return <Youtube size={16} className="text-[#FF0000]" />;
      case 'web':
        return <Globe size={16} className="text-gray-500" />;
      default:
        return null;
    }
  };
  
  // Get platform color based on platform type
  const getPlatformColor = (platform: ContentPlatform): string => {
    switch (platform) {
      case 'twitter':
        return '#1DA1F2';
      case 'instagram':
        return '#E1306C';
      case 'facebook':
        return '#4267B2';
      case 'linkedin':
        return '#0077B5';
      case 'youtube':
        return '#FF0000';
      case 'web':
      default:
        return '#6B7280'; // gray-500
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">{document?.title || 'Untitled Content'}</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={async () => {
              if (!document || !id) return;
              try {
                await deleteDocument(id);
                toast.showToast('success', 'Document deleted successfully');
                navigate('/dashboard');
              } catch (error) {
                console.error('Error deleting document:', error);
                toast.showToast('error', 'Failed to delete document');
              }
            }}
            disabled={isLoading}
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!document || !id) return;
              try {
                setIsLoading(true);
                // Use 'web' as default platform for regeneration
                await generateContent(id, 'web', {
                  tone: 'professional',
                  customInstructions: ''
                });
                toast.showToast('success', 'Content regenerated successfully');
                // Reload content after regeneration
                const content = await fetchGeneratedContent(id);
                setGeneratedContent(content);
              } catch (error) {
                console.error('Error regenerating content:', error);
                toast.showToast('error', 'Failed to regenerate content');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-1 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw size={16} className="mr-1" />
                Regenerate
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/edit/${id}`)}
            disabled={isLoading}
          >
            <Edit size={16} className="mr-1" />
            Edit
          </Button>
        </div>
      </div>
      
      {/* Content metadata */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getContentStatus())}`}>
            {getContentStatus().charAt(0).toUpperCase() + getContentStatus().slice(1)}
          </span>
          
          {platforms.map((platform) => (
            <span key={platform} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
              {getPlatformIcon(platform)}
              <span className="ml-1">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
            </span>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {document?.createdAt && (
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>Created: {formatDate(document.createdAt)}</span>
            </div>
          )}
          {document?.updatedAt && (
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>Updated: {formatDate(document.updatedAt)}</span>
            </div>
          )}
          {generatedContent.some(c => c.publishedAt) && (
            <div className="flex items-center">
              <Globe size={14} className="mr-1" />
              <span>Published: {formatDate(generatedContent.find(c => c.publishedAt)?.publishedAt || '')}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-6">
          <button
            className={`pb-2 px-1 text-sm font-medium ${activeTab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button
            className={`pb-2 px-1 text-sm font-medium ${activeTab === 'analytics' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      {activeTab === 'preview' ? (
        <div className="space-y-6">
          {/* Original content */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Original Content</h2>
            <div className="bg-muted/30 p-4 rounded border border-border whitespace-pre-line">
              <p>{document?.content || 'No content available'}</p>
            </div>
          </div>
          
          {/* Platform-specific previews */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Platform Previews</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : generatedContent.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <p>No generated content available yet. Click "Regenerate" to create content.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {generatedContent.map((content) => {
                  const platform = content.platform.toLowerCase() as ContentPlatform;
                  return (
                    <div key={content.id} className="border border-border rounded-lg overflow-hidden">
                      <div className={`p-3 border-b border-border flex items-center justify-between`}
                           style={{ backgroundColor: `${getPlatformColor(platform)}20` }}>
                        <div className="flex items-center">
                          {getPlatformIcon(platform)}
                          <h3 className="font-medium ml-2">{platform.charAt(0).toUpperCase() + platform.slice(1)} Preview</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          {content.status === 'PUBLISHED' ? (
                            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full">
                              Published
                            </span>
                          ) : (
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-900">
                        <div className="whitespace-pre-line">
                          {content.content}
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // In a real implementation, this would open a modal or navigate to an edit page
                              // For now, we'll just show a toast
                              toast.showToast('info', 'Content editing will be implemented in a future update');
                            }}
                          >
                            <Edit size={14} className="mr-1" />
                            Edit
                          </Button>
                          {content.status !== 'PUBLISHED' && (
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  setIsLoading(true);
                                  const success = await publishContent(content.id, content.platform);
                                  if (success) {
                                    toast.showToast('success', `Content published to ${content.platform} successfully`);
                                  }
                                } catch (error) {
                                  console.error('Error publishing content:', error);
                                  toast.showToast('error', 'Failed to publish content');
                                } finally {
                                  setIsLoading(false);
                                }
                              }}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 size={14} className="mr-1 animate-spin" />
                                  Publishing...
                                </>
                              ) : (
                                <>
                                  <Globe size={14} className="mr-1" />
                                  Publish
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Analytics tab content */
        <div className="space-y-6">
          {/* Analytics overview */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
            
            {/* Analytics placeholder */}
            <div className="aspect-[2/1] bg-muted/30 rounded-lg border border-border flex items-center justify-center p-6">
              <div className="text-center">
                <BarChart2 size={48} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Analytics data will be available after content is published</p>
                {generatedContent.some(c => c.status === 'PUBLISHED') ? (
                  <p className="text-sm text-muted-foreground mt-2">Analytics data is being collected. Check back soon!</p>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setActiveTab('preview')}
                  >
                    Go to Preview Tab to Publish Content
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Platform breakdown */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Platform Breakdown</h2>
            
            {platforms.length > 0 ? (
              <div className="space-y-4">
                {platforms.map(platform => (
                  <div key={platform} className="flex items-center p-3 border border-border rounded-lg">
                    {getPlatformIcon(platform)}
                    <div className="flex-1 ml-3">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                        <span className="text-sm text-muted-foreground">No data yet</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: getPlatformColor(platform),
                            width: '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <p>No platforms configured yet. Generate content first.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDetail;