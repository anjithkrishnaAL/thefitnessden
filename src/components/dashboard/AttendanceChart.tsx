import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Activity } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { AttendanceDataPoint } from '../../types';

interface AttendanceChartProps {
  data: AttendanceDataPoint[];
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
        {payload[0].value} check-in{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TODAY_IDX = (new Date().getDay() + 6) % 7; // Mon=0

const hasData = (data: AttendanceDataPoint[]) => data.some(d => d.checkIns > 0);

export function AttendanceChart({ data, loading, error }: AttendanceChartProps) {
  return (
    <div className="bg-den-card border border-den-border rounded-xl p-5 h-full flex flex-col">
      <CardHeader className="mb-0">
        <div>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>Check-ins this week (Mon – Sun)</CardDescription>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <Activity size={15} className="text-emerald-400" />
        </div>
      </CardHeader>

      <div className="flex-1 mt-5 min-h-[180px]">
        {loading ? (
          <Skeleton className="h-[180px] w-full rounded-xl" />
        ) : error ? (
          <EmptyChart message="Unable to load attendance data." />
        ) : !hasData(data) ? (
          <EmptyChart
            message="No attendance data yet"
            hint="Weekly check-ins will appear here once attendance is recorded."
          />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
              <XAxis
                dataKey="day"
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
              <Bar dataKey="checkIns" radius={[4, 4, 0, 0]}>
                {DAYS.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === TODAY_IDX ? '#a3e635' : '#1e1e28'}
                    stroke={i === TODAY_IDX ? '#a3e635' : '#2a2a38'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function EmptyChart({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="h-[180px] flex flex-col items-center justify-center text-center px-4">
      <div className="w-10 h-10 rounded-xl bg-den-surface border border-den-border flex items-center justify-center mb-3">
        <Activity size={18} className="text-den-muted" />
      </div>
      <p className="text-sm font-medium text-den-muted">{message}</p>
      {hint && <p className="text-xs text-den-subtle mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}
