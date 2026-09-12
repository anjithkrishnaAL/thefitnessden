import React from 'react';
import { Hammer } from 'lucide-react';
import { Badge } from '../components/ui';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
}

export function PlaceholderPage({ title, description, icon, features }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 text-center animate-fade-in">
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-den-card border border-den-border flex items-center justify-center mb-6 text-den-accent shadow-den-lg">
        {icon}
      </div>

      {/* Badge */}
      <Badge variant="accent" className="mb-4">
        <Hammer size={10} className="mr-1" />
        Coming Next
      </Badge>

      {/* Title */}
      <h2 className="text-2xl font-bold text-den-text mb-2">{title}</h2>
      <p className="text-sm text-den-muted max-w-md leading-relaxed mb-8">{description}</p>

      {/* Feature list */}
      {features && features.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-den-card border border-den-border text-left"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-den-accent shrink-0" />
              <span className="text-sm text-den-muted">{f}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
