import React from 'react';
import { Problem } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { PrimaryButton } from '../common/PrimaryButton';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  problem: Problem | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  problem,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen || !problem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md">
        <GlassCard className="p-6 border-red-500/30">
          <div className="flex items-center space-x-3 mb-4 text-red-400">
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Problem</h3>
              <p className="text-xs text-white/50">This action cannot be undone.</p>
            </div>
          </div>

          <p className="text-sm text-white/70 mb-6">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-white font-mono">[{problem.id}] {problem.title}</span>?
          </p>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 text-xs font-medium text-white/60 hover:text-white rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1]"
            >
              Cancel
            </button>
            <PrimaryButton
              variant="danger"
              loading={loading}
              onClick={onConfirm}
              className="py-2.5 px-5 text-xs font-semibold"
            >
              Confirm Delete
            </PrimaryButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
