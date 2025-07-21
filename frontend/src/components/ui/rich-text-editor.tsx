import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Quote
} from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  label?: string;
  error?: string;
  id?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  minHeight = '200px',
  maxHeight = '500px',
  label,
  error,
  id = 'rich-text-editor'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  // Handle content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Format commands
  const formatDoc = (command: string, value?: string) => {
    document.execCommand(command, false, value || '');
    handleContentChange();
    editorRef.current?.focus();
  };

  // Insert link
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      formatDoc('createLink', url);
    }
  };

  // Insert image
  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      formatDoc('insertImage', url);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
      )}
      
      <div className={cn(
        "border border-input rounded-md bg-background overflow-hidden",
        error && "border-destructive",
        className
      )}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/50">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => formatDoc('bold')}
            title="Bold"
          >
            <Bold size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => formatDoc('italic')}
            title="Italic"
          >
            <Italic size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => formatDoc('underline')}
            title="Underline"
          >
            <Underline size={16} />
          </Button>
          
          <div className="h-6 w-px bg-border mx-1" />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => formatDoc('formatBlock', '<h1>')}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => formatDoc('formatBlock', '<h2>')}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => formatDoc('formatBlock', '<blockquote>')}
            title="Quote"
          >
            <Quote size={16} />
          </Button>
          
          <div className="h-6 w-px bg-border mx-1" />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => formatDoc('insertUnorderedList')}
            title="Bullet List"
          >
            <List size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => formatDoc('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </Button>
          
          <div className="h-6 w-px bg-border mx-1" />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => formatDoc('justifyLeft')}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => formatDoc('justifyCenter')}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => formatDoc('justifyRight')}
            title="Align Right"
          >
            <AlignRight size={16} />
          </Button>
          
          <div className="h-6 w-px bg-border mx-1" />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={insertLink}
            title="Insert Link"
          >
            <LinkIcon size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={insertImage}
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </Button>
        </div>
        
        {/* Editable content area */}
        <div
          id={id}
          ref={editorRef}
          contentEditable
          className={cn(
            "p-3 outline-none overflow-y-auto",
            !value && !isFocused && "before:content-[attr(data-placeholder)] before:text-muted-foreground"
          )}
          style={{ minHeight, maxHeight }}
          data-placeholder={placeholder}
          onInput={handleContentChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
};

export default RichTextEditor;