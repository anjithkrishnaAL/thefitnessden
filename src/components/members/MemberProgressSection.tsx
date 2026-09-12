import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { getProgressRecords } from '../../services/progressService';
import type { Member, ProgressRecord } from '../../types';

export function MemberProgressSection({ member }: { member: Member }) {
  const navigate = useNavigate(); const [records, setRecords] = useState<ProgressRecord[]>([]);
  useEffect(() => { getProgressRecords(member.id).then(setRecords).catch(() => setRecords([])); }, [member.id]);
  const first = records.find(r => r.weight != null); const latest = [...records].reverse().find(r => r.weight != null); const change = first?.weight != null && latest?.weight != null ? latest.weight - first.weight : null;
  return <section className="py-6 border-b border-den-border"><div className="flex items-center justify-between mb-4"><h3 className="text-xs font-semibold text-den-muted uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14} /> Progress</h3><Button size="sm" variant="outline" onClick={() => navigate('/progress')}>View Full Progress</Button></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-3"><div className="rounded-xl bg-den-surface border border-den-border p-3"><p className="text-xs text-den-muted">Current weight</p><p className="text-lg font-semibold text-den-text">{latest?.weight ?? '—'}{latest?.weight != null ? ' kg' : ''}</p></div><div className="rounded-xl bg-den-surface border border-den-border p-3"><p className="text-xs text-den-muted">Starting weight</p><p className="text-lg font-semibold text-den-text">{first?.weight ?? '—'}{first?.weight != null ? ' kg' : ''}</p></div><div className="rounded-xl bg-den-surface border border-den-border p-3"><p className="text-xs text-den-muted">Change</p><p className="text-lg font-semibold text-den-text">{change == null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(1)} kg`}</p></div><div className="rounded-xl bg-den-surface border border-den-border p-3"><p className="text-xs text-den-muted">Body fat</p><p className="text-lg font-semibold text-den-text">{latest?.body_fat_percentage == null ? '—' : `${latest.body_fat_percentage}%`}</p></div></div><p className="text-xs text-den-muted mt-3">Latest measurement: {latest?.recorded_date ?? 'No measurements recorded'}</p></section>;
}
