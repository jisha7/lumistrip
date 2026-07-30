/* ============================================
   LumiStrip — Button Primitive
   Premium, animated, glassmorphism button
   ============================================ */

import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const variants = {
  primary: {
    background: 'var(--gradient-primary)',
    color: 'var(--ink)',
    border: '1px solid rgba(34, 29, 40, 0.06)',
    boxShadow: '0 4px 20px rgba(232, 166, 163, 0.35)',
  },
  secondary: {
    background: 'var(--paper)',
    color: 'var(--text-h)',
    border: '1.5px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-h)',
    border: 'none',
  },
  glass: {
    background: 'var(--glass-bg)',
    color: 'var(--ink)',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'var(--glass-blur)',
  },
  gradient: {
    background: 'var(--gradient-secondary)',
    color: 'var(--ink)',
    border: '1px solid rgba(34, 29, 40, 0.06)',
    boxShadow: '0 4px 20px rgba(201, 191, 232, 0.35)',
  },
};

const sizes = {
  sm: { padding: '8px 16px', fontSize: '0.875rem', borderRadius: 'var(--radius-md)' },
  md: { padding: '12px 24px', fontSize: '1rem', borderRadius: 'var(--radius-lg)' },
  lg: { padding: '16px 32px', fontSize: '1.125rem', borderRadius: 'var(--radius-xl)' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  fullWidth,
  loading,
  style,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`lumistrip-button${variant === 'primary' && !disabled && !loading ? ' lumistrip-flash-cta' : ''}`}
      style={{
        ...variants[variant],
        ...sizes[size],
        width: fullWidth ? '100%' : 'auto',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      whileHover={!disabled && !loading ? { scale: 1.03, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading && (
        <motion.span
          style={{
            width: 16,
            height: 16,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            display: 'inline-block',
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        />
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </motion.button>
  );
}

