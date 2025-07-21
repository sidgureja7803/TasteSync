import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Plus,
  BarChart2,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import ContentGrid from '../components/content/ContentGrid';
import { ContentItem, ContentPlatform } from '../components/content/ContentCard';
import { useDocuments } from '../context/DocumentsContext';
import { useContent } from '../context/ContentContext';
import { useToast } from '../components/ui/toast-container';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { documents, fetchDocuments, deleteDocument, isLoading: docsLoading } = useDocuments();
  const { generatedContent, fetchGeneratedContent, deleteGeneratedContent, isLoading: contentLoading } = useContent();
  const toast = useToast();
  
  // Local state
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalContent: 0,
    publishedPosts: 0,
    totalEngagement: 0,
    avgConversion: 0
  });
  
  // Activity feed data - we'll keep this mock for now
  // In a real implementation, this would come from an API
  const activityItems = [
    { id: 1, type: 'publish', content: 'Your post "How AI is Transforming Content Creation" was published to Twitter', time: '2 hours ago', icon: <CheckCircle2 size={16} className="text-green-500" /> },
    { id: 2, type: 'engagement', content: 'Your LinkedIn post received 24 new engagements', time: 'Yesterday', icon: <TrendingUp size={16} className="text-blue-500" /> },
    { id: 3, type: 'alert', content: 'Scheduled post for Instagram failed to publish', time: '2 days ago', icon: <AlertCircle size={16} className="text-red-500" /> },
    { id: 4, type: 'system', content: 'System maintenance completed successfully', time: '3 days ago', icon: <Settings size={16} className="text-gray-500" /> },
  ];
  
  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchDocuments();
        // For now, we'll just fetch content for the first document if available
        if (documents.length > 0) {
          await fetchGeneratedContent(documents[0].id);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.showToast('error', 'Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Map documents to ContentItem format
  useEffect(() => {
    if (documents.length > 0) {
      const mappedContent: ContentItem[] = documents.map(doc => {
        // Determine platforms from generated content
        const platforms: ContentPlatform[] = doc.generatedContent
          ? doc.generatedContent.map(gc => gc.platform.toLowerCase() as ContentPlatform)
          : ['web'];
        
        // Determine status (simplified for now)
        const status = doc.generatedContent && doc.generatedContent.length > 0 ? 'published' : 'draft';
        
        return {
          id: doc.id,
          title: doc.title,
          description: doc.content.substring(0, 120) + (doc.content.length > 120 ? '...' : ''),
          status: status as any,
          platforms,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          // We don't have thumbnails in our data model yet, so using a placeholder
          thumbnailUrl: `https://source.unsplash.com/random/300x200?sig=${doc.id}`
        };
      });
      
      setRecentContent(mappedContent.slice(0, 4)); // Show only the 4 most recent
      
      // Update stats
      setStats({
        totalContent: documents.length,
        publishedPosts: documents.filter(doc => doc.generatedContent && doc.generatedContent.length > 0).length,
        totalEngagement: Math.floor(Math.random() * 2000), // Mock data for now
        avgConversion: parseFloat((Math.random() * 5).toFixed(1)) // Mock data for now
      });
    }
  }, [documents]);
  
  // Handler functions
  const handleEdit = (id: string) => {
    navigate(`/content/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteDocument(id);
      if (success) {
        toast.showToast('success', 'Document deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.showToast('error', 'Failed to delete document. Please try again.');
    }
  };

  const handleView = (id: string) => {
    navigate(`/content/${id}`);
  };

  const handleShare = (id: string) => {
    // This would be implemented with a sharing API
    toast.showToast('info', 'Sharing functionality will be implemented soon');
  };

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your TasteSync dashboard. Here you can manage your content and see analytics.
        </p>
      </div>
      
      {/* Statistics overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Content</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalContent}</h3>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <TrendingUp size={14} className="mr-1" />
            <span>12% increase this month</span>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Published Posts</p>
              <h3 className="text-2xl font-bold mt-1">{stats.publishedPosts}</h3>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <TrendingUp size={14} className="mr-1" />
            <span>8% increase this month</span>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Engagement</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalEngagement.toLocaleString()}</h3>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <TrendingUp size={14} className="mr-1" />
            <span>24% increase this month</span>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Avg. Conversion</p>
              <h3 className="text-2xl font-bold mt-1">{stats.avgConversion}%</h3>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <TrendingUp size={14} className="mr-1" />
            <span>0.5% increase this month</span>
          </div>
        </div>
      </div>
      
      {/* Recent content section */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Content</h2>
          <Link to="/generate">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus size={16} />
              <span>Create New</span>
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading content...</span>
          </div>
        ) : (
          <ContentGrid
            items={recentContent}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onShare={handleShare}
            emptyMessage="You haven't created any content yet. Click 'Create New' to get started."
          />
        )}
        
        {recentContent.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">View All Content</Button>
          </div>
        )}
      </div>
      
      {/* Quick actions and Activity feed in two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/generate" className="block">
              <Button variant="outline" className="w-full justify-start text-left">
                <Plus size={16} className="mr-2" />
                Create New Content
              </Button>
            </Link>
            <Link to="/dashboard/analytics" className="block">
              <Button variant="outline" className="w-full justify-start text-left">
                <BarChart2 size={16} className="mr-2" />
                View Analytics
              </Button>
            </Link>
            <Link to="/profile" className="block">
              <Button variant="outline" className="w-full justify-start text-left">
                <Settings size={16} className="mr-2" />
                Manage Account
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Activity feed */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
          <div className="space-y-4">
            {activityItems.map((item) => (
              <div key={item.id} className="flex items-start pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="mr-3 mt-0.5">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-sm">{item.content}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">View All Activity</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;