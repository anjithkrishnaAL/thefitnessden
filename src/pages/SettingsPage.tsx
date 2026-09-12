import React from 'react';
import { Settings } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Configure your gym management system. Update gym details, manage user accounts, set preferences, and customize the system to fit your business."
      icon={<Settings size={32} />}
      features={[
        'Gym profile',
        'User accounts & roles',
        'Branding settings',
        'Tax & currency',
        'Notification preferences',
        'Data backup & export',
      ]}
    />
  );
}
