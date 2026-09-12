import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { SelectOption } from '../../types';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, onChange, value, ...props }, ref) => {
    const inputId = id ?? `select-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-den-text">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            className={cn(
              'w-full h-10 bg-den-surface border rounded-xl text-sm text-den-text',
              'pl-3.5 pr-9 appearance-none cursor-pointer',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-den-accent/40 focus:border-den-accent/60',
              error
                ? 'border-red-500/60'
                : 'border-den-border hover:border-den-borderHover',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(opt => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-den-card text-den-text"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-den-muted pointer-events-none"
          />
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-den-muted">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
