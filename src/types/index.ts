// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string; // lucide icon name
  badge?: string | number;
}

// ─── User / Profile ───────────────────────────────────────────────────────────

/** Matches the public.profiles table row exactly */
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: 'admin' | 'trainer' | 'staff';
  created_at: string;
  updated_at: string;
}

/** Legacy alias kept for components not yet migrated */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'staff';
  avatarUrl?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthError {
  message: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
}

// ─── Generic ──────────────────────────────────────────────────────────────────

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger' | 'subtle';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  newMembers: number;
  expiringCount: number;
  monthlyRevenue: number;
  totalMembersGrowth: number;   // % vs last month (can be 0 when no prior data)
  activeMembersPercent: number; // % of total that are active
  revenueGrowth: number;        // % vs last month
}

export interface RevenueDataPoint {
  month: string;      // e.g. "Jan", "Feb"
  revenue: number;
}

export interface MemberGrowthDataPoint {
  month: string;
  newMembers: number;
}

export interface AttendanceDataPoint {
  day: string;        // "Mon" … "Sun"
  checkIns: number;
}

export interface MembershipDistributionItem {
  name: string;       // e.g. "Basic", "Premium", "Elite"
  value: number;
  color: string;
}

export interface RecentMember {
  id: string;
  name: string;
  memberId: string;
  membershipPlan: string;
  joinedAt: string;
  status: 'active' | 'inactive' | 'expired';
  avatarUrl?: string | null;
}

export interface RecentPayment {
  id: string;
  memberName: string;
  amount: number;
  paidAt: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  memberAvatarUrl?: string | null;
}

export interface ExpiringMembership {
  id: string;
  memberName: string;
  membershipPlan: string;
  expiresAt: string;
  daysRemaining: number;
  avatarUrl?: string | null;
}

// ─── Members Module ────────────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'inactive' | 'suspended';
export type MemberGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type FitnessGoal =
  | 'weight_loss'
  | 'muscle_gain'
  | 'general_fitness'
  | 'strength'
  | 'endurance';

export interface Member {
  id: string;
  member_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: MemberGender | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  profile_photo_url: string | null;
  height: number | null;
  weight: number | null;
  fitness_goal: FitnessGoal | null;
  medical_notes: string | null;
  trainer_id: string | null;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
  current_membership?: MembershipSummary | null;
}

export interface CreateMemberInput {
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: MemberGender;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_photo_url?: string;
  height?: number;
  weight?: number;
  fitness_goal?: FitnessGoal;
  medical_notes?: string;
  status?: MemberStatus;
}

export interface UpdateMemberInput extends Partial<CreateMemberInput> {
  id: string;
}

export interface MemberFilters {
  search: string;
  status: MemberStatus | '';
  gender: MemberGender | '';
  fitness_goal: FitnessGoal | '';
}

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  newThisMonth: number;
}

export interface MemberPage {
  data: Member[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Memberships Module ──────────────────────────────────────────────────────

export type MembershipPlanStatus = 'active' | 'inactive';
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface MembershipPlan {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  description: string | null;
  features: string[];
  status: MembershipPlanStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateMembershipPlanInput {
  name: string;
  duration_months: number;
  price: number;
  description?: string;
  features?: string[];
  status?: MembershipPlanStatus;
}

export interface UpdateMembershipPlanInput extends Partial<CreateMembershipPlanInput> {
  id: string;
}

export interface MembershipSummary {
  id: string;
  plan_id: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  price: number;
  status: MembershipStatus;
  days_remaining: number;
}

export interface Membership extends MembershipSummary {
  member_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  member?: Pick<Member, 'id' | 'full_name' | 'member_id' | 'profile_photo_url'>;
  plan?: MembershipPlan;
}

export interface CreateMembershipInput {
  member_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  price: number;
  notes?: string;
  status?: MembershipStatus;
}

export interface MembershipFilters {
  status?: MembershipStatus | 'expiring';
  search?: string;
}

// ─── Payments Module ─────────────────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  member_id: string;
  membership_id: string | null;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  status: PaymentStatus;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  member?: Pick<Member, 'id' | 'full_name' | 'member_id' | 'profile_photo_url'>;
  membership?: { id: string; plan_name: string; start_date: string; end_date: string } | null;
}

export interface CreatePaymentInput {
  member_id: string;
  membership_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  status?: PaymentStatus;
  transaction_id?: string;
  notes?: string;
}

export interface UpdatePaymentInput extends Partial<Omit<CreatePaymentInput, 'member_id'>> {
  id: string;
}

export interface PaymentFilters {
  search: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  fromDate: string;
  toDate: string;
  method: PaymentMethod | '';
  status: PaymentStatus | '';
}

export interface PaymentStats {
  totalRevenue: number;
  thisMonth: number;
  today: number;
  pending: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

// ─── Attendance Module ───────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'completed' | 'absent';

export interface Attendance {
  id: string;
  member_id: string;
  check_in: string;
  check_out: string | null;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  member?: Pick<Member, 'id' | 'full_name' | 'member_id' | 'phone' | 'profile_photo_url'>;
}

export interface AttendanceStats {
  todayCheckIns: number;
  currentlyInside: number;
  completedVisits: number;
  averageVisitMinutes: number;
}

export interface AttendanceFilters {
  date: string;
  search: string;
  page: number;
  pageSize: number;
}

export interface CheckInInput { member_id: string; notes?: string; }
export interface CheckOutInput { id: string; }
export interface AttendanceCalendarData { date: string; count: number; }
