import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Get icon based on toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get background color based on toast type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  // Handle close
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 300); // Wait for exit animation to complete
  };

  // Set up auto-dismiss timer
  useEffect(() => {
    if (duration > 0) {
      // Update progress bar
      const step = 10; // Update every 10ms
      const decrement = (step / duration) * 100;
      const id = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(id);
            handleClose();
            return 0;
          }
          return prev - decrement;
        });
      }, step);
      
      setIntervalId(id);
      
      // Auto-dismiss after duration
      const timeoutId = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => {
        clearInterval(id);
        clearTimeout(timeoutId);
      };
    }
  }, [duration]);

  // Pause progress when hovering
  const handleMouseEnter = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // Resume progress when not hovering
  const handleMouseLeave = () => {
    if (duration > 0 && progress > 0) {
      const step = 10; // Update every 10ms
      const decrement = (step / duration) * 100;
      const remainingDuration = (progress / 100) * duration;
      
      const id = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(id);
            handleClose();
            return 0;
          }
          return prev - decrement;
        });
      }, step);
      
      setIntervalId(id);
      
      // Auto-dismiss after remaining duration
      setTimeout(() => {
        handleClose();
      }, remainingDuration);
    }
  };

  return (
    <div
      className={cn(
        "max-w-sm w-full rounded-lg shadow-lg border overflow-hidden transition-all duration-300",
        getBackgroundColor(),
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{title}</p>
            {message && (
              <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            )}
          </div>
          <button
            type="button"
            className="ml-auto flex-shrink-0 -mx-1.5 -my-1.5 bg-transparent text-muted-foreground hover:text-foreground rounded-md p-1.5 inline-flex h-8 w-8 items-center justify-center"
            onClick={handleClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      {duration > 0 && (
        <div className="h-1 bg-background/20">
          <div 
            className={cn(
              "h-full transition-all ease-linear",
              type === 'success' ? "bg-green-500" :
              type === 'error' ? "bg-red-500" :
              type === 'warning' ? "bg-amber-500" :
              "bg-blue-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;