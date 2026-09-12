import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, AlertTriangle, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { MemberGrowthChart } from '../components/dashboard/MemberGrowthChart';
import { AttendanceChart } from '../components/dashboard/AttendanceChart';
import { MembershipDistribution } from '../components/dashboard/MembershipDistribution';
import { RecentMembers } from '../components/dashboard/RecentMembers';
import { RecentPayments } from '../components/dashboard/RecentPayments';
import { ExpiringMemberships } from '../components/dashboard/ExpiringMemberships';
import { QuickActions } from '../components/dashboard/QuickActions';
import {
  getDashboardStats,
  getRevenueAnalytics,
  getMemberGrowth,
  getAttendanceOverview,
  getMembershipDistribution,
  getRecentMembers,
  getRecentPayments,
  getExpiringMemberships,
} from '../services/dashboardService';
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
import { formatCurrency } from '../utils/helpers';

// ─── Loading / Error state shapes ────────────────────────────────────────────

interface DataState<T> {
  data: T;
  loading: boolean;
  error: boolean;
}

function initial<T>(empty: T): DataState<T> {
  return { data: empty, loading: true, error: false };
}

const EMPTY_STATS: DashboardStats = {
  totalMembers: 0, activeMembers: 0, newMembers: 0, expiringCount: 0,
  monthlyRevenue: 0, totalMembersGrowth: 0, activeMembersPercent: 0, revenueGrowth: 0,
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export function DashboardPage() {
  const [globalError, setGlobalError] = useState(false);

  const [stats,        setStats]        = useState<DataState<DashboardStats>>(initial(EMPTY_STATS));
  const [revenue,      setRevenue]      = useState<DataState<RevenueDataPoint[]>>(initial([]));
  const [growth,       setGrowth]       = useState<DataState<MemberGrowthDataPoint[]>>(initial([]));
  const [attendance,   setAttendance]   = useState<DataState<AttendanceDataPoint[]>>(initial([]));
  const [distribution, setDistribution] = useState<DataState<MembershipDistributionItem[]>>(initial([]));
  const [members,      setMembers]      = useState<DataState<RecentMember[]>>(initial([]));
  const [payments,     setPayments]     = useState<DataState<RecentPayment[]>>(initial([]));
  const [expiring,     setExpiring]     = useState<DataState<ExpiringMembership[]>>(initial([]));

  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    setGlobalError(false);

    try {
      // Kick off all queries in parallel
      const [
        statsRes,
        revenueRes,
        growthRes,
        attendanceRes,
        distributionRes,
        membersRes,
        paymentsRes,
        expiringRes,
      ] = await Promise.allSettled([
        getDashboardStats(),
        getRevenueAnalytics(),
        getMemberGrowth(),
        getAttendanceOverview(),
        getMembershipDistribution(),
        getRecentMembers(),
        getRecentPayments(),
        getExpiringMemberships(),
      ]);

      setStats({
        data: statsRes.status === 'fulfilled' ? statsRes.value : EMPTY_STATS,
        loading: false,
        error: statsRes.status === 'rejected',
      });
      setRevenue({
        data: revenueRes.status === 'fulfilled' ? revenueRes.value : [],
        loading: false,
        error: revenueRes.status === 'rejected',
      });
      setGrowth({
        data: growthRes.status === 'fulfilled' ? growthRes.value : [],
        loading: false,
        error: growthRes.status === 'rejected',
      });
      setAttendance({
        data: attendanceRes.status === 'fulfilled' ? attendanceRes.value : [],
        loading: false,
        error: attendanceRes.status === 'rejected',
      });
      setDistribution({
        data: distributionRes.status === 'fulfilled' ? distributionRes.value : [],
        loading: false,
        error: distributionRes.status === 'rejected',
      });
      setMembers({
        data: membersRes.status === 'fulfilled' ? membersRes.value : [],
        loading: false,
        error: membersRes.status === 'rejected',
      });
      setPayments({
        data: paymentsRes.status === 'fulfilled' ? paymentsRes.value : [],
        loading: false,
        error: paymentsRes.status === 'rejected',
      });
      setExpiring({
        data: expiringRes.status === 'fulfilled' ? expiringRes.value : [],
        loading: false,
        error: expiringRes.status === 'rejected',
      });
    } catch (err) {
      console.error('[DashboardPage] Unexpected error:', err);
      setGlobalError(true);
      // Reset all to non-loading
      const failed = { data: undefined as unknown, loading: false, error: true };
      setStats({ ...failed, data: EMPTY_STATS } as DataState<DashboardStats>);
      setRevenue({ ...failed, data: [] } as DataState<RevenueDataPoint[]>);
      setGrowth({ ...failed, data: [] } as DataState<MemberGrowthDataPoint[]>);
      setAttendance({ ...failed, data: [] } as DataState<AttendanceDataPoint[]>);
      setDistribution({ ...failed, data: [] } as DataState<MembershipDistributionItem[]>);
      setMembers({ ...failed, data: [] } as DataState<RecentMember[]>);
      setPayments({ ...failed, data: [] } as DataState<RecentPayment[]>);
      setExpiring({ ...failed, data: [] } as DataState<ExpiringMembership[]>);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Refresh handler
  async function handleRefresh() {
    setRefreshing(true);
    // Reset each section to loading individually (avoids TSX generic syntax issues)
    setStats({ data: EMPTY_STATS, loading: true, error: false });
    setRevenue({ data: [], loading: true, error: false });
    setGrowth({ data: [], loading: true, error: false });
    setAttendance({ data: [], loading: true, error: false });
    setDistribution({ data: [], loading: true, error: false });
    setMembers({ data: [], loading: true, error: false });
    setPayments({ data: [], loading: true, error: false });
    setExpiring({ data: [], loading: true, error: false });
    await loadAll();
    setRefreshing(false);
  }

  // Global error banner
  if (globalError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <AlertCircle size={26} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-den-text mb-2">Unable to load dashboard data</h2>
        <p className="text-sm text-den-muted mb-6 max-w-sm">
          There was a problem connecting to the database. Check your Supabase configuration and try again.
        </p>
        <Button
          variant="outline"
          icon={<RefreshCw size={14} />}
          onClick={handleRefresh}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">

      {/* ── Row 1: Header ──────────────────────────────────────────── */}
      <DashboardHeader onRefresh={handleRefresh} refreshing={refreshing} />

      {/* ── Row 2: KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Members"
          value={stats.loading ? '—' : stats.data.totalMembers.toLocaleString()}
          subtitle={stats.data.totalMembers === 0 ? 'No members yet' : 'Registered members'}
          icon={<Users size={17} />}
          trend={stats.data.totalMembersGrowth || undefined}
          accentColor="green"
          loading={stats.loading}
        />
        <StatCard
          title="Active Members"
          value={stats.loading ? '—' : stats.data.activeMembers.toLocaleString()}
          subtitle={
            stats.data.activeMembersPercent > 0
              ? `${stats.data.activeMembersPercent}% of total`
              : 'No active members yet'
          }
          icon={<UserCheck size={17} />}
          accentColor="blue"
          loading={stats.loading}
        />
        <StatCard
          title="New Members"
          value={stats.loading ? '—' : stats.data.newMembers.toLocaleString()}
          subtitle={stats.data.newMembers === 0 ? 'None added this month' : 'Added this month'}
          icon={<Users size={17} />}
          accentColor="green"
          loading={stats.loading}
        />
        <StatCard
          title="Expiring Soon"
          value={stats.loading ? '—' : stats.data.expiringCount.toLocaleString()}
          subtitle={stats.data.expiringCount === 0 ? 'All memberships current' : 'Within 7 days'}
          icon={<AlertTriangle size={17} />}
          accentColor={stats.data.expiringCount > 0 ? 'amber' : 'green'}
          loading={stats.loading}
        />
        <StatCard
          title="Monthly Revenue"
          value={stats.loading ? '—' : formatCurrency(stats.data.monthlyRevenue)}
          subtitle={stats.data.monthlyRevenue === 0 ? 'No revenue recorded' : 'This month'}
          icon={<DollarSign size={17} />}
          trend={stats.data.revenueGrowth || undefined}
          accentColor="green"
          loading={stats.loading}
        />
      </div>

      {/* ── Row 3: Revenue + Member Growth ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <RevenueChart
            data={revenue.data}
            loading={revenue.loading}
            error={revenue.error}
          />
        </div>
        <div className="lg:col-span-2">
          <MemberGrowthChart
            data={growth.data}
            loading={growth.loading}
            error={growth.error}
          />
        </div>
      </div>

      {/* ── Row 4: Attendance + Membership Distribution ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <AttendanceChart
            data={attendance.data}
            loading={attendance.loading}
            error={attendance.error}
          />
        </div>
        <div className="lg:col-span-2">
          <MembershipDistribution
            data={distribution.data}
            loading={distribution.loading}
            error={distribution.error}
          />
        </div>
      </div>

      {/* ── Row 5: Recent Members + Recent Payments ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentMembers
          data={members.data}
          loading={members.loading}
          error={members.error}
        />
        <RecentPayments
          data={payments.data}
          loading={payments.loading}
          error={payments.error}
        />
      </div>

      {/* ── Row 6: Expiring Memberships + Quick Actions ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpiringMemberships
          data={expiring.data}
          loading={expiring.loading}
          error={expiring.error}
        />
        <QuickActions />
      </div>

    </div>
  );
}
