/* ============================================
   LumiStrip — GlassCard Component
   Premium glassmorphism card with hover effects
   ============================================ */

import { motion } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

interface GlassCardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: string;
  onClick?: () => void;
}

export function GlassCard({
  children,
  style,
  className = '',
  hover = true,
  glow = false,
  padding = '24px',
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      className={`lumistrip-glass-card ${className}`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding,
        boxShadow: glow
          ? 'var(--glass-shadow), 0 0 24px rgba(240, 185, 78, 0.18)'
          : 'var(--glass-shadow)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      whileHover={hover ? { y: -4, boxShadow: 'var(--glass-shadow-lg)' } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

