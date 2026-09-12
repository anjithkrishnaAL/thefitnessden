import React from 'react';
import { cn } from '../../lib/cn';
import type { Size } from '../../types';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: Size;
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  xs: 'w-6 h-6 text-2xs',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorFromName(name?: string): string {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-den-accent to-den-accent-dim',
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const showInitials = !src || imgError;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {showInitials ? (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center bg-gradient-to-br font-semibold text-white',
            getColorFromName(name)
          )}
        >
          {getInitials(name)}
        </div>
      ) : (
        <img
          src={src}
          alt={name ?? 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}
