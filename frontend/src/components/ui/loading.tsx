import React from 'react';
import { cn } from '../../lib/utils';

export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoadingType = 'spinner' | 'dots' | 'pulse';

interface LoadingProps {
  size?: LoadingSize;
  type?: LoadingType;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  type = 'spinner',
  text,
  fullScreen = false,
  className
}) => {
  // Size classes for different loading types
  const sizeClasses = {
    spinner: {
      xs: 'h-4 w-4 border-2',
      sm: 'h-6 w-6 border-2',
      md: 'h-8 w-8 border-2',
      lg: 'h-12 w-12 border-3',
      xl: 'h-16 w-16 border-4'
    },
    dots: {
      xs: 'h-1 w-1 mx-0.5',
      sm: 'h-2 w-2 mx-0.5',
      md: 'h-2.5 w-2.5 mx-1',
      lg: 'h-3 w-3 mx-1',
      xl: 'h-4 w-4 mx-1.5'
    },
    pulse: {
      xs: 'h-4 w-4',
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16'
    }
  };

  // Text size classes
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Render spinner loading
  const renderSpinner = () => (
    <div 
      className={cn(
        "border-primary/30 border-t-primary rounded-full animate-spin",
        sizeClasses.spinner[size]
      )}
    />
  );

  // Render dots loading
  const renderDots = () => (
    <div className="flex items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-primary",
            sizeClasses.dots[size],
            "animate-bounce",
          )}
          style={{ 
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );

  // Render pulse loading
  const renderPulse = () => (
    <div 
      className={cn(
        "rounded-full bg-primary/30 animate-pulse",
        sizeClasses.pulse[size]
      )}
    />
  );

  // Render loading indicator based on type
  const renderLoading = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  // If fullScreen, render a full-screen loading overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        {renderLoading()}
        {text && (
          <p className={cn("mt-4 text-foreground", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // Otherwise, render an inline loading indicator
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {renderLoading()}
      {text && (
        <p className={cn("mt-2 text-foreground", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
};

// Skeleton loading component
interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string;
  height?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  return (
    <div
      className={cn(
        "bg-muted/60",
        variant === 'circular' && "rounded-full",
        variant === 'rectangular' && "rounded-md",
        variant === 'text' && "rounded h-4 w-2/3",
        animation === 'pulse' && "animate-pulse",
        animation === 'wave' && "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      style={{
        width: width,
        height: height
      }}
    />
  );
};

export default Loading;