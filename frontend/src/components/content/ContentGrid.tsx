import React from 'react';
import ContentCard, { ContentItem } from './ContentCard';
import { cn } from '../../lib/utils';

interface ContentGridProps {
  items: ContentItem[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
  emptyMessage?: string;
}

const ContentGrid: React.FC<ContentGridProps> = ({
  items,
  onEdit,
  onDelete,
  onView,
  onShare,
  className,
  emptyMessage = "No content items found"
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border rounded-lg bg-muted/30">
        <p className="text-muted-foreground text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      className
    )}>
      {items.map((item) => (
        <ContentCard
          key={item.id}
          content={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onShare={onShare}
        />
      ))}
    </div>
  );
};

export default ContentGrid;