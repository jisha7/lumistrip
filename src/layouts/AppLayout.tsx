/* ============================================
   LumiStrip — App Layout
   Shared layout with page transitions, 
   audio toggle, and theme switcher
   ============================================ */

import { motion, AnimatePresence } from 'framer-motion';
import { Music, Music2, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePhotoBooth } from '../context/PhotoBoothContext';
import { Toast } from '../components/ui/Toast';
import type { ReactNode } from 'react';

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

const pageTransition = {
  type: 'spring' as const,
  damping: 25,
  stiffness: 250,
};

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { mode, toggle } = useTheme();
  const { state, dispatch } = usePhotoBooth();

  const ThemeIcon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Floating background orbs */}
      <div
        className="animate-float-slow"
        style={{
          position: 'fixed',
          top: '-10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'var(--gradient-primary)',
          opacity: 0.05,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        className="animate-float"
        style={{
          position: 'fixed',
          bottom: '-10%',
          left: '-5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'var(--gradient-secondary)',
          opacity: 0.05,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: 'linear-gradient(180deg, var(--bg) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
            }}
          >
            LumiStrip
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_MUSIC' })}
            className="lumistrip-icon-btn"
            title={state.isMusicOn ? 'Mute music' : 'Play music'}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: state.isMusicOn ? 'var(--accent)' : 'var(--text)',
              fontSize: '0.875rem',
            }}
          >
            {state.isMusicOn ? <Music2 size={16} /> : <Music size={16} />}
          </button>

          <button
            onClick={toggle}
            className="lumistrip-icon-btn"
            title={`Theme: ${mode}`}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text)',
              fontSize: '0.875rem',
            }}
          >
            <ThemeIcon size={16} />
          </button>
        </div>
      </div>

      {/* Page content with transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={state.currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          style={{
            position: 'relative',
            zIndex: 1,
            minHeight: '100vh',
          }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Toast */}
      {state.toast && (
        <Toast
          message={state.toast.message}
          type={state.toast.type}
          onClose={() => dispatch({ type: 'HIDE_TOAST' })}
        />
      )}
    </div>
  );
}

