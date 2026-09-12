import React, { useEffect, useState } from 'react';
import { UserRound, UserMinus, UserPlus } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../../hooks/useToast';
import { assignMemberToTrainer, getTrainers, removeMemberFromTrainer } from '../../services/trainerService';
import type { Member, Trainer } from '../../types';

export function MemberTrainerSection({ member, onUpdated }: { member: Member; onUpdated?: (trainer: Trainer | null) => void }) {
  const { success, error } = useToast();
  const [trainer, setTrainer] = useState<Trainer | null>(member.trainer ? ({ ...member.trainer, email: null, phone: null, bio: null, certifications: null, salary: null, experience_years: null, joining_date: null, status: 'active', created_at: '', updated_at: '' } as Trainer) : null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Trainer | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getTrainers({ search: '', status: 'active', specialization: '' }).then(setTrainers).catch(() => setTrainers([])); }, []);
  const choose = (next: Trainer) => trainer && trainer.id !== next.id ? setPending(next) : save(next);
  const save = async (next: Trainer) => { setSaving(true); try { await assignMemberToTrainer(member.id, next.id); setTrainer(next); onUpdated?.(next); setOpen(false); setPending(null); success('Trainer assigned', `${member.full_name} is now assigned to ${next.full_name}.`); } catch (e) { error('Could not assign trainer', e instanceof Error ? e.message : 'Please try again.'); } finally { setSaving(false); } };
  const remove = async () => { if (!window.confirm(`Remove ${trainer?.full_name ?? 'the trainer'} from ${member.full_name}?`)) return; setSaving(true); try { await removeMemberFromTrainer(member.id); setTrainer(null); onUpdated?.(null); success('Trainer removed'); } catch (e) { error('Could not remove trainer', e instanceof Error ? e.message : 'Please try again.'); } finally { setSaving(false); } };
  return <>
    <section className="py-6 border-b border-den-border"><div className="flex items-center justify-between mb-4"><h3 className="text-xs font-semibold text-den-muted uppercase tracking-widest flex items-center gap-2"><UserRound size={14} /> Trainer</h3>{trainer ? <div className="flex gap-2"><Button size="sm" variant="outline" icon={<UserPlus size={13} />} onClick={() => setOpen(true)}>Change</Button><Button size="sm" variant="ghost" icon={<UserMinus size={13} />} onClick={remove} loading={saving}>Remove</Button></div> : <Button size="sm" icon={<UserPlus size={13} />} onClick={() => setOpen(true)}>Assign Trainer</Button>}</div>{trainer ? <div className="flex items-center gap-3 rounded-xl border border-den-border bg-den-surface p-4"><Avatar src={trainer.profile_photo_url ?? undefined} name={trainer.full_name} size="lg" /><div><p className="font-medium text-den-text">{trainer.full_name}</p><p className="text-xs text-den-muted">{trainer.trainer_id} · {trainer.specialization || 'General Training'}</p><Badge variant="success" size="sm" className="mt-2">Active</Badge></div></div> : <p className="text-sm text-den-muted">No trainer assigned</p>}</section>
    <Modal open={open} onClose={() => setOpen(false)} title={trainer ? 'Change Trainer' : 'Assign Trainer'} description="Choose an active trainer for this member."><div className="space-y-2">{trainers.map(item => <button key={item.id} onClick={() => choose(item)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-den-border hover:border-den-accent/50 text-left"><Avatar src={item.profile_photo_url ?? undefined} name={item.full_name} size="sm" /><span className="text-sm text-den-text">{item.full_name}</span><span className="text-xs text-den-muted ml-auto">{item.specialization || item.trainer_id}</span></button>)}{!trainers.length && <p className="text-sm text-den-muted text-center py-5">No active trainers available.</p>}</div></Modal>
    <Modal open={!!pending} onClose={() => setPending(null)} title="Confirm reassignment" description={pending ? `Move ${member.full_name} from ${trainer?.full_name} to ${pending.full_name}?` : ''}><div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setPending(null)}>Cancel</Button><Button onClick={() => pending && save(pending)} loading={saving}>Confirm change</Button></div></Modal>
  </>;
}
