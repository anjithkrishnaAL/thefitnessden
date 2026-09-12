import React from 'react';
import { Check, Pencil, Power, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { MembershipPlan } from '../../types';

interface Props { plan: MembershipPlan; onEdit: () => void; onToggle: () => void; onDelete: () => void; }

export function MembershipPlanCard({ plan, onEdit, onToggle, onDelete }: Props) {
  const featured = plan.name.toLowerCase() === 'premium' || plan.name.toLowerCase() === 'elite';
  return (
    <div className={`relative flex flex-col bg-den-card border rounded-2xl p-5 ${featured ? 'border-den-accent/50 shadow-den-accent-sm' : 'border-den-border'}`}>
      {featured && <span className="absolute -top-3 left-5 px-2.5 py-1 rounded-full bg-den-accent text-den-bg text-2xs font-bold uppercase tracking-wider">Popular</span>}
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="text-lg font-semibold text-den-text">{plan.name}</h3><p className="text-sm text-den-muted mt-1 min-h-10">{plan.description || 'Flexible access for your fitness journey.'}</p></div>
        <Badge variant={plan.status === 'active' ? 'success' : 'default'} size="sm" dot>{plan.status === 'active' ? 'Active' : 'Inactive'}</Badge>
      </div>
      <div className="mt-5"><span className="text-3xl font-bold text-den-text">₹{plan.price.toLocaleString('en-IN')}</span><span className="text-sm text-den-muted"> / {plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'}</span></div>
      <div className="mt-5 space-y-2 flex-1">{(plan.features ?? []).map((feature, i) => <p key={`${feature}-${i}`} className="flex items-start gap-2 text-sm text-den-muted"><Check size={15} className="text-den-accent mt-0.5 shrink-0" />{feature}</p>)}{plan.features.length === 0 && <p className="text-sm text-den-muted">No features listed.</p>}</div>
      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-den-border"><Button variant="outline" size="sm" icon={<Pencil size={13} />} onClick={onEdit}>Edit</Button><Button variant="ghost" size="sm" icon={<Power size={13} />} onClick={onToggle}>{plan.status === 'active' ? 'Deactivate' : 'Activate'}</Button><button onClick={onDelete} className="ml-auto p-2 rounded-lg text-red-400 hover:bg-red-500/10" aria-label={`Delete ${plan.name}`}><Trash2 size={15} /></button></div>
    </div>
  );
}
