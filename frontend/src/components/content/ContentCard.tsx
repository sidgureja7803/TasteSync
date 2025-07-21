import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Share2,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Globe
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

// Define content status types
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';

// Define platform types
export type ContentPlatform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'web';

// Define content item interface
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  status: ContentStatus;
  platforms: ContentPlatform[];
  createdAt: string;
  updatedAt: string;
}

interface ContentCardProps {
  content: ContentItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onEdit,
  onDelete,
  onView,
  onShare,
  className
}) => {
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

  // Get status badge color based on status
  const getStatusColor = (status: ContentStatus) => {
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

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      {/* Card header with thumbnail */}
      <div className="relative aspect-video bg-muted">
        {content.thumbnailUrl ? (
          <img 
            src={content.thumbnailUrl} 
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">No thumbnail</span>
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            getStatusColor(content.status)
          )}>
            {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
          </span>
        </div>
        
        {/* Platform icons */}
        <div className="absolute top-2 right-2 flex space-x-1">
          {content.platforms.map((platform) => (
            <div key={platform} className="w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
              {getPlatformIcon(platform)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-4">
        <Link to={`/content/${content.id}`}>
          <h3 className="text-lg font-semibold line-clamp-1 hover:text-primary transition-colors">
            {content.title}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
          {content.description}
        </p>
        
        {/* Card footer */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Updated {formatDate(content.updatedAt)}
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-1">
            {onView && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => onView(content.id)}
                title="View"
              >
                <Eye size={16} />
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => onEdit(content.id)}
                title="Edit"
              >
                <Edit size={16} />
              </Button>
            )}
            {onShare && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => onShare(content.id)}
                title="Share"
              >
                <Share2 size={16} />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10" 
                onClick={() => onDelete(content.id)}
                title="Delete"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;