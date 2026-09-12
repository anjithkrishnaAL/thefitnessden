import { supabase } from '../lib/supabase';
import type { CreatePaymentInput, Payment, PaymentFilters, PaymentStats, PaymentStatus, PaymentMethod, RevenueData, UpdatePaymentInput } from '../types';

const today = () => new Date().toISOString().slice(0, 10);
const monthStart = () => `${today().slice(0, 8)}01`;
const normalize = (row: Record<string, unknown>): Payment => {
  const member = row.members as Payment['member'];
  const membershipRow = row.memberships as Record<string, unknown> | null;
  const plan = membershipRow?.membership_plans as { name?: string } | null;
  return { id: String(row.id), member_id: String(row.member_id), membership_id: (row.membership_id as string | null) ?? null, amount: Number(row.amount ?? 0), payment_method: row.payment_method as PaymentMethod, payment_date: String(row.payment_date), status: row.status as PaymentStatus, transaction_id: (row.transaction_id as string | null) ?? null, notes: (row.notes as string | null) ?? null, created_at: String(row.created_at), updated_at: String(row.updated_at), member: member ?? undefined, membership: membershipRow ? { id: String(membershipRow.id), plan_name: plan?.name ?? 'Membership', start_date: String(membershipRow.start_date), end_date: String(membershipRow.end_date) } : null };
};

