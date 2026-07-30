/* ============================================
   LumiStrip — Template Gallery Page
   Browse and select photo strip templates
   ============================================ */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePhotoBooth } from '../context/PhotoBoothContext';
import { CategoryFilter } from '../components/gallery/CategoryFilter';
import { TemplateGrid } from '../components/gallery/TemplateGrid';
import { Button } from '../components/ui/Button';

export function GalleryPage() {
  const { state, selectTemplate, setPage } = usePhotoBooth();
  const [category, setCategory] = useState('all');

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '80px',
        paddingBottom: '80px',
      }}
    >
      {/* Header */}
      <motion.div
        style={{ textAlign: 'center', marginBottom: '40px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 700,
            color: 'var(--text-h)',
            margin: '0 0 12px',
            fontFamily: 'var(--font-display)',
          }}
        >
          Choose Your Style
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text)',
            maxWidth: '480px',
            margin: '0 auto 8px',
          }}
        >
          Pick a template that matches your vibe
        </p>
      </motion.div>

      {/* Category filter */}
      <motion.div
        style={{ marginBottom: '36px' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <CategoryFilter selected={category} onChange={setCategory} />
      </motion.div>

      {/* Template grid */}
      <TemplateGrid
        selectedId={state.selectedTemplateId}
        category={category}
        onSelect={selectTemplate}
      />

      {/* Bottom CTA */}
      <motion.div
        style={{
          textAlign: 'center',
          marginTop: '48px',
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Button variant="primary" size="md" onClick={() => setPage('camera')}>
          Start Session
        </Button>
        <Button variant="secondary" size="md" onClick={() => setPage('landing')}>
          Back Home
        </Button>
      </motion.div>
    </div>
  );
}
