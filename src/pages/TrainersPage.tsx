import React from 'react';
import { Dumbbell } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function TrainersPage() {
  return (
    <PlaceholderPage
      title="Trainers"
      description="Manage your training staff. Track trainer profiles, assigned clients, schedules, and performance metrics in one unified view."
      icon={<Dumbbell size={32} />}
      features={[
        'Trainer profiles',
        'Client assignments',
        'Schedule management',
        'Specializations',
        'Performance tracking',
        'Commission management',
      ]}
    />
  );
}
