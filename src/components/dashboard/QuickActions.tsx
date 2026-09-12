import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CreditCard, ScanLine, Dumbbell } from 'lucide-react';
import { CardTitle } from '../ui/Card';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  accentClass: string;
  iconBgClass: string;
}

const ACTIONS: QuickAction[] = [
  {
    id: 'add-member',
    label: 'Add Member',
    description: 'Register a new gym member',
    icon: <UserPlus size={20} />,
    route: '/members',
    accentClass: 'hover:border-den-accent/40 hover:shadow-den-accent-sm',
    iconBgClass: 'bg-den-accent/10 border-den-accent/20 text-den-accent',
  },
  {
    id: 'record-payment',
    label: 'Record Payment',
    description: 'Log a membership payment',
    icon: <CreditCard size={20} />,
    route: '/payments',
    accentClass: 'hover:border-blue-500/30',
    iconBgClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  },
  {
    id: 'mark-attendance',
    label: 'Mark Attendance',
    description: 'Check in a member today',
    icon: <ScanLine size={20} />,
    route: '/attendance',
    accentClass: 'hover:border-emerald-500/30',
    iconBgClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  },
  {
    id: 'add-trainer',
    label: 'Add Trainer',
    description: 'Onboard a new trainer',
    icon: <Dumbbell size={20} />,
    route: '/trainers',
    accentClass: 'hover:border-violet-500/30',
    iconBgClass: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-den-card border border-den-border rounded-xl p-5">
      <div className="mb-4">
        <CardTitle>Quick Actions</CardTitle>
        <p className="text-xs text-den-muted mt-0.5">Shortcuts to common tasks</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map(action => (
          <button
            key={action.id}
            onClick={() => navigate(action.route)}
            className={[
              'flex flex-col items-start gap-3 p-4 rounded-xl text-left',
              'bg-den-surface border border-den-border',
              'hover:bg-den-cardHover hover:-translate-y-0.5',
              'transition-all duration-200 cursor-pointer group',
              action.accentClass,
            ].join(' ')}
          >
            <div className={[
              'w-9 h-9 rounded-xl border flex items-center justify-center shrink-0',
              'transition-transform duration-200 group-hover:scale-110',
              action.iconBgClass,
            ].join(' ')}>
              {action.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-den-text leading-tight">{action.label}</p>
              <p className="text-xs text-den-muted mt-0.5 leading-tight">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
