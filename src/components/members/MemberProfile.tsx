import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Mail, MapPin, Phone, Ruler, Scale, UserRound } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { BadgeVariant, Member } from '../../types';
import { FITNESS_GOAL_LABELS, GENDER_LABELS } from '../../services/memberService';
import { formatDate } from '../../utils/helpers';
import { getActiveMembership, getMemberMemberships } from '../../services/membershipService';
import { MembershipForm } from '../memberships/MembershipForm';
import type { Membership } from '../../types';
import type { Payment } from '../../types';
import { getMemberPayments } from '../../services/paymentService';
import { durationMinutes, formatDurationMinutes, getMemberAttendance } from '../../services/attendanceService';
import type { Attendance } from '../../types';
import { MemberTrainerSection } from './MemberTrainerSection';
import { MemberWorkoutSection } from './MemberWorkoutSection';
import { MemberProgressSection } from './MemberProgressSection';

interface MemberProfileProps {
  member: Member | null;
  open: boolean;
  onClose: () => void;
}

const statusVariant: Record<string, BadgeVariant> = {
  active: 'success', inactive: 'warning', suspended: 'danger',
};

function Value({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-den-text break-words">{children || <span className="text-den-muted">—</span>}</p>;
}

export function MemberProfile({ member, open, onClose }: MemberProfileProps) {
  const navigate = useNavigate();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [history, setHistory] = useState<Membership[]>([]);
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [membershipMode, setMembershipMode] = useState<'assign' | 'renew'>('assign');
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  async function loadMemberships() {
    if (!member) return;
    setMembershipLoading(true);
    try {
      const [active, all, memberPayments, memberAttendance] = await Promise.all([getActiveMembership(member.id), getMemberMemberships(member.id), getMemberPayments(member.id), getMemberAttendance(member.id)]);
      setMembership(active); setHistory(all); setPayments(memberPayments); setAttendance(memberAttendance);
    } catch (err) { console.error('[MemberProfile] memberships:', err); }
    finally { setMembershipLoading(false); }
  }
  useEffect(() => { if (open && member) loadMemberships(); }, [open, member]);
  if (!member) return null;

  return (
    <Drawer open={open} onClose={onClose} title="Member Profile" description={member.member_id} width="lg">
      <div className="flex items-center gap-4 pb-6 border-b border-den-border">
        <Avatar name={member.full_name} src={member.profile_photo_url ?? undefined} size="xl" />
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-den-text truncate">{member.full_name}</h2>
          <p className="text-sm font-mono text-den-muted mt-1">{member.member_id}</p>
          <Badge variant={statusVariant[member.status] ?? 'default'} size="sm" dot className="mt-2">
            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
          </Badge>
        </div>
      </div>

      <section className="py-6 border-b border-den-border">
        <h3 className="text-xs font-semibold text-den-muted uppercase tracking-widest mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-xs text-den-muted mb-1 flex items-center gap-1.5"><Calendar size={13} /> Date of birth</p><Value>{member.date_of_birth ? formatDate(member.date_of_birth) : ''}</Value></div>
          <div><p className="text-xs text-den-muted mb-1 flex items-center gap-1.5"><UserRound size={13} /> Gender</p><Value>{member.gender ? GENDER_LABELS[member.gender] : ''}</Value></div>
        </div>
      </section>

      <section className="py-6 border-b border-den-border">
        <div className="flex items-center justify-between mb-4"><h3 className="text-xs font-semibold text-den-muted uppercase tracking-widest">Payment History</h3><Button size="sm" onClick={() => navigate('/payments', { state: { memberId: member.id } })}>Record Payment</Button></div>
        {payments.length === 0 ? <p className="text-sm text-den-muted">No payments recorded.</p> : <div className="space-y-2">{payments.slice(0, 5).map(payment => <div key={payment.id} className="flex items-center justify-between gap-3 rounded-lg border border-den-border p-3"><div><p className="text-sm text-den-text">{formatDate(payment.payment_date)}</p><p className="text-xs text-den-muted">{payment.payment_method.replace('_', ' ')}</p></div><div className="text-right"><p className="text-sm font-semibold text-den-accent">₹{payment.amount.toLocaleString('en-IN')}</p><Badge variant={payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'} size="sm">{payment.status}</Badge></div></div>)}</div>}
      </section>

      <section className="py-6 border-b border-den-border">
        <div className="flex items-center justify-between mb-4"><h3 className="text-xs font-semibold text-den-muted uppercase tracking-widest">Membership</h3>{membership && <Badge variant={statusVariant[membership.status] ?? 'default'} size="sm" dot>{membership.status}</Badge>}</div>
        {membershipLoading ? <p className="text-sm text-den-muted">Loading membership…</p> : membership ? <div className="rounded-xl bg-den-accent/5 border border-den-accent/20 p-4"><div className="flex items-start justify-between"><div><p className="text-lg font-semibold text-den-text">{membership.plan_name}</p><p className="text-sm text-den-muted mt-1">₹{membership.price.toLocaleString('en-IN')} · {membership.days_remaining} days remaining</p></div><p className="text-xs text-den-muted text-right">{membership.start_date}<br />to {membership.end_date}</p></div><div className="flex gap-2 mt-4"><Button variant="outline" size="sm" onClick={() => { setMembershipMode('renew'); setMembershipOpen(true); }}>Renew Membership</Button><Button variant="ghost" size="sm" onClick={() => document.getElementById('membership-history')?.scrollIntoView({ behavior: 'smooth' })}>View History</Button></div></div> : <div className="rounded-xl border border-den-border bg-den-surface/50 p-4"><p className="text-sm text-den-muted">No active membership</p><Button className="mt-3" size="sm" onClick={() => { setMembershipMode('assign'); setMembershipOpen(true); }}>+ Assign Membership</Button></div>}
        {history.length > 0 && <div id="membership-history" className="mt-5"><p className="text-xs font-semibold text-den-muted uppercase tracking-widest mb-3">Membership History</p><div className="space-y-2">{history.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-den-border p-3"><div><p className="text-sm text-den-text">{item.plan_name}</p><p className="text-xs text-den-muted">{item.start_date} → {item.end_date} · ₹{item.price.toLocaleString('en-IN')}</p></div><Badge variant={statusVariant[item.status] ?? 'default'} size="sm">{item.status}</Badge></div>)}</div></div>}
      </section>

      <section className="py-6 border-b border-den-border">
        <h3 className="text-xs font-semibold text-den-muted uppercase tracking-widest mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-xs text-den-muted mb-1 flex items-center gap-1.5"><Mail size={13} /> Email</p><Value>{member.email}</Value></div>
          <div><p className="text-xs text-den-muted mb-1 flex items-center gap-1.5"><Phone size={13} /> Phone</p><Value>{member.phone}</Value></div>
          <div className="sm:col-span-2"><p className="text-xs text-den-muted mb-1 flex items-center gap-1.5"><MapPin size={13} /> Address</p><Value>{member.address}</Value></div>
        </div>
      </section>

      <section className="py-6 border-b border-den-border">
        <h3 className="text-xs font-semibold text-den-muted uppercase tracking-widest mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-xs text-den-muted mb-1">Name</p><Value>{member.emergency_contact_name}</Value></div>
          <div><p className="text-xs text-den-muted mb-1">Phone</p><Value>{member.emergency_contact_phone}</Value></div>
        </div>
      </section>

      <section className="py-6 border-b border-den-border">
        <h3 className="text-xs font-semibold text-den-muted uppercase tracking-widest mb-4">Fitness Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-xs text-den-muted mb-1 flex items-center gap-1.5"><Ruler size={13} /> Height</p><Value>{member.height ? `${member.height} cm` : ''}</Value></div>
          <div><p className="text-xs text-den-muted mb-1 flex items-center gap-1.5"><Scale size={13} /> Weight</p><Value>{member.weight ? `${member.weight} kg` : ''}</Value></div>
          <div><p className="text-xs text-den-muted mb-1">Fitness goal</p><Value>{member.fitness_goal ? FITNESS_GOAL_LABELS[member.fitness_goal] : ''}</Value></div>
          <div><p className="text-xs text-den-muted mb-1">Joined</p><Value>{formatDate(member.created_at)}</Value></div>
          <div className="sm:col-span-2"><p className="text-xs text-den-muted mb-1">Medical notes</p><Value>{member.medical_notes}</Value></div>
        </div>
      </section>

      <MemberTrainerSection member={member} />
      <MemberWorkoutSection member={member} />
      <MemberProgressSection member={member} />

      <section className="pt-6">
        <h3 className="text-xs font-semibold text-den-muted uppercase tracking-widest mb-3">Future Modules</h3>
        <div className="grid grid-cols-2 gap-2">
          {['Membership', 'Attendance', 'Payments', 'Workout Plan', 'Progress'].map(item => (
            <div key={item} className="rounded-xl border border-den-border bg-den-surface/50 p-3">
              <p className="text-sm text-den-text">{item}</p>
              <p className="text-xs text-den-muted mt-1">Available in a future module</p>
            </div>
          ))}
        </div>
      </section>
      <section className="pt-6 border-t border-den-border">
        <h3 className="text-xs font-semibold text-den-muted uppercase tracking-widest mb-4">Attendance</h3>
        <div className="grid grid-cols-2 gap-3 mb-4"><div className="rounded-xl bg-den-surface border border-den-border p-3"><p className="text-xs text-den-muted">Total visits</p><p className="text-lg font-semibold text-den-text">{attendance.length}</p></div><div className="rounded-xl bg-den-surface border border-den-border p-3"><p className="text-xs text-den-muted">Average duration</p><p className="text-lg font-semibold text-den-text">{attendance.some(item => item.check_out) ? formatDurationMinutes(attendance.filter(item => item.check_out).reduce((sum, item) => sum + durationMinutes(item), 0) / attendance.filter(item => item.check_out).length) : '—'}</p></div></div>
        {attendance.length === 0 ? <p className="text-sm text-den-muted">No attendance history yet.</p> : <div className="space-y-2">{attendance.slice(0, 5).map(item => <div key={item.id} className="flex justify-between rounded-lg border border-den-border p-3"><span className="text-sm text-den-text">{formatDate(item.date)}</span><span className="text-xs text-den-muted">{formatDurationMinutes(durationMinutes(item))}</span></div>)}</div>}
      </section>
      <MembershipForm open={membershipOpen} member={member} existing={membership} mode={membershipMode} onClose={() => setMembershipOpen(false)} onSuccess={() => { setMembershipOpen(false); loadMemberships(); }} />
    </Drawer>
  );
}
