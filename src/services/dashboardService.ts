/**
 * Dashboard Service
 *
 * All Supabase queries for the dashboard are centralised here.
 * Tables that don't exist yet (members, payments, attendance, etc.)
 * are handled gracefully — queries return empty data rather than
 * crashing the UI. Every function returns a typed result even when
 * the underlying table is missing.
 */

import { supabase } from '../lib/supabase';
import type {
  DashboardStats,
  RevenueDataPoint,
  MemberGrowthDataPoint,
  AttendanceDataPoint,
  MembershipDistributionItem,
  RecentMember,
  RecentPayment,
  ExpiringMembership,
} from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true when a Postgres error indicates the table doesn't exist yet */
function isTableMissing(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string };
  return (
    e.code === '42P01' ||                                   // relation does not exist
    (typeof e.message === 'string' && e.message.includes('relation') && e.message.includes('does not exist'))
  );
}

/** Returns the YYYY-MM abbreviation for a given month offset from today */
function monthLabel(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleString('en-US', { month: 'short' });
}

/** Build a 6-month array of { month } objects from oldest → current */
function last6Months(): string[] {
  return Array.from({ length: 6 }, (_, i) => monthLabel(i - 5));
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    totalMembers: 0,
    activeMembers: 0,
    newMembers: 0,
    expiringCount: 0,
    monthlyRevenue: 0,
    totalMembersGrowth: 0,
    activeMembersPercent: 0,
    revenueGrowth: 0,
  };

  try {
    // Run all stat queries in parallel for performance
    const [membersResult, activeResult, newMembersResult, expiringResult, revenueResult] =
      await Promise.allSettled([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase
          .from('members')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        (() => {
          const start = new Date();
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          return supabase.from('members').select('id', { count: 'exact', head: true }).gte('created_at', start.toISOString());
        })(),
        (() => {
          const now = new Date();
          const today = now.toISOString().slice(0, 10);
          const in7 = new Date(now);
          in7.setDate(in7.getDate() + 7);
          return supabase
            .from('memberships')
            .select('id', { count: 'exact', head: true })
            .gte('end_date', today)
            .lte('end_date', in7.toISOString().slice(0, 10))
            .eq('status', 'active');
        })(),
        (() => {
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          return supabase
            .from('payments')
            .select('amount')
            .eq('status', 'paid')
            .gte('payment_date', start.toISOString().slice(0, 10));
        })(),
      ]);

    const totalMembers =
      membersResult.status === 'fulfilled' && !isTableMissing(membersResult.value.error)
        ? (membersResult.value.count ?? 0)
        : 0;

    const activeMembers =
      activeResult.status === 'fulfilled' && !isTableMissing(activeResult.value.error)
        ? (activeResult.value.count ?? 0)
        : 0;

    const newMembers =
      newMembersResult.status === 'fulfilled' && !isTableMissing(newMembersResult.value.error)
        ? (newMembersResult.value.count ?? 0)
        : 0;

    const expiringCount =
      expiringResult.status === 'fulfilled' && !isTableMissing(expiringResult.value.error)
        ? (expiringResult.value.count ?? 0)
        : 0;

    let monthlyRevenue = 0;
    if (
      revenueResult.status === 'fulfilled' &&
      !isTableMissing(revenueResult.value.error) &&
      revenueResult.value.data
    ) {
      monthlyRevenue = (revenueResult.value.data as { amount: number }[]).reduce(
        (sum, r) => sum + (r.amount ?? 0),
        0
      );
    }

    const activeMembersPercent =
      totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

    return {
      totalMembers,
      activeMembers,
      newMembers,
      expiringCount,
      monthlyRevenue,
      totalMembersGrowth: 0,  // Requires historical data — set to 0 for now
      activeMembersPercent,
      revenueGrowth: 0,        // Requires prior-month data — set to 0 for now
    };
  } catch (err) {
    console.error('[dashboardService.getDashboardStats]', err);
    return empty;
  }
}

// ─── Revenue Analytics ────────────────────────────────────────────────────────

