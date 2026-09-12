import React, { useEffect, useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { CreateMembershipPlanInput, MembershipPlan, MembershipPlanStatus } from '../../types';
import { createMembershipPlan, updateMembershipPlan } from '../../services/membershipService';

interface Props { open: boolean; plan?: MembershipPlan | null; onClose: () => void; onSuccess: (plan: MembershipPlan) => void; }

export function MembershipPlanForm({ open, plan, onClose, onSuccess }: Props) {
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [duration, setDuration] = useState('1'); const [price, setPrice] = useState(''); const [features, setFeatures] = useState(''); const [status, setStatus] = useState<MembershipPlanStatus>('active'); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) { setName(plan?.name ?? ''); setDescription(plan?.description ?? ''); setDuration(String(plan?.duration_months ?? 1)); setPrice(plan ? String(plan.price) : ''); setFeatures(plan?.features.join('\n') ?? ''); setStatus(plan?.status ?? 'active'); setError(''); } }, [open, plan]);
  async function submit() {
    const parsedDuration = Number(duration); const parsedPrice = Number(price);
    if (!name.trim()) return setError('Plan name is required.');
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) return setError('Duration must be greater than 0.');
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) return setError('Price must be zero or greater.');
    setSaving(true); setError('');
    const input: CreateMembershipPlanInput = { name: name.trim(), description: description.trim() || undefined, duration_months: parsedDuration, price: parsedPrice, features: features.split('\n').map(v => v.trim()).filter(Boolean), status };
    try { const result = plan ? await updateMembershipPlan({ id: plan.id, ...input }) : await createMembershipPlan(input); onSuccess(result); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to save membership plan.'); }
    finally { setSaving(false); }
  }
  return <Drawer open={open} onClose={onClose} title={plan ? 'Edit Membership Plan' : 'Add Membership Plan'} description="Configure a plan that can be assigned to members." width="md"><div className="space-y-4"><Input label="Plan Name *" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium" autoFocus /><div className="grid grid-cols-2 gap-3"><Select label="Duration" value={duration} onChange={setDuration} options={[1, 3, 6, 12].map(v => ({ value: String(v), label: `${v} ${v === 1 ? 'month' : 'months'}` }))} /><Input label="Price (₹) *" type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="1499" /></div><div><label className="text-sm font-medium text-den-text">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1.5 w-full bg-den-surface border border-den-border rounded-xl text-sm text-den-text px-3.5 py-2.5 resize-none" placeholder="What this plan includes" /></div><div><label className="text-sm font-medium text-den-text">Features <span className="text-den-muted font-normal">(one per line)</span></label><textarea value={features} onChange={e => setFeatures(e.target.value)} rows={5} className="mt-1.5 w-full bg-den-surface border border-den-border rounded-xl text-sm text-den-text px-3.5 py-2.5 resize-none" placeholder={'Gym access\nLocker access'} /></div><Select label="Status" value={status} onChange={v => setStatus(v as MembershipPlanStatus)} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />{error && <p className="text-sm text-red-400">{error}</p>}</div><div className="flex justify-end gap-2 mt-6 pt-4 border-t border-den-border"><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={submit} loading={saving}>{plan ? 'Save Changes' : 'Create Plan'}</Button></div></Drawer>;
}
