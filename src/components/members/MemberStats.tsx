import React from 'react';
import { Users, UserCheck, UserMinus, CalendarPlus } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import type { MemberStats } from '../../types';

interface MemberStatsProps {
  stats: MemberStats;
  loading?: boolean;
}

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  iconClass: string;
  loading?: boolean;
}

function StatTile({ icon, label, value, sub, iconClass, loading }: StatTileProps) {
  if (loading) {
    return (
      <div className="bg-den-card border border-den-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton circle className="w-8 h-8" />
        </div>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-2.5 w-28" />
      </div>
    );
  }

  return (
    <div className="bg-den-card border border-den-border rounded-xl p-4 hover:border-den-borderHover hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-den-muted uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${iconClass}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-den-text tracking-tight mb-1">
        {value.toLocaleString()}
      </p>
      {sub && <p className="text-xs text-den-muted">{sub}</p>}
    </div>
  );
}

export function MemberStats({ stats, loading }: MemberStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatTile
        label="Total Members"
        value={stats.total}
        sub={stats.total === 0 ? 'No members yet' : 'All time registrations'}
        icon={<Users size={16} />}
        iconClass="bg-den-accent/10 border-den-accent/20 text-den-accent"
        loading={loading}
      />
      <StatTile
        label="Active Members"
        value={stats.active}
        sub={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% of total` : 'None active'}
        icon={<UserCheck size={16} />}
        iconClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        loading={loading}
      />
      <StatTile
        label="Inactive Members"
        value={stats.inactive}
        sub={stats.inactive === 0 ? 'All members active' : 'Not currently active'}
        icon={<UserMinus size={16} />}
        iconClass="bg-amber-500/10 border-amber-500/20 text-amber-400"
        loading={loading}
      />
      <StatTile
        label="New This Month"
        value={stats.newThisMonth}
        sub={stats.newThisMonth === 0 ? 'None added yet' : `Added this month`}
        icon={<CalendarPlus size={16} />}
        iconClass="bg-blue-500/10 border-blue-500/20 text-blue-400"
        loading={loading}
      />
    </div>
  );
}
