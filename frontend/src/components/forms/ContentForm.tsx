import React, { useState } from 'react';
import { Button } from '../ui/button';
import RichTextEditor from '../ui/rich-text-editor';
import { ContentPlatform, ContentStatus } from '../content/ContentCard';
import { 
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Globe,
  Calendar,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ContentFormData {
  title: string;
  description: string;
  content: string;
  thumbnailUrl: string;
  status: ContentStatus;
  platforms: ContentPlatform[];
  scheduledDate?: string;
  scheduledTime?: string;
}

interface ContentFormProps {
  initialData?: Partial<ContentFormData>;
  onSubmit: (data: ContentFormData) => void;
  isLoading?: boolean;
  className?: string;
}

const ContentForm: React.FC<ContentFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  className
}) => {
  const [formData, setFormData] = useState<ContentFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    content: initialData?.content || '',
    thumbnailUrl: initialData?.thumbnailUrl || '',
    status: initialData?.status || 'draft',
    platforms: initialData?.platforms || [],
    scheduledDate: initialData?.scheduledDate || '',
    scheduledTime: initialData?.scheduledTime || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContentFormData, string>>>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof ContentFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle rich text editor content change
  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
    
    // Clear error when content is edited
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: undefined }));
    }
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

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContentFormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (formData.status === 'scheduled') {
      if (!formData.scheduledDate) {
        newErrors.scheduledDate = 'Scheduled date is required';
      }
      if (!formData.scheduledTime) {
        newErrors.scheduledTime = 'Scheduled time is required';
      }
    }
    
    if (formData.platforms.length === 0) {
      newErrors.platforms = 'At least one platform must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
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
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Title */}
      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium">
          Title*
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={cn(
            "w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            errors.title && "border-destructive focus:ring-destructive"
          )}
          placeholder="Enter content title"
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium">
          Description*
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={cn(
            "w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none",
            errors.description && "border-destructive focus:ring-destructive"
          )}
          placeholder="Enter a brief description"
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description}</p>
        )}
      </div>

      {/* Content (Rich Text Editor) */}
      <div className="space-y-1">
        <RichTextEditor
          id="content"
          label="Content*"
          value={formData.content}
          onChange={handleContentChange}
          placeholder="Start creating your content..."
          error={errors.content}
          minHeight="300px"
        />
      </div>

      {/* Thumbnail URL */}
      <div className="space-y-1">
        <label htmlFor="thumbnailUrl" className="block text-sm font-medium">
          Thumbnail URL
        </label>
        <input
          type="text"
          id="thumbnailUrl"
          name="thumbnailUrl"
          value={formData.thumbnailUrl}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter thumbnail URL"
        />
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
      <div className="space-y-1">
        <label htmlFor="status" className="block text-sm font-medium">
          Status*
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
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

      {/* Scheduled date and time (only visible when status is 'scheduled') */}
      {formData.status === 'scheduled' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="scheduledDate" className="block text-sm font-medium flex items-center gap-1">
              <Calendar size={16} />
              <span>Scheduled Date*</span>
            </label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                errors.scheduledDate && "border-destructive focus:ring-destructive"
              )}
            />
            {errors.scheduledDate && (
              <p className="text-sm text-destructive mt-1">{errors.scheduledDate}</p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="scheduledTime" className="block text-sm font-medium flex items-center gap-1">
              <Clock size={16} />
              <span>Scheduled Time*</span>
            </label>
            <input
              type="time"
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                errors.scheduledTime && "border-destructive focus:ring-destructive"
              )}
            />
            {errors.scheduledTime && (
              <p className="text-sm text-destructive mt-1">{errors.scheduledTime}</p>
            )}
          </div>
        </div>
      )}

      {/* Platforms */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Platforms*
        </label>
        <div className="flex flex-wrap gap-2">
          {platformOptions.map(platform => {
            const isSelected = formData.platforms.includes(platform.value);
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
        {errors.platforms && (
          <p className="text-sm text-destructive mt-1">{errors.platforms}</p>
        )}
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : initialData?.title ? "Update Content" : "Create Content"}
        </Button>
      </div>
    </form>
  );
};

export default ContentForm;