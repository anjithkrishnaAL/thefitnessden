import React from 'react';
import { Bell } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function NotificationsPage() {
  return (
    <PlaceholderPage
      title="Notifications"
      description="Stay on top of what matters. Manage automated alerts for membership renewals, payment dues, birthday wishes, and system updates."
      icon={<Bell size={32} />}
      features={[
        'Renewal reminders',
        'Payment alerts',
        'Birthday messages',
        'System notifications',
        'Email & SMS',
        'Notification history',
      ]}
    />
  );
}
