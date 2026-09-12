import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { MemberGrowthDataPoint } from '../../types';

interface MemberGrowthChartProps {
  data: MemberGrowthDataPoint[];
  loading?: boolean;
  error?: boolean;
}

interface TooltipPayloadItem {
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-den-surface border border-den-border rounded-xl px-3 py-2.5 shadow-den-lg">
      <p className="text-xs text-den-muted mb-1">{label}</p>
      <p className="text-sm font-semibold text-den-text">
        {payload[0].value} new member{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

const hasData = (data: MemberGrowthDataPoint[]) => data.some(d => d.newMembers > 0);

export function MemberGrowthChart({ data, loading, error }: MemberGrowthChartProps) {
  return (
    <div className="bg-den-card border border-den-border rounded-xl p-5 h-full flex flex-col">
      <CardHeader className="mb-0">
        <div>
          <CardTitle>Member Growth</CardTitle>
          <CardDescription>New members over the last 6 months</CardDescription>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Users size={15} className="text-blue-400" />
        </div>
      </CardHeader>

      <div className="flex-1 mt-5 min-h-[200px]">
        {loading ? (
          <Skeleton className="h-[220px] w-full rounded-xl" />
        ) : error ? (
          <EmptyChart message="Unable to load member data." />
        ) : !hasData(data) ? (
          <EmptyChart
            message="No member data yet"
            hint="Member growth will appear here once members are added."
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="newMembers"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function EmptyChart({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="h-[220px] flex flex-col items-center justify-center text-center px-4">
      <div className="w-10 h-10 rounded-xl bg-den-surface border border-den-border flex items-center justify-center mb-3">
        <Users size={18} className="text-den-muted" />
      </div>
      <p className="text-sm font-medium text-den-muted">{message}</p>
      {hint && <p className="text-xs text-den-subtle mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}
