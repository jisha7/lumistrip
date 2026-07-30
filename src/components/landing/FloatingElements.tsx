/* ============================================
   LumiStrip — Floating Background Elements
   Stars, sparkles, and decorative orbs
   that create a dreamy atmosphere
   ============================================ */

import { motion } from 'framer-motion';

const stars = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 5,
  duration: Math.random() * 3 + 3,
  opacity: Math.random() * 0.4 + 0.1,
}));

const sparkles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: Math.random() * 12 + 6,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 8,
  duration: Math.random() * 4 + 4,
}));

const clouds = [
  { id: 0, top: '12%', width: 140, duration: 55, delay: 0, opacity: 0.5 },
  { id: 1, top: '28%', width: 100, duration: 70, delay: -20, opacity: 0.35 },
  { id: 2, top: '6%', width: 80, duration: 45, delay: -10, opacity: 0.4 },
];

function CloudShape({ width, opacity }: { width: number; opacity: number }) {
  return (
    <svg width={width} height={width * 0.5} viewBox="0 0 100 50" style={{ opacity }}>
      <ellipse cx="30" cy="32" rx="26" ry="16" fill="var(--ink)" />
      <ellipse cx="55" cy="24" rx="22" ry="20" fill="var(--ink)" />
      <ellipse cx="76" cy="34" rx="18" ry="13" fill="var(--ink)" />
    </svg>
  );
}

export function FloatingElements() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Moon — slowly rotates, the signature landing motif */}
      <motion.div
        style={{
          position: 'absolute',
          top: '8%',
          right: '8%',
          width: 96,
          height: 96,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 100 100" width="96" height="96">
          <defs>
            <radialGradient id="moonGlow" cx="35%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#FDF3D8" />
              <stop offset="100%" stopColor="var(--flash-gold)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="42" fill="url(#moonGlow)" opacity="0.9" />
          <circle cx="34" cy="38" r="6" fill="rgba(34,29,40,0.08)" />
          <circle cx="60" cy="60" r="9" fill="rgba(34,29,40,0.07)" />
          <circle cx="66" cy="34" r="4" fill="rgba(34,29,40,0.06)" />
        </svg>
      </motion.div>
      <div
        style={{
          position: 'absolute',
          top: '6%',
          right: '6%',
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: 'var(--flash-gold)',
          opacity: 0.15,
          filter: 'blur(40px)',
        }}
      />

      {/* Drifting clouds */}
      {clouds.map((cloud) => (
        <motion.div
          key={`cloud-${cloud.id}`}
          style={{ position: 'absolute', top: cloud.top, left: '-160px' }}
          animate={{ x: ['0vw', '130vw'] }}
          transition={{ duration: cloud.duration, delay: cloud.delay, repeat: Infinity, ease: 'linear' }}
        >
          <CloudShape width={cloud.width} opacity={cloud.opacity} />
        </motion.div>
      ))}

      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            background: 'var(--accent)',
            opacity: star.opacity,
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 2.5, star.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Sparkle emojis */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={`sparkle-${sparkle.id}`}
          style={{
            position: 'absolute',
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            fontSize: sparkle.size,
            lineHeight: 1,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ✦
        </motion.div>
      ))}

      {/* Decorative gradient orbs */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'var(--gradient-primary)',
          opacity: 0.06,
          filter: 'blur(60px)',
        }}
        className="animate-float"
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'var(--gradient-warm)',
          opacity: 0.06,
          filter: 'blur(60px)',
        }}
        className="animate-float-slow"
      />
    </div>
  );
}

