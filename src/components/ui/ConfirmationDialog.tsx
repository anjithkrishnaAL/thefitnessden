import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
}: ConfirmationDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="flex flex-col items-center text-center pt-2 pb-4">
        {danger && (
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
        )}
        <h3 className="text-base font-semibold text-den-text mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-den-muted leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex gap-2 pt-2 border-t border-den-border">
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          size="md"
          fullWidth
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
