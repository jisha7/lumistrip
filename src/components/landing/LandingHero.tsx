/* ============================================
   LumiStrip — Landing Hero Section
   Dreamy hero with floating elements, 
   animated title, and CTA
   ============================================ */

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Camera } from 'lucide-react';
import heroImage from '../../assets/images/hero.png';
import { Button } from '../ui/Button';
import { FloatingElements } from './FloatingElements';

interface LandingHeroProps {
  onStart: () => void;
  onExploreTemplates: () => void;
}

export function LandingHero({ onStart, onExploreTemplates }: LandingHeroProps) {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '80px 24px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <FloatingElements />

      {/* Brand pill */}
      <motion.div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          borderRadius: '999px',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          fontSize: '0.875rem',
          color: 'var(--text)',
          marginBottom: '32px',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Sparkles size={14} color="var(--accent)" />
        <span>Korean Photo Booth Experience</span>
      </motion.div>

      {/* Main title */}
      <motion.h1
        style={{
          fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.04em',
          margin: '0 auto 24px',
          maxWidth: '750px',
          fontFamily: 'var(--font-display)',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <span style={{ color: 'var(--text-h)' }}>Every Memory</span>
        <br />
        <span
          style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Deserves to Shine
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          lineHeight: 1.7,
          color: 'var(--text)',
          maxWidth: '520px',
          margin: '0 auto 40px',
          fontWeight: 400,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        Don't wait for the special moment to come.{' '}
        <span style={{ fontWeight: 500, color: 'var(--text-h)' }}>
          Make every moment special
        </span>{' '}
        with LumiStrip.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        style={{
          width: 'min(100%, 420px)',
          margin: '0 auto 20px',
          borderRadius: '28px',
          overflow: 'hidden',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          boxShadow: '0 20px 60px rgba(34, 29, 40, 0.18)',
          backdropFilter: 'var(--glass-blur)',
          position: 'relative',
          zIndex: 1,
          cursor: 'pointer',
        }}
        whileHover={{ y: -6, rotate: -1, scale: 1.015 }}
      >
        <img
          src={heroImage}
          alt="LumiStrip photo strip preview"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <Button
          variant="primary"
          size="lg"
          icon={<Camera size={20} />}
          iconPosition="left"
          onClick={onStart}
        >
          Start Session
        </Button>
        <Button
          variant="secondary"
          size="lg"
          icon={<ArrowRight size={20} />}
          iconPosition="right"
          onClick={onExploreTemplates}
        >
          Explore Templates
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        style={{
          marginTop: 20,
          fontSize: '0.8rem',
          color: 'var(--text)',
          opacity: 0.7,
        }}
      >
        Free · No sign-up · Your photos never leave your device
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text)',
          fontSize: '0.75rem',
          opacity: 0.5,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5, y: [0, 8, 0] }}
        transition={{ delay: 1.5, y: { repeat: Infinity, duration: 2 } }}
      >
        <span>Scroll</span>
        <div
          style={{
            width: 1,
            height: 24,
            background: 'var(--text)',
            borderRadius: 1,
          }}
        />
      </motion.div>
    </section>
  );
}

