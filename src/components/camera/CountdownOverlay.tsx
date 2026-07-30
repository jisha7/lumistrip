/* ============================================
   LumiStrip — Countdown Overlay
   3-2-1 animated countdown with flash effect
   ============================================ */

import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  current: number | null;
  isActive: boolean;
  flash: boolean;
}

export function CountdownOverlay({ current, isActive, flash }: CountdownOverlayProps) {
  return (
    <AnimatePresence>
      {isActive && current !== null && (
        <motion.div
          key={current}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 'var(--radius-xl)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            style={{
              fontSize: 'clamp(5rem, 15vw, 10rem)',
              fontWeight: 800,
              color: '#fff',
              fontFamily: 'var(--font-display)',
              textShadow: '0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(236,72,153,0.3)',
              lineHeight: 1,
            }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {current}
          </motion.span>
        </motion.div>
      )}

      {/* Flash effect */}
      {flash && (
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 25,
            background: '#fff',
            borderRadius: 'var(--radius-xl)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  );
}
