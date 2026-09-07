import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch {
      setError(t('common.deleteError'));
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose} widthClassName="max-w-sm">
      <p className="mb-4 text-sm text-text-secondary">{message}</p>
      {error && <p className="mb-4 text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2.5 text-sm text-text-secondary
            transition-colors hover:bg-bg"
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white
            transition-colors hover:bg-danger/90 disabled:opacity-60"
        >
          {submitting ? t('common.loading') : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

