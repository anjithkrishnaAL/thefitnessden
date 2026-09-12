import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import type { RecentMember } from '../../types';
import { formatDate } from '../../utils/helpers';

interface RecentMembersProps {
  data: RecentMember[];
  loading?: boolean;
  error?: boolean;
}

const statusVariant: Record<RecentMember['status'], 'success' | 'danger' | 'warning'> = {
  active:   'success',
  inactive: 'warning',
  expired:  'danger',
};

export function RecentMembers({ data, loading, error }: RecentMembersProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-den-card border border-den-border rounded-xl p-5 flex flex-col h-full">
      <CardHeader>
        <div>
          <CardTitle>Recent Members</CardTitle>
          <CardDescription>Latest additions to your gym</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowRight size={14} />}
          iconPosition="right"
          onClick={() => navigate('/members')}
        >
          View all
        </Button>
      </CardHeader>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton circle className="w-8 h-8 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState />
      ) : !data.length ? (
        <EmptyState navigate={navigate} />
      ) : (
        <>
          {/* Table — desktop */}
          <div className="hidden sm:block overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-den-border">
                  <th className="text-left text-xs text-den-muted font-medium pb-2.5 pl-1">Member</th>
                  <th className="text-left text-xs text-den-muted font-medium pb-2.5">ID</th>
                  <th className="text-left text-xs text-den-muted font-medium pb-2.5">Plan</th>
                  <th className="text-left text-xs text-den-muted font-medium pb-2.5">Joined</th>
                  <th className="text-left text-xs text-den-muted font-medium pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-den-border/50">
                {data.map(member => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-1">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={member.name} src={member.avatarUrl ?? undefined} size="sm" />
                        <span className="font-medium text-den-text text-xs truncate max-w-[120px]">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-den-muted font-mono">{member.memberId}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-den-text">{member.membershipPlan}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-den-muted">{formatDate(member.joinedAt)}</span>
                    </td>
                    <td className="py-3">
                      <Badge variant={statusVariant[member.status]} size="sm">
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards — mobile */}
          <div className="sm:hidden space-y-2">
            {data.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-den-surface/50 border border-den-border/50"
              >
                <Avatar name={member.name} src={member.avatarUrl ?? undefined} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-den-text truncate">{member.name}</p>
                  <p className="text-xs text-den-muted">{member.membershipPlan} · {formatDate(member.joinedAt)}</p>
                </div>
                <Badge variant={statusVariant[member.status]} size="sm">
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
      <div className="w-12 h-12 rounded-xl bg-den-surface border border-den-border flex items-center justify-center mb-3">
        <Users size={22} className="text-den-muted" />
      </div>
      <p className="text-sm font-medium text-den-text mb-1">No members yet</p>
      <p className="text-xs text-den-muted mb-4">Start building your member base.</p>
      <Button
        variant="outline"
        size="sm"
        icon={<ArrowRight size={14} />}
        iconPosition="right"
        onClick={() => navigate('/members')}
      >
        Add Member
      </Button>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex-1 flex items-center justify-center py-8">
      <p className="text-sm text-den-muted">Unable to load member data.</p>
    </div>
  );
}