function range(filters: PaymentFilters): { from?: string; to?: string } {
  const now = new Date(); const current = today();
  if (filters.dateRange === 'today') return { from: current, to: current };
  if (filters.dateRange === 'week') { const d = new Date(`${current}T00:00:00Z`); d.setUTCDate(d.getUTCDate() - 6); return { from: d.toISOString().slice(0, 10), to: current }; }
  if (filters.dateRange === 'month') return { from: monthStart(), to: current };
  if (filters.dateRange === 'quarter') { const d = new Date(`${current}T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() - 2); d.setUTCDate(1); return { from: d.toISOString().slice(0, 10), to: current }; }
  if (filters.dateRange === 'year') return { from: `${current.slice(0, 4)}-01-01`, to: current };
  if (filters.dateRange === 'custom') return { from: filters.fromDate || undefined, to: filters.toDate || undefined };
  return {};
}

export async function getPayments(filters: PaymentFilters, page: number, pageSize: number): Promise<{ data: Payment[]; total: number }> {
  let query = supabase.from('payments').select('*, members(id, full_name, member_id, profile_photo_url), memberships(id, start_date, end_date, membership_plans(name))', { count: 'exact' });
  const dates = range(filters); if (dates.from) query = query.gte('payment_date', dates.from); if (dates.to) query = query.lte('payment_date', dates.to);
  if (filters.method) query = query.eq('payment_method', filters.method); if (filters.status) query = query.eq('status', filters.status);
  if (filters.search.trim()) { const q = filters.search.trim(); query = query.or(`transaction_id.ilike.%${q}%,members.full_name.ilike.%${q}%,members.member_id.ilike.%${q}%`); }
  const from = (page - 1) * pageSize; const { data, count, error } = await query.order('payment_date', { ascending: false }).order('created_at', { ascending: false }).range(from, from + pageSize - 1);
  if (error) { console.error('[paymentService.getPayments]', error.message); throw new Error('Unable to load payments.'); }
  return { data: ((data ?? []) as Record<string, unknown>[]).map(normalize), total: count ?? 0 };
}

export async function getPayment(id: string): Promise<Payment | null> { const { data, error } = await supabase.from('payments').select('*, members(id, full_name, member_id, profile_photo_url), memberships(id, start_date, end_date, membership_plans(name))').eq('id', id).maybeSingle(); if (error) { console.error('[paymentService.getPayment]', error.message); throw new Error('Unable to load payment details.'); } return data ? normalize(data as Record<string, unknown>) : null; }
export async function createPayment(input: CreatePaymentInput): Promise<Payment> { const { data, error } = await supabase.from('payments').insert(input).select('*, members(id, full_name, member_id, profile_photo_url), memberships(id, start_date, end_date, membership_plans(name))').single(); if (error) { console.error('[paymentService.createPayment]', error.message); throw new Error('Unable to record payment.'); } return normalize(data as Record<string, unknown>); }
export async function updatePayment({ id, ...input }: UpdatePaymentInput): Promise<Payment> { const { data, error } = await supabase.from('payments').update(input).eq('id', id).select('*, members(id, full_name, member_id, profile_photo_url), memberships(id, start_date, end_date, membership_plans(name))').single(); if (error) { console.error('[paymentService.updatePayment]', error.message); throw new Error('Unable to update payment.'); } return normalize(data as Record<string, unknown>); }
export async function deletePayment(id: string): Promise<void> { const { error } = await supabase.from('payments').delete().eq('id', id); if (error) { console.error('[paymentService.deletePayment]', error.message); throw new Error('Unable to delete payment.'); } }

export async function getPaymentStats(): Promise<PaymentStats> {
  const { data, error } = await supabase.from('payments').select('amount, payment_date, status');
  if (error) { console.error('[paymentService.getPaymentStats]', error.message); throw new Error('Unable to load payment statistics.'); }
  const rows = (data ?? []) as { amount: number; payment_date: string; status: PaymentStatus }[]; const current = today(); const start = monthStart();
  return rows.reduce((stats, row) => { if (row.status === 'paid') { stats.totalRevenue += Number(row.amount); if (row.payment_date >= start) stats.thisMonth += Number(row.amount); if (row.payment_date === current) stats.today += Number(row.amount); } if (row.status === 'pending') stats.pending += Number(row.amount); return stats; }, { totalRevenue: 0, thisMonth: 0, today: 0, pending: 0 });
}
export async function getMemberPayments(memberId: string): Promise<Payment[]> { const { data, error } = await supabase.from('payments').select('*, members(id, full_name, member_id, profile_photo_url), memberships(id, start_date, end_date, membership_plans(name))').eq('member_id', memberId).order('payment_date', { ascending: false }); if (error) { console.error('[paymentService.getMemberPayments]', error.message); throw new Error('Unable to load payment history.'); } return ((data ?? []) as Record<string, unknown>[]).map(normalize); }
export async function getMembershipPayments(membershipId: string): Promise<Payment[]> { const { data, error } = await supabase.from('payments').select('*, members(id, full_name, member_id, profile_photo_url), memberships(id, start_date, end_date, membership_plans(name))').eq('membership_id', membershipId).order('payment_date', { ascending: false }); if (error) { console.error('[paymentService.getMembershipPayments]', error.message); throw new Error('Unable to load payment history.'); } return ((data ?? []) as Record<string, unknown>[]).map(normalize); }
export async function getRevenueAnalytics(): Promise<RevenueData[]> { const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 5); const from = d.toISOString().slice(0, 10); const { data, error } = await supabase.from('payments').select('amount, payment_date').eq('status', 'paid').gte('payment_date', from).order('payment_date'); if (error) { console.error('[paymentService.getRevenueAnalytics]', error.message); throw new Error('Unable to load revenue analytics.'); } const values: Record<string, number> = {}; for (let i = 0; i < 6; i++) { const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + i, 1)); values[m.toISOString().slice(0, 7)] = 0; } for (const row of (data ?? []) as { amount: number; payment_date: string }[]) { const key = row.payment_date.slice(0, 7); if (key in values) values[key] += Number(row.amount); } return Object.entries(values).map(([key, revenue]) => ({ month: new Date(`${key}-01T00:00:00Z`).toLocaleString('en-US', { month: 'short' }), revenue })); }
export async function exportPayments(filters: PaymentFilters): Promise<Payment[]> { const result = await getPayments(filters, 1, 10000); return result.data; }
