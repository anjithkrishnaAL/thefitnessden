import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface DashboardHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function DashboardHeader({ onRefresh, refreshing }: DashboardHeaderProps) {
  const { profile } = useAuth();

  const firstName = profile?.full_name
    ? profile.full_name.split(' ')[0]
    : 'there';

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-den-text leading-tight">
          {getGreeting()},{' '}
          <span className="text-gradient-accent">{firstName}</span>
          <span className="text-den-text"> 👋</span>
        </h1>
        <p className="text-sm text-den-muted mt-1">
          Here's what's happening at TheFitnessDen today.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="text-xs text-den-muted hidden sm:block">{getFormattedDate()}</p>
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />}
          onClick={onRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
