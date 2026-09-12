import React from 'react';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import type { Member, BadgeVariant } from '../../types';
import { formatDate } from '../../utils/helpers';

interface MemberTableProps {
  members: Member[];
  loading?: boolean;
  onView: (m: Member) => void;
  onEdit: (m: Member) => void;
  onDelete: (m: Member) => void;
}

const statusVariant: Record<string, BadgeVariant> = {
  active:    'success',
  inactive:  'warning',
  suspended: 'danger',
};

function ActionMenu({ member, onView, onEdit, onDelete }: {
  member: Member;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-den-muted hover:text-den-text hover:bg-white/5 transition-colors"
        aria-label={`Actions for ${member.full_name}`}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-36 bg-den-surface border border-den-border rounded-xl shadow-den-lg overflow-hidden">
          <button
            onClick={() => { onView(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-den-text hover:bg-white/5 transition-colors"
          >
            <Eye size={13} className="text-den-muted" /> View
          </button>
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-den-text hover:bg-white/5 transition-colors"
          >
            <Pencil size={13} className="text-den-muted" /> Edit
          </button>
          <div className="mx-3 border-t border-den-border" />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      <td className="py-3 pl-4">
        <div className="flex items-center gap-3">
          <Skeleton circle className="w-8 h-8 shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-36" />
          </div>
        </div>
      </td>
      <td className="py-3 px-3"><Skeleton className="h-3 w-20" /></td>
      <td className="py-3 px-3"><Skeleton className="h-3 w-28" /></td>
      <td className="py-3 px-3"><Skeleton className="h-3 w-24" /></td>
      <td className="py-3 px-3"><Skeleton className="h-3 w-20" /></td>
      <td className="py-3 px-3"><Skeleton className="h-3 w-20" /></td>
      <td className="py-3 pr-4"><Skeleton circle className="w-6 h-6" /></td>
    </tr>
  );
}

export function MemberTable({ members, loading, onView, onEdit, onDelete }: MemberTableProps) {
  return (
    <div className="hidden sm:block overflow-x-auto rounded-xl border border-den-border bg-den-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-den-border">
            {['Member', 'Member ID', 'Contact', 'Membership', 'Status', 'Joined', ''].map(h => (
              <th
                key={h}
                className={`text-left text-xs text-den-muted font-medium py-3 ${h === '' ? 'w-10 pr-4' : 'px-3'} ${h === 'Member' ? 'pl-4' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-den-border/60">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            : members.map(m => (
              <tr
                key={m.id}
                className="hover:bg-white/[0.015] transition-colors group"
              >
                {/* Member */}
                <td className="py-3 pl-4 pr-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.full_name} src={m.profile_photo_url ?? undefined} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-den-text truncate max-w-[140px]">{m.full_name}</p>
                      {m.email && (
                        <p className="text-xs text-den-muted truncate max-w-[140px]">{m.email}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Member ID */}
                <td className="py-3 px-3">
                  <span className="text-xs font-mono text-den-muted">{m.member_id}</span>
                </td>

                {/* Contact */}
                <td className="py-3 px-3">
                  <p className="text-xs text-den-text">{m.phone ?? <span className="text-den-muted">—</span>}</p>
                  {m.email && <p className="text-xs text-den-muted truncate max-w-[130px]">{m.email}</p>}
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  {m.current_membership ? <div><p className="text-xs text-den-text">{m.current_membership.plan_name}</p><p className="text-2xs text-den-muted">Ends {m.current_membership.end_date}</p></div> : <span className="text-xs text-den-muted italic">Not assigned</span>}
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <Badge variant={statusVariant[m.status] ?? 'default'} size="sm" dot>
                    {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                  </Badge>
                </td>

                {/* Joined */}
                <td className="py-3 px-3">
                  <span className="text-xs text-den-muted">{formatDate(m.created_at)}</span>
                </td>

                {/* Actions */}
                <td className="py-3 pr-4">
                  <ActionMenu
                    member={m}
                    onView={() => onView(m)}
                    onEdit={() => onEdit(m)}
                    onDelete={() => onDelete(m)}
                  />
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
