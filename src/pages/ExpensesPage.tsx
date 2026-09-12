import React from 'react';
import { Receipt } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function ExpensesPage() {
  return (
    <PlaceholderPage
      title="Expenses"
      description="Keep tabs on operational costs. Record and categorize expenses, track monthly spending, and maintain a clear picture of your gym's financials."
      icon={<Receipt size={32} />}
      features={[
        'Expense recording',
        'Category management',
        'Monthly breakdowns',
        'Vendor tracking',
        'Budget vs actual',
        'Receipt uploads',
      ]}
    />
  );
}
