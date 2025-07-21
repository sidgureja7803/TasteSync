import React, { useState } from 'react';
import Modal from '../ui/modal';
import { Button } from '../ui/button';
import { ContentItem, ContentPlatform, ContentStatus } from './ContentCard';
import { 
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ContentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: Partial<ContentItem>) => void;
  initialContent?: Partial<ContentItem>;
  isLoading?: boolean;
  title?: string;
}

const ContentFormModal: React.FC<ContentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialContent,
  isLoading = false,
  title = 'Create Content'
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<ContentItem>>(
    initialContent || {
      title: '',
      description: '',
      thumbnailUrl: '',
      status: 'draft',
      platforms: []
    }
  );

  // Reset form when modal opens/closes or initialContent changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialContent || {
        title: '',
        description: '',
        thumbnailUrl: '',
        status: 'draft',
        platforms: []
      });
    }
  }, [isOpen, initialContent]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle platform toggle
  const togglePlatform = (platform: ContentPlatform) => {
    setFormData(prev => {
      const currentPlatforms = prev.platforms || [];
      if (currentPlatforms.includes(platform)) {
        return {
          ...prev,
          platforms: currentPlatforms.filter(p => p !== platform)
        };
      } else {
        return {
          ...prev,
          platforms: [...currentPlatforms, platform]
        };
      }
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Platform options
  const platformOptions: { value: ContentPlatform; label: string; icon: React.ReactNode }[] = [
    { value: 'twitter', label: 'Twitter', icon: <Twitter size={18} /> },
    { value: 'instagram', label: 'Instagram', icon: <Instagram size={18} /> },
    { value: 'facebook', label: 'Facebook', icon: <Facebook size={18} /> },
    { value: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={18} /> },
    { value: 'youtube', label: 'YouTube', icon: <Youtube size={18} /> },
    { value: 'web', label: 'Website', icon: <Globe size={18} /> }
  ];

  // Status options
  const statusOptions: { value: ContentStatus; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter content title"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="Enter content description"
            required
          />
        </div>

        {/* Thumbnail URL */}
        <div className="space-y-2">
          <label htmlFor="thumbnailUrl" className="block text-sm font-medium">
            Thumbnail URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={formData.thumbnailUrl || ''}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter thumbnail URL"
            />
            <Button type="button" variant="outline" size="icon" className="flex-shrink-0">
              <ImageIcon size={18} />
            </Button>
          </div>
          {formData.thumbnailUrl && (
            <div className="mt-2 relative aspect-video w-full max-w-xs mx-auto border border-border rounded-md overflow-hidden">
              <img 
                src={formData.thumbnailUrl} 
                alt="Thumbnail preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                }}
              />
            </div>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status || 'draft'}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Platforms */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {platformOptions.map(platform => {
              const isSelected = formData.platforms?.includes(platform.value);
              return (
                <button
                  key={platform.value}
                  type="button"
                  onClick={() => togglePlatform(platform.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors",
                    isSelected 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-background border-input text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {platform.icon}
                  <span>{platform.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : initialContent?.id ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContentFormModal;