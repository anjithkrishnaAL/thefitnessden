import React from 'react';
import { Activity } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function WorkoutsPage() {
  return (
    <PlaceholderPage
      title="Workout Plans"
      description="Build and assign workout programs. Create structured fitness plans with exercises, sets, reps, and progression for each member."
      icon={<Activity size={32} />}
      features={[
        'Plan builder',
        'Exercise library',
        'Member assignment',
        'Progression tracking',
        'Custom templates',
        'Schedule integration',
      ]}
    />
  );
}
