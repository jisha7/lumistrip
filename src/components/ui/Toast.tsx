/* ============================================
   LumiStrip — Toast Notification
   Animated slide-in toast with types
   ============================================ */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const icons = {
  success: <CheckCircle size={20} color="#10B981" />,
  error: <XCircle size={20} color="#EF4444" />,
  info: <Info size={20} color="#6366F1" />,
  warning: <AlertTriangle size={20} color="#F59E0B" />,
};

const backgrounds = {
  success: 'rgba(16, 185, 129, 0.1)',
  error: 'rgba(239, 68, 68, 0.1)',
  info: 'rgba(99, 102, 241, 0.1)',
  warning: 'rgba(245, 158, 11, 0.1)',
};

const borders = {
  success: '1px solid rgba(16, 185, 129, 0.2)',
  error: '1px solid rgba(239, 68, 68, 0.2)',
  info: '1px solid rgba(99, 102, 241, 0.2)',
  warning: '1px solid rgba(245, 158, 11, 0.2)',
};

export function Toast({ message, type, onClose }: ToastData) {
  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 'var(--z-toast)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          background: backgrounds[type],
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: borders[type],
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '380px',
        }}
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {icons[type]}
        <span style={{ flex: 1, fontSize: '0.925rem', color: 'var(--text-h)', fontWeight: 500 }}>
          {message}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text)',
            padding: 2,
            display: 'flex',
            opacity: 0.6,
          }}
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

