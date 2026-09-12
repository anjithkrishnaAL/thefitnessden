import React from 'react';
import { TrendingUp } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function ProgressPage() {
  return (
    <PlaceholderPage
      title="Progress"
      description="Monitor member fitness journeys. Log body measurements, track PRs, visualize progress charts, and celebrate transformation milestones."
      icon={<TrendingUp size={32} />}
      features={[
        'Body measurements',
        'Progress photos',
        'PB & PR tracking',
        'Progress charts',
        'Goal setting',
        'Transformation timeline',
      ]}
    />
  );
}
