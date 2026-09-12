import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-den-surface border border-den-border flex items-center justify-center mb-4 text-den-muted">
        {icon ?? <Inbox size={22} />}
      </div>
      <p className="text-sm font-semibold text-den-text mb-1">{title}</p>
      {description && (
        <p className="text-xs text-den-muted max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
