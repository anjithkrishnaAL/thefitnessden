import { supabase } from '../lib/supabase';
import type {
  CreateMembershipInput,
  CreateMembershipPlanInput,
  Membership,
  MembershipFilters,
  MembershipPlan,
  MembershipStatus,
  UpdateMembershipPlanInput,
} from '../types';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Adds whole calendar months and uses the day before the anniversary as the end date. */
export function calculateMembershipEndDate(startDate: string, durationMonths: number): string {
  const [year, month, day] = startDate.split('-').map(Number);
  const end = new Date(Date.UTC(year, month - 1, day));
  end.setUTCMonth(end.getUTCMonth() + durationMonths);
  end.setUTCDate(end.getUTCDate() - 1);
  return end.toISOString().slice(0, 10);
}

export function getEffectiveMembershipStatus(membership: Pick<Membership, 'status' | 'end_date'>): MembershipStatus {
  if (membership.status === 'active' && membership.end_date < todayString()) return 'expired';
  return membership.status;
}

function daysRemaining(endDate: string): number {
  const today = new Date(`${todayString()}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  return Math.ceil((end - today) / 86400000);
}

function normalizeMembership(row: Record<string, unknown>): Membership {
  const plan = row.membership_plans as Record<string, unknown> | null;
  const member = row.members as Membership['member'] | null;
  const status = getEffectiveMembershipStatus({ status: row.status as MembershipStatus, end_date: String(row.end_date) });
  return {
    id: String(row.id), member_id: String(row.member_id), plan_id: String(row.plan_id),
    plan_name: String(plan?.name ?? 'Unknown plan'), start_date: String(row.start_date), end_date: String(row.end_date),
    price: Number(row.price ?? 0), status, days_remaining: daysRemaining(String(row.end_date)),
    notes: (row.notes as string | null) ?? null, created_at: String(row.created_at), updated_at: String(row.updated_at),
    member: member ?? undefined, plan: plan ? (plan as unknown as MembershipPlan) : undefined,
  };
}

export async function getMembershipPlans(includeInactive = true): Promise<MembershipPlan[]> {
  let query = supabase.from('membership_plans').select('*').order('price', { ascending: true });
  if (!includeInactive) query = query.eq('status', 'active');
  const { data, error } = await query;
  if (error) { console.error('[membershipService.getMembershipPlans]', error.message); throw new Error('Unable to load membership plans.'); }
  return (data as MembershipPlan[]) ?? [];
}

export async function getMembershipPlan(id: string): Promise<MembershipPlan | null> {
  const { data, error } = await supabase.from('membership_plans').select('*').eq('id', id).maybeSingle();
  if (error) { console.error('[membershipService.getMembershipPlan]', error.message); throw new Error('Unable to load membership plan.'); }
  return data as MembershipPlan | null;
}

export async function createMembershipPlan(input: CreateMembershipPlanInput): Promise<MembershipPlan> {
  const { data, error } = await supabase.from('membership_plans').insert({ ...input, features: input.features ?? [] }).select().single();
  if (error) { console.error('[membershipService.createMembershipPlan]', error.message); throw new Error('Unable to create membership plan.'); }
  return data as MembershipPlan;
}

export async function updateMembershipPlan({ id, ...input }: UpdateMembershipPlanInput): Promise<MembershipPlan> {
  const { data, error } = await supabase.from('membership_plans').update(input).eq('id', id).select().single();
  if (error) { console.error('[membershipService.updateMembershipPlan]', error.message); throw new Error('Unable to update membership plan.'); }
  return data as MembershipPlan;
}

export async function deleteMembershipPlan(id: string): Promise<void> {
  const { count, error: countError } = await supabase.from('memberships').select('id', { count: 'exact', head: true }).eq('plan_id', id);
  if (countError) { console.error('[membershipService.deleteMembershipPlan]', countError.message); throw new Error('Unable to verify plan usage.'); }
  if ((count ?? 0) > 0) throw new Error('This plan is currently assigned to members and cannot be deleted.');
  const { error } = await supabase.from('membership_plans').delete().eq('id', id);
  if (error) { console.error('[membershipService.deleteMembershipPlan]', error.message); throw new Error('Unable to delete membership plan.'); }
}

export async function getMemberships(filters: MembershipFilters = {}): Promise<Membership[]> {
  let query = supabase.from('memberships').select('*, membership_plans(*), members(id, full_name, member_id, profile_photo_url)').order('end_date', { ascending: true });
  if (filters.status === 'expiring') {
    const today = todayString(); const future = new Date(`${today}T00:00:00Z`); future.setUTCDate(future.getUTCDate() + 7);
    query = query.gte('end_date', today).lte('end_date', future.toISOString().slice(0, 10)).eq('status', 'active');
  } else if (filters.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) { console.error('[membershipService.getMemberships]', error.message); throw new Error('Unable to load memberships.'); }
  const memberships = ((data ?? []) as Record<string, unknown>[]).map(normalizeMembership);
  return filters.status === 'active' ? memberships.filter(m => m.status === 'active') : memberships;
}

export async function getMemberMemberships(memberId: string): Promise<Membership[]> {
  const { data, error } = await supabase.from('memberships').select('*, membership_plans(*), members(id, full_name, member_id, profile_photo_url)').eq('member_id', memberId).order('start_date', { ascending: false });
  if (error) { console.error('[membershipService.getMemberMemberships]', error.message); throw new Error('Unable to load membership history.'); }
  return ((data ?? []) as Record<string, unknown>[]).map(normalizeMembership);
}

export async function getActiveMembership(memberId: string): Promise<Membership | null> {
  const memberships = await getMemberMemberships(memberId);
  return memberships.find(m => m.status === 'active' && m.start_date <= todayString() && m.end_date >= todayString()) ?? null;
}

export async function createMembership(input: CreateMembershipInput): Promise<Membership> {
  if ((input.status ?? 'active') === 'active') {
    const existing = await getActiveMembership(input.member_id);
    if (existing && input.start_date <= existing.end_date) {
      throw new Error('Member already has an active membership. Renew the existing membership instead.');
    }
  }
  const { data, error } = await supabase.from('memberships').insert(input).select('*, membership_plans(*), members(id, full_name, member_id, profile_photo_url)').single();
  if (error) { console.error('[membershipService.createMembership]', error.message); throw new Error('Unable to assign membership.'); }
  return normalizeMembership(data as Record<string, unknown>);
}

export async function renewMembership(memberId: string, planId: string, price: number, notes?: string): Promise<Membership> {
  const existing = await getActiveMembership(memberId);
  const startDate = existing ? calculateMembershipEndDate(existing.start_date, 1) : todayString();
  const plan = await getMembershipPlan(planId);
  if (!plan) throw new Error('Selected membership plan was not found.');
  const actualStart = existing ? new Date(`${existing.end_date}T00:00:00Z`) : new Date(`${startDate}T00:00:00Z`);
  if (existing) actualStart.setUTCDate(actualStart.getUTCDate() + 1);
  const start = actualStart.toISOString().slice(0, 10);
  return createMembership({ member_id: memberId, plan_id: planId, start_date: start, end_date: calculateMembershipEndDate(start, plan.duration_months), price, notes, status: 'active' });
}

export async function cancelMembership(id: string): Promise<void> {
  const { error } = await supabase.from('memberships').update({ status: 'cancelled' }).eq('id', id);
  if (error) { console.error('[membershipService.cancelMembership]', error.message); throw new Error('Unable to cancel membership.'); }
}

export async function getExpiringMemberships(): Promise<Membership[]> { return getMemberships({ status: 'expiring' }); }
export async function getExpiredMemberships(): Promise<Membership[]> {
  const memberships = await getMemberships();
  return memberships.filter(m => m.status === 'expired');
}
