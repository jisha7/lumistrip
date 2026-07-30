/* ============================================
   LumiStrip — Template Card
   Premium template selection card with hover preview
   ============================================ */

import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import type { Template } from '../../types';

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: (id: string) => void;
  index: number;
}

export function TemplateCard({ template, isSelected, onSelect, index }: TemplateCardProps) {
  const previewGradient = `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})`;

  return (
    <motion.button
      onClick={() => onSelect(template.id)}
      style={{
        position: 'relative',
        border: isSelected ? '2px solid var(--accent)' : '2px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg)',
        padding: 0,
        cursor: 'pointer',
        overflow: 'hidden',
        textAlign: 'left',
        width: '100%',
        transition: 'border-color 0.3s ease',
        boxShadow: isSelected ? '0 0 24px rgba(240,185,78,0.2)' : 'none',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Preview gradient */}
      <div
        style={{
          height: '140px',
          background: template.stripStyle.backgroundColor.includes('gradient')
            ? template.stripStyle.backgroundColor
            : previewGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Simulated strip preview */}
        <div
          style={{
            width: '80px',
            height: '100px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: '6px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.25)',
                borderRadius: '2px',
              }}
            />
          ))}
        </div>

        {/* Premium badge */}
        {template.isPremium && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              borderRadius: '999px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#FCD34D',
            }}
          >
            <Sparkles size={10} />
            Premium
          </div>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Check size={14} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--text-h)',
            margin: '0 0 4px',
            fontFamily: 'var(--font-body)',
          }}
        >
          {template.name}
        </h3>
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {template.description}
        </p>

        {/* Color dots */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          {[template.colors.primary, template.colors.secondary, template.colors.accent].map(
            (color, i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: color,
                  border: '1px solid var(--border)',
                }}
              />
            )
          )}
        </div>
      </div>
    </motion.button>
  );
}
