import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import type { ExpiringMembership } from '../../types';
import { formatDate } from '../../utils/helpers';

interface ExpiringMembershipsProps {
  data: ExpiringMembership[];
  loading?: boolean;
  error?: boolean;
}

function urgencyVariant(days: number): 'danger' | 'warning' | 'info' {
  if (days <= 1) return 'danger';
  if (days <= 3) return 'warning';
  return 'info';
}

function urgencyLabel(days: number): string {
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export function ExpiringMemberships({ data, loading, error }: ExpiringMembershipsProps) {
  return (
    <div className="bg-den-card border border-den-border rounded-xl p-5 flex flex-col h-full">
      <CardHeader>
        <div>
          <CardTitle>Expiring Soon</CardTitle>
          <CardDescription>Memberships expiring within 7 days</CardDescription>
        </div>
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Clock size={15} className="text-amber-400" />
        </div>
      </CardHeader>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton circle className="w-8 h-8 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center py-6">
          <p className="text-sm text-den-muted">Unable to load membership data.</p>
        </div>
      ) : !data.length ? (
        /* All good — no expiring memberships */
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
            <CheckCircle2 size={22} className="text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-den-text mb-1">All memberships are up to date</p>
          <p className="text-xs text-den-muted">No memberships expiring in the next 7 days.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-den-border/60 bg-den-surface/40 hover:border-den-borderHover transition-colors"
            >
              <Avatar name={item.memberName} src={item.avatarUrl ?? undefined} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-den-text truncate">{item.memberName}</p>
                <p className="text-xs text-den-muted">
                  {item.membershipPlan} · Expires {formatDate(item.expiresAt)}
                </p>
              </div>
              <Badge variant={urgencyVariant(item.daysRemaining)} size="sm">
                {urgencyLabel(item.daysRemaining)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
