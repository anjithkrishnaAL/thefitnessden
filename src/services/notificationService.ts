import { supabase } from '../lib/supabase';

export interface NotificationRow { id: string; notification_id: string; title: string; message: string; type: string; priority: 'low'|'normal'|'high'|'urgent'; member_id: string | null; related_membership_id: string | null; related_payment_id: string | null; is_read: boolean; created_at: string; read_at: string | null; }
export interface ReminderRow { id: string; reminder_id: string; title: string; description: string | null; reminder_type: string; member_id: string | null; due_date: string; due_time: string | null; status: 'pending'|'completed'|'cancelled'; priority: 'low'|'normal'|'high'|'urgent'; created_at: string; updated_at: string; member?: { full_name?: string; member_id?: string } | null; }
export type ReminderInput = Pick<ReminderRow, 'title'|'description'|'reminder_type'|'member_id'|'due_date'|'due_time'|'priority'>;

export async function createNotification(input: { title: string; message: string; type: string; priority?: NotificationRow['priority']; member_id?: string | null; related_membership_id?: string | null; related_payment_id?: string | null; dedupe_key?: string }) {
  const { error } = await supabase.from('notifications').insert({ ...input, priority: input.priority ?? 'normal' });
  if (error) throw new Error(error.message);
}

export async function getNotifications(): Promise<NotificationRow[]> { const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }); if (error) throw new Error(error.message); return (data ?? []) as NotificationRow[]; }
export async function getUnreadNotificationCount() { const { count, error } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('is_read', false); if (error) throw new Error(error.message); return count ?? 0; }
export async function markNotificationRead(id: string) { const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id); if (error) throw new Error(error.message); }
export async function markAllNotificationsRead() { const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('is_read', false); if (error) throw new Error(error.message); }
export async function deleteNotification(id: string) { const { error } = await supabase.from('notifications').delete().eq('id', id); if (error) throw new Error(error.message); }
export async function deleteReadNotifications() { const { error } = await supabase.from('notifications').delete().eq('is_read', true); if (error) throw new Error(error.message); }
export async function getReminders(): Promise<ReminderRow[]> { const { data, error } = await supabase.from('reminders').select('*, members(full_name,member_id)').order('due_date', { ascending: true }).order('due_time', { ascending: true }); if (error) throw new Error(error.message); return (data ?? []) as ReminderRow[]; }
export async function createReminder(input: ReminderInput): Promise<ReminderRow> { const { data, error } = await supabase.from('reminders').insert(input).select('*, members(full_name,member_id)').single(); if (error) throw new Error(error.message); return data as ReminderRow; }
export async function updateReminder(id: string, input: Partial<ReminderInput> & { status?: ReminderRow['status'] }) { const { data, error } = await supabase.from('reminders').update(input).eq('id', id).select('*, members(full_name,member_id)').single(); if (error) throw new Error(error.message); return data as ReminderRow; }
export async function deleteReminder(id: string) { const { error } = await supabase.from('reminders').delete().eq('id', id); if (error) throw new Error(error.message); }
export async function ensureMembershipExpiryNotifications() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const max = new Date(today); max.setDate(max.getDate() + 30);
  const { data, error } = await supabase.from('memberships').select('id,member_id,end_date,status,members(full_name)').in('status', ['active', 'expired']).lte('end_date', max.toISOString().slice(0, 10));
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as { id: string; member_id: string; end_date: string; members?: { full_name?: string } | null }[];
  const inserts = rows.flatMap(row => { const days = Math.round((new Date(`${row.end_date}T00:00:00Z`).getTime() - today.getTime()) / 86400000); const period = days < 0 ? -1 : [30, 7, 3].find(value => days <= value); if (!period) return []; const name = row.members?.full_name ?? 'A member'; return [{ title: period === -1 ? 'Membership Expired' : 'Membership Expiring Soon', message: period === -1 ? `${name}'s membership expired.` : `${name}'s membership expires in ${days} days.`, type: 'Membership Expiry', priority: period === -1 || days <= 3 ? 'urgent' : days <= 7 ? 'high' : 'normal', member_id: row.member_id, related_membership_id: row.id, dedupe_key: `membership-expiry:${row.id}:${period}` }]; });
  if (inserts.length) { const { error: insertError } = await supabase.from('notifications').upsert(inserts, { onConflict: 'dedupe_key', ignoreDuplicates: true }); if (insertError) throw new Error(insertError.message); }
}
