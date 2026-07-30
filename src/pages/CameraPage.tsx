/* ============================================
   LumiStrip — Camera Permission & Preview Page
   Handles camera setup before capture
   ============================================ */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import { usePhotoBooth } from '../context/PhotoBoothContext';
import { useCamera } from '../hooks/useCamera';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

export function CameraPage() {
  const { setPage, showToast } = usePhotoBooth();
  const { stream, error, loading, hasPermission, devices, startCamera, switchCamera } = useCamera();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      startCamera();
      setInitialized(true);
    }
  }, [initialized, startCamera]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        gap: '32px',
      }}
    >
      <motion.div
        style={{ textAlign: 'center' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            fontWeight: 700,
            color: 'var(--text-h)',
            margin: '0 0 12px',
            fontFamily: 'var(--font-display)',
          }}
        >
          Camera Setup
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text)', maxWidth: '400px', margin: '0 auto' }}>
          We need camera access to capture your beautiful moments
        </p>
      </motion.div>

      {/* Camera preview area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <GlassCard padding="8px" hover={false}>
          {loading && (
            <div
              style={{
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                color: 'var(--text)',
              }}
            >
              <motion.div
                style={{
                  width: 48,
                  height: 48,
                  border: '3px solid var(--border)',
                  borderTopColor: 'var(--accent)',
                  borderRadius: '50%',
                }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <span>Accessing camera...</span>
            </div>
          )}

          {error && !loading && (
            <div
              style={{
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <AlertCircle size={48} color="#EF4444" />
              <p style={{ color: 'var(--text-h)', fontWeight: 500, fontSize: '1.1rem' }}>
                Camera Access Needed
              </p>
              <p style={{ color: 'var(--text)', fontSize: '0.9rem', maxWidth: '320px' }}>
                {error}
              </p>
              <Button variant="primary" size="md" onClick={() => startCamera()} icon={<RefreshCw size={16} />}>
                Try Again
              </Button>
            </div>
          )}

          {stream && !loading && (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <video
                autoPlay
                playsInline
                muted
                ref={(el) => {
                  if (el && stream) {
                    el.srcObject = stream;
                    el.play();
                  }
                }}
                style={{
                  width: '100%',
                  display: 'block',
                  transform: 'scaleX(-1)',
                  borderRadius: 'var(--radius-lg)',
                }}
              />
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Actions */}
      <motion.div
        style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {devices.length > 1 && (
          <Button variant="secondary" size="md" icon={<RefreshCw size={16} />} onClick={switchCamera}>
            Switch Camera
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          icon={<ArrowRight size={20} />}
          iconPosition="right"
          disabled={!hasPermission}
          onClick={() => {
            if (hasPermission) {
              setPage('capture');
            } else {
              showToast('Please allow camera access first', 'warning');
            }
          }}
        >
          Start Photo Session
        </Button>
      </motion.div>

      {/* Tips */}
      <motion.div
        style={{
          maxWidth: '400px',
          textAlign: 'center',
          color: 'var(--text)',
          fontSize: '0.85rem',
          lineHeight: 1.7,
          opacity: 0.7,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.6 }}
      >
        4 photos will be taken automatically with a fun countdown.
        <br />
        Find good lighting and smile! ✨
      </motion.div>
    </div>
  );
}
