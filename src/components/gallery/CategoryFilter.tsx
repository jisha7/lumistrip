/* ============================================
   LumiStrip — Category Filter
   Tabs for filtering templates by category
   ============================================ */

import { motion } from 'framer-motion';
import { TEMPLATE_CATEGORIES } from '../../constants/templates';

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '0 16px',
      }}
    >
      {TEMPLATE_CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <motion.button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '999px',
              border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: isActive ? 'var(--accent-bg)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-body)',
            }}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
