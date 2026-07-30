/* ============================================
   LumiStrip — How It Works Section
   3-step visual guide
   ============================================ */

import { motion } from 'framer-motion';
import { Camera, Wand2, Download } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const steps = [
  {
    number: '01',
    icon: <Camera size={32} />,
    title: 'Capture',
    description: 'Take 4 automatic photos with our fun countdown and flash effects',
    gradient: 'var(--gradient-primary)',
  },
  {
    number: '02',
    icon: <Wand2 size={32} />,
    title: 'Decorate',
    description: 'Add filters, stickers, text, and captions to make it uniquely yours',
    gradient: 'var(--gradient-secondary)',
  },
  {
    number: '03',
    icon: <Download size={32} />,
    title: 'Share',
    description: 'Download in HD quality and share your photo strip with the world',
    gradient: 'var(--gradient-warm)',
  },
];

export function HowItWorks() {
  return (
    <section
      style={{
        padding: '80px 24px 120px',
        maxWidth: '900px',
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
          How It Works
        </h2>
        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text)',
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          Three simple steps to your perfect photo strip
        </p>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
        }}
      >
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
          >
            <GlassCard
              padding="32px"
              hover
              glow
              style={{ textAlign: 'center', position: 'relative' }}
            >
              {/* Step number badge */}
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '4px 16px',
                  borderRadius: '999px',
                  background: step.gradient,
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
              >
                Step {step.number}
              </div>

              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: step.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  margin: '16px auto 20px',
                }}
              >
                {step.icon}
              </div>

              <h3
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: 'var(--text-h)',
                  margin: '0 0 10px',
                }}
              >
                {step.title}
              </h3>

              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {step.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