export async function getRevenueAnalytics(): Promise<RevenueDataPoint[]> {
  const months = last6Months();
  const empty = months.map(m => ({ month: m, revenue: 0 }));

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const { data, error } = await supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('status', 'paid')
      .gte('payment_date', sixMonthsAgo.toISOString().slice(0, 10))
      .order('payment_date', { ascending: true });

    if (error) {
      if (isTableMissing(error)) return empty;
      console.error('[dashboardService.getRevenueAnalytics]', error.message);
      return empty;
    }
    if (!data || data.length === 0) return empty;

    // Aggregate by month label
    const map: Record<string, number> = {};
    months.forEach(m => { map[m] = 0; });

    (data as { amount: number; payment_date: string }[]).forEach(row => {
      const label = new Date(`${row.payment_date}T00:00:00Z`).toLocaleString('en-US', { month: 'short' });
      if (label in map) map[label] += row.amount ?? 0;
    });

    return months.map(m => ({ month: m, revenue: Math.round(map[m] * 100) / 100 }));
  } catch (err) {
    console.error('[dashboardService.getRevenueAnalytics]', err);
    return empty;
  }
}

// ─── Member Growth ────────────────────────────────────────────────────────────

export async function getMemberGrowth(): Promise<MemberGrowthDataPoint[]> {
  const months = last6Months();
  const empty = months.map(m => ({ month: m, newMembers: 0 }));

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const { data, error } = await supabase
      .from('members')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      if (isTableMissing(error)) return empty;
      console.error('[dashboardService.getMemberGrowth]', error.message);
      return empty;
    }
    if (!data || data.length === 0) return empty;

    const map: Record<string, number> = {};
    months.forEach(m => { map[m] = 0; });

    (data as { created_at: string }[]).forEach(row => {
      const label = new Date(row.created_at).toLocaleString('en-US', { month: 'short' });
      if (label in map) map[label] += 1;
    });

    return months.map(m => ({ month: m, newMembers: map[m] }));
  } catch (err) {
    console.error('[dashboardService.getMemberGrowth]', err);
    return empty;
  }
}

// ─── Attendance Overview ──────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export async function getAttendanceOverview(): Promise<AttendanceDataPoint[]> {
  const empty = DAYS.map(d => ({ day: d, checkIns: 0 }));

  try {
    // Get current week Monday
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('attendance')
      .select('check_in')
      .gte('check_in', monday.toISOString());

    if (error) {
      if (isTableMissing(error)) return empty;
      console.error('[dashboardService.getAttendanceOverview]', error.message);
      return empty;
    }
    if (!data || data.length === 0) return empty;

    const map: Record<string, number> = {};
    DAYS.forEach(d => { map[d] = 0; });

    (data as { check_in: string }[]).forEach(row => {
      const d = new Date(row.check_in);
      const label = DAYS[(d.getDay() + 6) % 7]; // Mon=0
      if (label in map) map[label] += 1;
    });

    return DAYS.map(d => ({ day: d, checkIns: map[d] }));
  } catch (err) {
    console.error('[dashboardService.getAttendanceOverview]', err);
    return empty;
  }
}

// ─── Membership Distribution ──────────────────────────────────────────────────

const PLAN_COLORS: Record<string, string> = {
  Basic:   '#6366f1',
  Premium: '#a3e635',
  Elite:   '#f59e0b',
};
const DEFAULT_COLORS = ['#6366f1', '#a3e635', '#f59e0b', '#ec4899', '#14b8a6'];

export async function getMembershipDistribution(): Promise<MembershipDistributionItem[]> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('status, end_date, membership_plans(name)')
      .eq('status', 'active');

    if (error) {
      if (isTableMissing(error)) return [];
      console.error('[dashboardService.getMembershipDistribution]', error.message);
      return [];
    }
    if (!data || data.length === 0) return [];

    const map: Record<string, number> = {};
    (data as { status: string; end_date: string; membership_plans: { name?: string } | null }[]).forEach(row => {
      if (row.end_date < new Date().toISOString().slice(0, 10)) return;
      const name = row.membership_plans?.name ?? 'Unknown';
      map[name] = (map[name] ?? 0) + 1;
    });

    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: PLAN_COLORS[name] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }));
  } catch (err) {
    console.error('[dashboardService.getMembershipDistribution]', err);
    return [];
  }
}

