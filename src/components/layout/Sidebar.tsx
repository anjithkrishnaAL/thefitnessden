import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  DollarSign,
  Dumbbell,
  Activity,
  TrendingUp,
  Receipt,
  BarChart3,
  Bell,
  CalendarClock,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/cn';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',     label: 'Dashboard',      path: '/dashboard',       icon: <LayoutDashboard size={18} /> },
  { id: 'members',       label: 'Members',         path: '/members',         icon: <Users size={18} /> },
  { id: 'attendance',    label: 'Attendance',       path: '/attendance',      icon: <CalendarCheck size={18} /> },
  { id: 'memberships',   label: 'Memberships',      path: '/memberships',     icon: <CreditCard size={18} /> },
  { id: 'payments',      label: 'Payments',         path: '/payments',        icon: <DollarSign size={18} /> },
  { id: 'trainers',      label: 'Trainers',         path: '/trainers',        icon: <Dumbbell size={18} /> },
  { id: 'workouts',      label: 'Workout Plans',    path: '/workouts',        icon: <Activity size={18} /> },
  { id: 'progress',      label: 'Progress',         path: '/progress',        icon: <TrendingUp size={18} /> },
  { id: 'expenses',      label: 'Expenses',         path: '/expenses',        icon: <Receipt size={18} /> },
  { id: 'reports',       label: 'Reports',          path: '/reports',         icon: <BarChart3 size={18} /> },
  { id: 'notifications', label: 'Notifications',    path: '/notifications',   icon: <Bell size={18} /> },
  { id: 'reminders',     label: 'Reminders',         path: '/reminders',       icon: <CalendarClock size={18} /> },
  { id: 'settings',      label: 'Settings',         path: '/settings',        icon: <Settings size={18} /> },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}

function NavItemLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'nav-item group',
        isActive && 'active',
        collapsed && 'justify-center px-2'
      )}
    >
      <span className={cn('shrink-0', isActive ? 'text-den-accent' : 'text-den-muted group-hover:text-den-text')}>
        {item.icon}
      </span>
      {!collapsed && (
        <span className="truncate">{item.label}</span>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <span className={cn(
          'absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap z-50',
          'bg-den-card border border-den-border shadow-den-lg text-den-text',
          'opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150'
        )}>
          {item.label}
        </span>
      )}
    </NavLink>
  );
}

export function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 flex flex-col',
          'bg-den-surface border-r border-den-border sidebar-transition',
          // Desktop
          'lg:relative lg:z-auto',
          collapsed ? 'lg:w-[68px]' : 'lg:w-[240px]',
          // Mobile drawer
          'w-[240px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            'flex items-center shrink-0 border-b border-den-border',
            collapsed ? 'justify-center px-3 h-16' : 'px-5 h-16 gap-3'
          )}
        >
          {!collapsed ? (
            <>
              {/* Logo mark */}
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-den-accent/10 border border-den-accent/25 shrink-0">
                <Zap size={16} className="text-den-accent" />
              </div>
              {/* Text logo */}
              <div className="leading-none select-none">
                <div className="text-[10px] font-bold tracking-[0.2em] text-den-muted uppercase">The</div>
                <div className="text-[15px] font-extrabold tracking-tight text-den-text leading-none">Fitness</div>
                <div className="text-[15px] font-extrabold tracking-wider text-den-accent leading-none">Den</div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-den-accent/10 border border-den-accent/25">
              <Zap size={16} className="text-den-accent" />
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={onCloseMobile}
            className="ml-auto text-den-muted hover:text-den-text transition-colors lg:hidden p-1 rounded-lg hover:bg-white/5"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-0.5 no-scrollbar">
          {NAV_ITEMS.map(item => (
            <NavItemLink
              key={item.id}
              item={item}
              collapsed={collapsed}
              onClick={onCloseMobile}
            />
          ))}
        </nav>

        {/* Footer / Collapse toggle (desktop only) */}
        <div className="shrink-0 border-t border-den-border p-3 hidden lg:block">
          <button
            onClick={onToggleCollapsed}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-den-muted',
              'hover:text-den-text hover:bg-white/5 transition-all duration-150',
              collapsed && 'justify-center'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={16} />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
