import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  message,
  type = 'success',
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-3.5 py-2.5 rounded border border-rule bg-surface text-ink shadow-elevation font-mono text-xs"
        >
          {type === 'success' && <CheckCircle2 className="w-4 h-4 text-verdict-supported shrink-0" />}
          {type === 'error' && <AlertCircle className="w-4 h-4 text-verdict-contra shrink-0" />}
          <span className="font-sans text-xs">{message}</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-subtle rounded text-ink-muted transition-colors ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