// ─── Recent Members ───────────────────────────────────────────────────────────

export async function getRecentMembers(): Promise<RecentMember[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('id, full_name, member_id, created_at, status, profile_photo_url')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      if (isTableMissing(error)) return [];
      console.error('[dashboardService.getRecentMembers]', error.message);
      return [];
    }
    if (!data || data.length === 0) return [];

    return (data as {
      id: string;
      full_name: string;
      member_id: string;
      created_at: string;
      status: string;
      profile_photo_url?: string | null;
    }[]).map(row => ({
      id: row.id,
      name: row.full_name,
      memberId: row.member_id ?? `#${row.id.slice(0, 6).toUpperCase()}`,
      membershipPlan: 'Not assigned',
      joinedAt: row.created_at,
      status: (row.status as RecentMember['status']) ?? 'active',
      avatarUrl: row.profile_photo_url,
    }));
  } catch (err) {
    console.error('[dashboardService.getRecentMembers]', err);
    return [];
  }
}

// ─── Recent Payments ──────────────────────────────────────────────────────────

export async function getRecentPayments(): Promise<RecentPayment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('id, member_id, amount, payment_date, payment_method, status, members(full_name, profile_photo_url)')
      .order('payment_date', { ascending: false })
      .limit(5);

    if (error) {
      if (isTableMissing(error)) return [];
      console.error('[dashboardService.getRecentPayments]', error.message);
      return [];
    }
    if (!data || data.length === 0) return [];

    return (data as {
      id: string;
      member_id: string;
      amount: number;
      payment_date: string;
      payment_method: string;
      status: string;
      members: { full_name?: string; profile_photo_url?: string | null } | null;
    }[]).map(row => ({
      id: row.id,
      memberName: row.members?.full_name ?? 'Member',
      amount: row.amount,
      paidAt: row.payment_date,
      paymentMethod: row.payment_method ?? 'Unknown',
      status: row.status === 'pending' ? 'pending' : row.status === 'paid' ? 'completed' : 'failed',
      memberAvatarUrl: row.members?.profile_photo_url,
    }));
  } catch (err) {
    console.error('[dashboardService.getRecentPayments]', err);
    return [];
  }
}

// ─── Expiring Memberships ─────────────────────────────────────────────────────

export async function getExpiringMemberships(): Promise<ExpiringMembership[]> {
  try {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const in7 = new Date(`${today}T00:00:00Z`);
    in7.setDate(in7.getDate() + 7);

    const { data, error } = await supabase
      .from('memberships')
      .select('id, member_id, plan_id, end_date, status, membership_plans(name), members(full_name, profile_photo_url)')
      .gte('end_date', today)
      .lte('end_date', in7.toISOString().slice(0, 10))
      .eq('status', 'active')
      .order('end_date', { ascending: true })
      .limit(10);

    if (error) {
      if (isTableMissing(error)) return [];
      console.error('[dashboardService.getExpiringMemberships]', error.message);
      return [];
    }
    if (!data || data.length === 0) return [];

    return (data as {
      id: string;
      member_id: string;
      membership_plans: { name?: string } | null;
      members: { full_name?: string; profile_photo_url?: string | null } | null;
      end_date: string;
    }[]).map(row => {
      const expiry = new Date(row.end_date);
      const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: row.id,
        memberName: row.members?.full_name ?? 'Member',
        membershipPlan: row.membership_plans?.name ?? 'Unknown',
        expiresAt: row.end_date,
        daysRemaining: diff,
        avatarUrl: row.members?.profile_photo_url,
      };
    });
  } catch (err) {
    console.error('[dashboardService.getExpiringMemberships]', err);
    return [];
  }
}
