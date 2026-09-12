import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import type { Member, BadgeVariant } from '../../types';
import { formatDate } from '../../utils/helpers';

interface MemberCardProps {
  member: Member;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const statusVariant: Record<string, BadgeVariant> = {
  active:    'success',
  inactive:  'warning',
  suspended: 'danger',
};

export function MemberCard({ member: m, onView, onEdit, onDelete }: MemberCardProps) {
  return (
    <div className="bg-den-card border border-den-border rounded-xl p-4 hover:border-den-borderHover transition-colors">
      <div className="flex items-start gap-3">
        <button onClick={onView} className="shrink-0">
          <Avatar name={m.full_name} src={m.profile_photo_url ?? undefined} size="lg" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button onClick={onView} className="text-left">
                <p className="text-sm font-semibold text-den-text truncate hover:text-den-accent transition-colors">
                  {m.full_name}
                </p>
              </button>
              <p className="text-xs font-mono text-den-muted mt-0.5">{m.member_id}</p>
            </div>
            <Badge variant={statusVariant[m.status] ?? 'default'} size="sm" dot>
              {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
            </Badge>
          </div>

          <div className="mt-2 space-y-1">
            {m.phone && (
              <p className="text-xs text-den-muted">{m.phone}</p>
            )}
            {m.email && (
              <p className="text-xs text-den-muted truncate">{m.email}</p>
            )}
            <p className="text-xs text-den-subtle">Joined {formatDate(m.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-den-border/50">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs text-den-muted hover:text-den-text bg-den-surface rounded-xl hover:bg-white/5 transition-colors"
        >
          <Eye size={13} /> View
        </button>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs text-den-muted hover:text-den-text bg-den-surface rounded-xl hover:bg-white/5 transition-colors"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs text-red-400 hover:text-red-300 bg-red-500/5 rounded-xl hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

export function MemberCardSkeleton() {
  return (
    <div className="bg-den-card border border-den-border rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Skeleton circle className="w-10 h-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-den-border/50">
        <Skeleton className="h-8 flex-1 rounded-xl" />
        <Skeleton className="h-8 flex-1 rounded-xl" />
        <Skeleton className="h-8 flex-1 rounded-xl" />
      </div>
    </div>
  );
}
