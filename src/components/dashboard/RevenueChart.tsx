import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { RevenueDataPoint } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface RevenueChartProps {
  data: RevenueDataPoint[];
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
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

const hasData = (data: RevenueDataPoint[]) => data.some(d => d.revenue > 0);

export function RevenueChart({ data, loading, error }: RevenueChartProps) {
  return (
    <div className="bg-den-card border border-den-border rounded-xl p-5 h-full flex flex-col">
      <CardHeader className="mb-0">
        <div>
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>Revenue performance over the last 6 months</CardDescription>
        </div>
        <div className="w-8 h-8 rounded-xl bg-den-accent/10 border border-den-accent/20 flex items-center justify-center shrink-0">
          <TrendingUp size={15} className="text-den-accent" />
        </div>
      </CardHeader>

      <div className="flex-1 mt-5 min-h-[200px]">
        {loading ? (
          <div className="h-full flex flex-col gap-3">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        ) : error ? (
          <EmptyChart message="Unable to load revenue data." />
        ) : !hasData(data) ? (
          <EmptyChart
            message="No revenue data yet"
            hint="Revenue analytics will appear here when payments are recorded."
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a3e635" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a3e635" stopOpacity={0.02} />
                </linearGradient>
              </defs>
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
                tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2a2a38', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#a3e635"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#a3e635', stroke: '#0a0a0b', strokeWidth: 2 }}
              />
            </AreaChart>
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
        <TrendingUp size={18} className="text-den-muted" />
      </div>
      <p className="text-sm font-medium text-den-muted">{message}</p>
      {hint && <p className="text-xs text-den-subtle mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}
