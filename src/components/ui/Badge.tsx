import React from 'react';
import { cn } from '../../lib/cn';
import type { BadgeVariant } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/8 text-den-text border-white/10',
  accent: 'bg-den-accent/15 text-den-accent border-den-accent/25',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  danger: 'bg-red-500/15 text-red-400 border-red-500/25',
  info: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
};

const dotVariantClasses: Record<BadgeVariant, string> = {
  default: 'bg-den-muted',
  accent: 'bg-den-accent',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-sky-400',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-lg border',
        size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-1',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full shrink-0',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            dotVariantClasses[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}
