import React from 'react';
import { cn } from '../../lib/cn';

interface Tab {
  id: string;
  label: string;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export function Tabs({ tabs, active, onChange, variant = 'underline', className }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 bg-den-surface border border-den-border rounded-xl p-1',
          className
        )}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
              tab.id === active
                ? 'bg-den-accent text-black shadow-den-accent-sm'
                : 'text-den-muted hover:text-den-text',
              tab.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'text-2xs font-semibold px-1.5 py-0.5 rounded-md',
                  tab.id === active
                    ? 'bg-black/20 text-black'
                    : 'bg-den-border text-den-muted'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-0 border-b border-den-border overflow-x-auto no-scrollbar',
        className
      )}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap',
            'transition-all duration-150',
            tab.id === active
              ? 'border-den-accent text-den-accent'
              : 'border-transparent text-den-muted hover:text-den-text hover:border-den-borderHover',
            tab.disabled && 'opacity-40 cursor-not-allowed'
          )}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span
              className={cn(
                'text-2xs font-semibold px-1.5 py-0.5 rounded-md',
                tab.id === active
                  ? 'bg-den-accent/15 text-den-accent'
                  : 'bg-den-border text-den-muted'
              )}
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
