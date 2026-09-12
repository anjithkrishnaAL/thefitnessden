import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import type { DropdownItem } from '../ui/Dropdown';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/cn';
import { useAuth } from '../../hooks/useAuth';
import { getNotifications, getUnreadNotificationCount, type NotificationRow } from '../../services/notificationService';

// Map routes to page titles
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/attendance': 'Attendance',
  '/memberships': 'Memberships',
  '/payments': 'Payments',
  '/trainers': 'Trainers',
  '/workouts': 'Workout Plans',
  '/progress': 'Progress',
  '/expenses': 'Expenses',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/reminders': 'Reminders',
  '/settings': 'Settings',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<NotificationRow[]>([]);

  React.useEffect(() => {
    getUnreadNotificationCount().then(setUnreadCount).catch(() => setUnreadCount(0));
  }, [location.pathname]);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'TheFitnessDen';

  // Derive display values from real profile
  const displayName = profile?.full_name || 'User';
  const displayEmail = profile?.email ?? '';
  const displayRole = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : '';
  const avatarUrl = profile?.avatar_url ?? undefined;

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      // Sign out failed — navigate anyway for safety
      navigate('/login', { replace: true });
    }
  }

  const profileItems: DropdownItem[] = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User size={14} />,
      onClick: () => navigate('/settings'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={14} />,
      onClick: () => navigate('/settings'),
    },
    { id: 'divider', label: '', divider: true },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut size={14} />,
      danger: true,
      onClick: handleSignOut,
    },
  ];

  return (
    <header className="h-16 shrink-0 flex items-center gap-4 px-4 lg:px-6 border-b border-den-border bg-den-surface/80 backdrop-blur-md">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-den-muted hover:text-den-text transition-colors p-2 -ml-2 rounded-xl hover:bg-white/5"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-den-text hidden sm:block truncate shrink-0">
        {pageTitle}
      </h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search size={15} className="absolute left-3 text-den-muted pointer-events-none" />
        <input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="Search..."
          className={cn(
            'h-9 w-56 lg:w-72 bg-den-card border border-den-border rounded-xl',
            'pl-9 pr-3.5 text-sm text-den-text placeholder:text-den-muted',
            'focus:outline-none focus:ring-2 focus:ring-den-accent/40 focus:border-den-accent/60 focus:w-72 lg:focus:w-80',
            'transition-all duration-200'
          )}
          aria-label="Search"
        />
      </div>

      {/* Notification bell */}
      <div className="relative">
        <button onClick={() => { setNotificationPanelOpen(value => !value); void getNotifications().then(rows => setRecentNotifications(rows.slice(0, 5))).catch(() => setRecentNotifications([])); }} className="relative text-den-muted hover:text-den-text transition-colors p-2 rounded-xl hover:bg-white/5" aria-label="Notifications">
          <Bell size={19} />
          {unreadCount > 0 && <span className="absolute -top-0.5 -right-1 min-w-4 h-4 px-1 rounded-full bg-den-accent text-black text-[10px] font-bold flex items-center justify-center ring-2 ring-den-surface">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>
        {notificationPanelOpen && <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-den-border bg-den-card shadow-den-xl p-3"><div className="flex items-center justify-between mb-2"><p className="text-sm font-semibold text-den-text">Notifications</p><button className="text-xs text-den-accent" onClick={() => { setNotificationPanelOpen(false); navigate('/notifications'); }}>View all</button></div>{recentNotifications.length ? <div className="space-y-1">{recentNotifications.map(item => <button key={item.id} onClick={() => { setNotificationPanelOpen(false); navigate('/notifications'); }} className="w-full text-left rounded-lg p-2.5 hover:bg-white/5"><p className="text-xs font-medium text-den-text truncate">{item.title}</p><p className="text-xs text-den-muted truncate mt-0.5">{item.message}</p></button>)}</div> : <p className="text-xs text-den-muted py-5 text-center">You are all caught up.</p>}</div>}
      </div>

      {/* Profile dropdown */}
      {!profile ? (
        /* Loading skeleton */
        <div className="flex items-center gap-2 px-2">
          <Skeleton circle className="w-7 h-7 shrink-0" />
          <div className="hidden lg:flex flex-col gap-1">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2 w-14" />
          </div>
        </div>
      ) : (
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 pl-1 py-1 pr-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <Avatar name={displayName} src={avatarUrl} size="sm" />
              <div className="hidden lg:block text-left leading-tight">
                <p className="text-xs font-medium text-den-text truncate max-w-[120px]">{displayName}</p>
                {displayRole && (
                  <p className="text-2xs text-den-muted">{displayRole}</p>
                )}
              </div>
              <ChevronDown size={14} className="text-den-muted hidden lg:block" />
            </div>
          }
          items={profileItems}
          align="right"
        />
      )}
    </header>
  );
}
