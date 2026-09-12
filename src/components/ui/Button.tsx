import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { ButtonVariant, Size } from '../../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-den-accent text-black font-semibold hover:bg-den-accent-dim active:scale-[0.98] shadow-den-accent-sm hover:shadow-den-accent',
  ghost:
    'text-den-muted hover:text-den-text hover:bg-white/5 active:bg-white/10',
  outline:
    'border border-den-border text-den-text hover:border-den-accent/50 hover:text-den-accent hover:bg-den-accent/5 active:scale-[0.98]',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98]',
  subtle:
    'bg-white/5 text-den-text hover:bg-white/10 active:scale-[0.98]',
};

const sizeClasses: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
  xl: 'h-11 px-6 text-base gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium',
          'transition-all duration-150 cursor-pointer select-none',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-den-accent focus-visible:outline-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin shrink-0" size={size === 'xs' ? 12 : size === 'sm' ? 13 : 14} />
        ) : (
          icon && iconPosition === 'left' && (
            <span className="shrink-0 flex items-center">{icon}</span>
          )
        )}
        {children && <span className={cn(loading && 'opacity-70')}>{children}</span>}
        {!loading && icon && iconPosition === 'right' && (
          <span className="shrink-0 flex items-center">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
