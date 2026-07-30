/* ============================================
   LumiStrip — Feature Showcase Section
   Highlights key features with icons
   ============================================ */

import { motion } from 'framer-motion';
import { Camera, Sparkles, Sticker, ImageDown, Share2, Music } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const features = [
  {
    icon: <Camera size={28} />,
    title: '4-Shot Capture',
    description: 'Automatic photo booth style with 3-2-1 countdown and flash',
    gradient: 'var(--gradient-primary)',
  },
  {
    icon: <Sparkles size={28} />,
    title: 'Korean Filters',
    description: 'Vintage, pastel, dreamy — aesthetic filters inspired by Korean photo booths',
    gradient: 'var(--gradient-secondary)',
  },
  {
    icon: <Sticker size={28} />,
    title: 'Cute Stickers',
    description: 'Drag & drop hearts, flowers, stars, and Korean-inspired decorations',
    gradient: 'var(--gradient-warm)',
  },
  {
    icon: <ImageDown size={28} />,
    title: 'HD Export',
    description: 'Download premium quality PNG strips ready to share on social media',
    gradient: 'var(--gradient-cool)',
  },
  {
    icon: <Share2 size={28} />,
    title: 'One-Tap Share',
    description: 'Share your creations instantly with friends and family',
    gradient: 'var(--gradient-magic)',
  },
  {
    icon: <Music size={28} />,
    title: 'Magical Vibes',
    description: 'Lo-fi music, sparkle particles, and cozy Korean aesthetic atmosphere',
    gradient: 'var(--gradient-ocean)',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function FeatureShowcase() {
  return (
    <section
      style={{
        padding: '80px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      <motion.div
        style={{ textAlign: 'center', marginBottom: '48px' }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <h2
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: 'var(--text-h)',
            margin: '0 0 12px',
            fontFamily: 'var(--font-display)',
          }}
        >
          Everything You Need
        </h2>
        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text)',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          Create stunning photo strips with our curated tools and effects
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {features.map((feature) => (
          <motion.div key={feature.title} variants={itemVariants}>
            <GlassCard padding="28px" hover glow>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-lg)',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    color: 'var(--text-h)',
                    margin: 0,
                  }}
                >
                  {feature.title}
                </h3>
              </div>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

