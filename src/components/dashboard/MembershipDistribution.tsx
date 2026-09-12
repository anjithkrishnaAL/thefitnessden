import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { MembershipDistributionItem } from '../../types';

interface MembershipDistributionProps {
  data: MembershipDistributionItem[];
  loading?: boolean;
  error?: boolean;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: MembershipDistributionItem;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-den-surface border border-den-border rounded-xl px-3 py-2.5 shadow-den-lg">
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: item.payload.color }}
        />
        <span className="text-xs text-den-muted">{item.name}</span>
      </div>
      <p className="text-sm font-semibold text-den-text mt-1">{item.value} members</p>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: { value: string; color: string }[] }) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-xs text-den-muted">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function MembershipDistribution({ data, loading, error }: MembershipDistributionProps) {
  return (
    <div className="bg-den-card border border-den-border rounded-xl p-5 h-full flex flex-col">
      <CardHeader className="mb-0">
        <div>
          <CardTitle>Membership Distribution</CardTitle>
          <CardDescription>Breakdown by plan type</CardDescription>
        </div>
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <PieIcon size={15} className="text-amber-400" />
        </div>
      </CardHeader>

      <div className="flex-1 mt-4 min-h-[200px] flex items-center">
        {loading ? (
          <div className="w-full flex flex-col items-center gap-4">
            <Skeleton circle className="w-32 h-32" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        ) : error ? (
          <EmptyState message="Unable to load membership data." />
        ) : !data.length ? (
          <EmptyState
            message="No membership data yet"
            hint="Distribution will appear once memberships are created."
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-6">
      <div className="w-10 h-10 rounded-xl bg-den-surface border border-den-border flex items-center justify-center mb-3">
        <PieIcon size={18} className="text-den-muted" />
      </div>
      <p className="text-sm font-medium text-den-muted">{message}</p>
      {hint && <p className="text-xs text-den-subtle mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}
