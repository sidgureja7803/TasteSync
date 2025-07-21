import React, { useState } from 'react';
import { Button } from '../ui/button';
import RichTextEditor from '../ui/rich-text-editor';
import { cn } from '../../lib/utils';

interface ProfileFormData {
  displayName: string;
  bio: string;
  email: string;
  website: string;
  location: string;
  avatarUrl: string;
}

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => void;
  isLoading?: boolean;
  className?: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  className
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: initialData?.displayName || '',
    bio: initialData?.bio || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
    location: initialData?.location || '',
    avatarUrl: initialData?.avatarUrl || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof ProfileFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBioChange = (value: string) => {
    setFormData(prev => ({ ...prev, bio: value }));
    
    // Clear error when bio is edited
    if (errors.bio) {
      setErrors(prev => ({ ...prev, bio: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.website && !/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/.test(formData.website)) {
      newErrors.website = 'Website URL is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Avatar preview and upload */}
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
            {formData.avatarUrl ? (
              <img 
                src={formData.avatarUrl} 
                alt="Profile avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Avatar';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
          >
            +
          </Button>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <label htmlFor="avatarUrl" className="block text-sm font-medium">
              Profile Picture URL
            </label>
            <input
              type="text"
              id="avatarUrl"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Upload a profile picture or provide a URL to an existing image.
          </p>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-1">
        <label htmlFor="displayName" className="block text-sm font-medium">
          Display Name*
        </label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          className={cn(
            "w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            errors.displayName && "border-destructive focus:ring-destructive"
          )}
          placeholder="Your display name"
        />
        {errors.displayName && (
          <p className="text-sm text-destructive mt-1">{errors.displayName}</p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-1">
        <RichTextEditor
          id="bio"
          label="Bio"
          value={formData.bio}
          onChange={handleBioChange}
          placeholder="Tell us about yourself..."
          error={errors.bio}
        />
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium">
          Email Address*
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={cn(
            "w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            errors.email && "border-destructive focus:ring-destructive"
          )}
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email}</p>
        )}
      </div>

      {/* Website */}
      <div className="space-y-1">
        <label htmlFor="website" className="block text-sm font-medium">
          Website
        </label>
        <input
          type="text"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className={cn(
            "w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            errors.website && "border-destructive focus:ring-destructive"
          )}
          placeholder="https://yourwebsite.com"
        />
        {errors.website && (
          <p className="text-sm text-destructive mt-1">{errors.website}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-1">
        <label htmlFor="location" className="block text-sm font-medium">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="City, Country"
        />
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-3 pt-4">
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
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;