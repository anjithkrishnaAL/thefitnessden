import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Plus, RefreshCw, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { ToastContainer } from '../components/ui/Toast';
import { Skeleton } from '../components/ui/Skeleton';
import { MemberStats } from '../components/members/MemberStats';
import { MemberFiltersBar } from '../components/members/MemberFilters';
import { MemberTable } from '../components/members/MemberTable';
import { MemberCard, MemberCardSkeleton } from '../components/members/MemberCard';
import { MemberForm } from '../components/members/MemberForm';
import { MemberProfile } from '../components/members/MemberProfile';
import { useToast } from '../hooks/useToast';
import type { Member, MemberFilters, MemberStats as Stats } from '../types';
import { deleteMember, exportMembers, getMemberStats, getMembers } from '../services/memberService';

const INITIAL_FILTERS: MemberFilters = { search: '', status: '', gender: '', fitness_goal: '' };

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function MembersPage() {
  const [filters, setFilters] = useState<MemberFilters>(INITIAL_FILTERS);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, suspended: 0, newThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [viewing, setViewing] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toasts, success, error: toastError, dismiss } = useToast();

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try { setStats(await getMemberStats()); } catch (err) { console.error('[MembersPage] stats:', err); } finally { setStatsLoading(false); }
  }, []);

  const loadMembers = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const result = await getMembers(filters, page, pageSize);
      setMembers(result.data); setTotal(result.total);
    } catch (err) {
      console.error('[MembersPage] members:', err); setMembers([]); setTotal(0); setError(true);
    } finally { setLoading(false); }
  }, [filters, page, pageSize]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { const timer = window.setTimeout(loadMembers, 250); return () => window.clearTimeout(timer); }, [loadMembers]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2), [page, totalPages]);

  function changeFilters(next: MemberFilters) { setFilters(next); setPage(1); }
  function openAdd() { setEditing(null); setFormOpen(true); }
  function openEdit(member: Member) { setEditing(member); setFormOpen(true); }

  function handleFormSuccess(_member: Member) {
    const wasEditing = Boolean(editing);
    setFormOpen(false); setEditing(null); loadMembers(); loadStats();
    success(wasEditing ? 'Member updated successfully.' : 'Member added successfully.');
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteMember(deleting.id); setDeleting(null);
      if (members.length === 1 && page > 1) setPage(p => p - 1);
      await Promise.all([loadMembers(), loadStats()]); success('Member deleted successfully.');
    } catch (err) { console.error('[MembersPage] delete:', err); toastError('Unable to delete member.', 'Please try again.'); }
    finally { setDeleteLoading(false); }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const rows = await exportMembers(filters);
      const headers = ['Member ID', 'Full Name', 'Email', 'Phone', 'Date of Birth', 'Gender', 'Address', 'Emergency Contact Name', 'Emergency Contact Phone', 'Height', 'Weight', 'Fitness Goal', 'Status', 'Joined'];
      const lines = rows.map(m => [m.member_id, m.full_name, m.email, m.phone, m.date_of_birth, m.gender, m.address, m.emergency_contact_name, m.emergency_contact_phone, m.height, m.weight, m.fitness_goal, m.status, m.created_at].map(csvCell).join(','));
      const blob = new Blob([[headers.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'thefitnessden-members.csv'; link.click(); URL.revokeObjectURL(url);
      success('Members exported successfully.');
    } catch (err) { console.error('[MembersPage] export:', err); toastError('Unable to export members.', 'Please try again.'); }
    finally { setExporting(false); }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-den-text">Members</h1><p className="text-sm text-den-muted mt-1">Manage your TheFitnessDen members.</p></div>
        <div className="flex items-center gap-2"><Button variant="outline" icon={<Download size={15} />} loading={exporting} onClick={handleExport}>Export</Button><Button variant="primary" icon={<Plus size={15} />} onClick={openAdd}>Add Member</Button></div>
      </div>
      <MemberStats stats={stats} loading={statsLoading} />
      <div className="bg-den-card border border-den-border rounded-xl p-3 sm:p-4"><MemberFiltersBar filters={filters} onChange={changeFilters} onClear={() => changeFilters(INITIAL_FILTERS)} /></div>

      {error ? <div className="min-h-[320px] flex flex-col items-center justify-center text-center bg-den-card border border-den-border rounded-xl"><p className="text-base font-semibold text-den-text">Unable to load members.</p><p className="text-sm text-den-muted mt-1 mb-4">Check your connection and try again.</p><Button variant="outline" icon={<RefreshCw size={14} />} onClick={loadMembers}>Try Again</Button></div>
        : loading ? <><div className="hidden sm:block bg-den-card border border-den-border rounded-xl p-4"><Skeleton className="h-5 w-full" /><div className="mt-5 space-y-4">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div></div><div className="sm:hidden space-y-3">{Array.from({ length: 4 }, (_, i) => <MemberCardSkeleton key={i} />)}</div></>
        : total === 0 ? <EmptyState icon={<Users size={28} />} title="No members yet" description="Start building your member base by adding your first member." action={{ label: 'Add Member', onClick: openAdd }} />
        : <><MemberTable members={members} onView={setViewing} onEdit={openEdit} onDelete={setDeleting} /><div className="sm:hidden space-y-3">{members.map(member => <MemberCard key={member.id} member={member} onView={() => setViewing(member)} onEdit={() => openEdit(member)} onDelete={() => setDeleting(member)} />)}</div><div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"><p className="text-den-muted">Showing <span className="text-den-text">{first}–{last}</span> of <span className="text-den-text">{total}</span> members</p><div className="flex items-center gap-2"><select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="h-8 px-2 bg-den-card border border-den-border rounded-lg text-xs text-den-text"><option value={10}>10 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option></select><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>{pageNumbers.map(n => <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-xs ${n === page ? 'bg-den-accent text-den-bg font-semibold' : 'border border-den-border text-den-muted hover:text-den-text'}`}>{n}</button>)}<Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button></div></div></>}

      <MemberForm open={formOpen} member={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSuccess={handleFormSuccess} />
      <MemberProfile open={!!viewing} member={viewing} onClose={() => setViewing(null)} />
      <ConfirmationDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} loading={deleteLoading} danger title="Delete member?" description="Are you sure you want to delete this member? This action cannot be undone." confirmLabel="Delete Member" cancelLabel="Cancel" />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
