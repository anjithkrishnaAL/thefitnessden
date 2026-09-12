import React from 'react';
import { BarChart3 } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function ReportsPage() {
  return (
    <PlaceholderPage
      title="Reports"
      description="Deep-dive into your gym's performance. Generate detailed reports on revenue, attendance, member retention, and growth — all exportable."
      icon={<BarChart3 size={32} />}
      features={[
        'Revenue reports',
        'Attendance analytics',
        'Member retention',
        'Growth trends',
        'Custom date ranges',
        'CSV/PDF export',
      ]}
    />
  );
}
