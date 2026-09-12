import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

const widthClasses = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
};

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'lg',
}: DrawerProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        className={cn(
          'relative flex flex-col h-full w-full bg-den-card border-l border-den-border shadow-2xl',
          widthClasses[width]
        )}
        style={{ animation: 'slideInRight 0.22s cubic-bezier(0.25,0.46,0.45,0.94)' }}
      >
        {/* Header */}
        {(title || true) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-den-border shrink-0">
            <div>
              {title && (
                <h2 id="drawer-title" className="text-base font-semibold text-den-text">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-den-muted mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-den-muted hover:text-den-text transition-colors p-1.5 -mr-1 rounded-xl hover:bg-white/5 shrink-0"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-den-border bg-den-card">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
