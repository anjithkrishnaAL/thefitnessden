import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Skeleton } from '../ui/Skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;          // signed %; positive=up, negative=down, 0=flat
  trendLabel?: string;     // e.g. "vs last month"
  accentColor?: 'green' | 'blue' | 'amber' | 'red' | 'purple';
  loading?: boolean;
}

const accentMap = {
  green:  { icon: 'bg-den-accent/10 border-den-accent/20 text-den-accent', glow: 'shadow-den-accent-sm' },
  blue:   { icon: 'bg-blue-500/10 border-blue-500/20 text-blue-400', glow: '' },
  amber:  { icon: 'bg-amber-500/10 border-amber-500/20 text-amber-400', glow: '' },
  red:    { icon: 'bg-red-500/10 border-red-500/20 text-red-400', glow: '' },
  purple: { icon: 'bg-violet-500/10 border-violet-500/20 text-violet-400', glow: '' },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel = 'vs last month',
  accentColor = 'green',
  loading = false,
}: StatCardProps) {
  const accent = accentMap[accentColor];

  if (loading) {
    return (
      <div className="bg-den-card border border-den-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton circle className="w-9 h-9" />
        </div>
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-3 w-36" />
      </div>
    );
  }

  const trendPositive = typeof trend === 'number' && trend > 0;
  const trendNegative = typeof trend === 'number' && trend < 0;
  const trendFlat     = typeof trend === 'number' && trend === 0;
  const showTrend     = typeof trend === 'number';

  return (
    <div
      className={cn(
        'bg-den-card border border-den-border rounded-xl p-5',
        'hover:border-den-borderHover hover:bg-den-cardHover hover:-translate-y-0.5',
        'transition-all duration-200 group',
        accent.glow && 'hover:shadow-den-accent-sm'
      )}
    >
      {/* Top row: title + icon */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-den-muted uppercase tracking-wider">
          {title}
        </p>
        <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0', accent.icon)}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-den-text tracking-tight mb-1">
        {value}
      </p>

      {/* Subtitle + trend */}
      <div className="flex items-center gap-2 flex-wrap">
        {showTrend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
              trendPositive && 'bg-emerald-500/10 text-emerald-400',
              trendNegative && 'bg-red-500/10 text-red-400',
              trendFlat     && 'bg-den-surface text-den-muted'
            )}
          >
            {trendPositive && <TrendingUp size={11} />}
            {trendNegative && <TrendingDown size={11} />}
            {trendFlat     && <Minus size={11} />}
            {trendPositive ? '+' : ''}{trend}%
          </span>
        )}
        {subtitle && (
          <p className="text-xs text-den-muted">{subtitle}</p>
        )}
        {showTrend && trendLabel && (
          <p className="text-xs text-den-muted">{trendLabel}</p>
        )}
      </div>
    </div>
  );
}
