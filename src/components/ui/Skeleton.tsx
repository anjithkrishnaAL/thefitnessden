import React from 'react';
import { cn } from '../../lib/cn';

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
  circle?: boolean;
}

export function Skeleton({ className, rounded = false, circle = false }: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer',
        circle ? 'rounded-full' : rounded ? 'rounded-full' : 'rounded-lg',
        className
      )}
      aria-hidden="true"
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-den-card border border-den-border rounded-xl p-5 space-y-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton circle className="w-8 h-8 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}
