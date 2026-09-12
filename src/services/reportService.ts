import { supabase } from '../lib/supabase';

export interface ReportRange { from: string; to: string; label: string; preset: string; }
export interface ReportData {
  members: { id: string; full_name: string; member_id: string; status: string; fitness_goal: string | null; trainer_id: string | null; created_at: string }[];
  payments: { id: string; member_id: string; amount: number; payment_date: string; status: string; payment_method: string; transaction_id: string | null }[];
  expenses: { id: string; expense_id: string; title: string; category: string; amount: number; expense_date: string; vendor: string | null; status: string }[];
  attendance: { id: string; member_id: string; date: string; check_in: string; status: string }[];
  trainers: { id: string; trainer_id: string; full_name: string; status: string }[];
  memberships: { id: string; member_id: string; plan_id: string; status: string; start_date: string; end_date: string; price: number }[];
  plans: { id: string; name: string; status: string }[];
  workoutPlans: { id: string; name: string; status: string }[];
  workoutAssignments: { member_id: string; workout_plan_id: string; status: string }[];
  progress: { member_id: string; recorded_date: string; weight: number | null; body_fat_percentage: number | null }[];
}

const today = () => new Date().toISOString().slice(0, 10);
export function getReportRange(preset: string, customFrom = '', customTo = ''): ReportRange {
  const end = new Date(`${today()}T00:00:00Z`); const start = new Date(end); let label = 'This Month';
  if (preset === 'week') { start.setUTCDate(start.getUTCDate() - 6); label = 'This Week'; }
  else if (preset === 'month') { start.setUTCDate(1); label = 'This Month'; }
  else if (preset === 'lastMonth') { start.setUTCMonth(start.getUTCMonth() - 1, 1); end.setUTCDate(0); label = 'Last Month'; }
  else if (preset === 'quarter') { start.setUTCMonth(start.getUTCMonth() - 2, 1); label = 'Last 3 Months'; }
  else if (preset === 'year') { start.setUTCMonth(0, 1); label = 'This Year'; }
  else if (preset === 'custom') return { from: customFrom || today(), to: customTo || today(), label: `${customFrom || today()} – ${customTo || today()}`, preset };
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10), label, preset };
}

async function rows(table: string, select: string): Promise<any[]> {
  const { data, error } = await supabase.from(table).select(select);
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as any[];
}

export async function getReportData(): Promise<ReportData> {
  const [members, payments, expenses, attendance, trainers, memberships, plans, workoutPlans, workoutAssignments, progress] = await Promise.all([
    rows('members', 'id,full_name,member_id,status,fitness_goal,trainer_id,created_at'),
    rows('payments', 'id,member_id,amount,payment_date,status,payment_method,transaction_id'),
    rows('expenses', 'id,expense_id,title,category,amount,expense_date,vendor,status'),
    rows('attendance', 'id,member_id,date,check_in,status'),
    rows('trainers', 'id,trainer_id,full_name,status'),
    rows('memberships', 'id,member_id,plan_id,status,start_date,end_date,price'),
    rows('membership_plans', 'id,name,status'),
    rows('workout_plans', 'id,name,status'),
    rows('workout_plan_members', 'member_id,workout_plan_id,status'),
    rows('progress_records', 'member_id,recorded_date,weight,body_fat_percentage'),
  ]);
  return { members, payments, expenses, attendance, trainers, memberships, plans, workoutPlans, workoutAssignments, progress } as ReportData;
}
export function inRange(value: string, range: ReportRange) { return value >= range.from && value <= range.to; }
export function money(value: number) { return `₹${Math.round(value).toLocaleString('en-IN')}`; }
export function csvDownload(filename: string, headers: string[], records: (string | number | null | undefined)[][]) {
  const quote = (value: string | number | null | undefined) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [headers, ...records].map(row => row.map(quote).join(',')).join('\n'); const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.download = filename; link.click(); URL.revokeObjectURL(link.href);
}
