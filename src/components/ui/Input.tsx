import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  onSuffixClick?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefixIcon,
      suffixIcon,
      onSuffixClick,
      className,
      id,
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-den-text"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <span className="absolute left-3 text-den-muted flex items-center pointer-events-none">
              {prefixIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              'w-full h-10 bg-den-surface border rounded-xl text-sm text-den-text placeholder:text-den-muted',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-den-accent/40 focus:border-den-accent/60',
              error
                ? 'border-red-500/60 focus:ring-red-500/20 focus:border-red-500/60'
                : 'border-den-border hover:border-den-borderHover',
              prefixIcon ? 'pl-9' : 'pl-3.5',
              isPassword || suffixIcon ? 'pr-10' : 'pr-3.5',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 text-den-muted hover:text-den-text transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {!isPassword && suffixIcon && (
            <button
              type="button"
              onClick={onSuffixClick}
              className="absolute right-3 text-den-muted hover:text-den-text transition-colors"
              tabIndex={-1}
            >
              {suffixIcon}
            </button>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-den-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
