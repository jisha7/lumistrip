/* ============================================
   LumiStrip — Capture Page
   Real booth flow: 5-4-3-2-1 countdown (with tick
   sound) → flash + shutter → pose review → repeat
   → printing animation → editor
   ============================================ */

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, Sparkles } from 'lucide-react';
import { usePhotoBooth } from '../context/PhotoBoothContext';
import { useCamera } from '../hooks/useCamera';
import { Button } from '../components/ui/Button';
import { playCountdownTick, playShutter, playPrintChime } from '../utils/sound';
import type { CapturedPhoto } from '../types';

const TOTAL_SHOTS = 4;
const COUNTDOWN_SECONDS = 5;
const POSE_REVIEW_MS = 1100;
const PRINTING_MS = 1800;

type Phase = 'ready' | 'countdown' | 'flash' | 'reviewing' | 'printing';

export function CapturePage() {
  const { addPhoto, setPage } = usePhotoBooth();
  const { stream, error, loading, hasPermission, startCamera } = useCamera();
  const [phase, setPhase] = useState<Phase>('ready');
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [shots, setShots] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const capturedShots = shots.length;

  const after = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  // Attach the live MediaStream to the <video> element. Without this the
  // video tag stays black and every canvas capture produces a blank frame.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    setVideoReady(false);
    video.srcObject = stream;

    const handleLoaded = () => {
      video.play().catch(() => {});
      setVideoReady(true);
    };
    video.addEventListener('loadedmetadata', handleLoaded);
    return () => video.removeEventListener('loadedmetadata', handleLoaded);
  }, [stream]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Mirror the capture
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.92);
  }, []);

  const runShot = useCallback(
    (shotIndex: number) => {
      // ── Countdown phase: a real 5-4-3-2-1 so the person can pose ──
      setPhase('countdown');
      let remaining = COUNTDOWN_SECONDS;
      setCountdownValue(remaining);
      playCountdownTick(remaining);

      const tick = () => {
        remaining -= 1;
        if (remaining > 0) {
          setCountdownValue(remaining);
          playCountdownTick(remaining);
          after(1000, tick);
        } else {
          setCountdownValue(null);
          setPhase('flash');
          playShutter();
          after(180, () => {
            const dataUrl = captureFrame();
            if (dataUrl) {
              const photo: CapturedPhoto = {
                id: `photo-${Date.now()}-${shotIndex}`,
                dataUrl,
                timestamp: Date.now(),
                index: shotIndex,
                width: canvasRef.current?.width || 640,
                height: canvasRef.current?.height || 480,
              };
              addPhoto(photo);
              setShots((prev) => [...prev, dataUrl]);
            }
            setPhase('reviewing');
            after(POSE_REVIEW_MS, () => {
              const next = shotIndex + 1;
              if (next >= TOTAL_SHOTS) {
                setPhase('printing');
                playPrintChime();
                after(PRINTING_MS, () => setPage('editor'));
              } else {
                runShot(next);
              }
            });
          });
        }
      };
      after(1000, tick);
    },
    [addPhoto, captureFrame, setPage, after]
  );

  const startCaptureSession = useCallback(() => {
    if (!videoReady) return;
    setShots([]);
    runShot(0);
  }, [videoReady, runShot]);

  useEffect(() => {
    if (!initialized) {
      startCamera();
      setInitialized(true);
    }
  }, [initialized, startCamera]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const statusText: Record<Phase, { title: string; sub: string }> = {
    ready: { title: 'Ready when you are', sub: `${TOTAL_SHOTS} shots · ${COUNTDOWN_SECONDS}s to pose each time` },
    countdown: { title: 'Strike a pose!', sub: `Shot ${capturedShots + 1} of ${TOTAL_SHOTS}` },
    flash: { title: 'Say cheese!', sub: `Shot ${capturedShots} of ${TOTAL_SHOTS}` },
    reviewing: { title: 'Nice one! ✨', sub: `Shot ${capturedShots} of ${TOTAL_SHOTS} captured` },
    printing: { title: 'Printing your strip…', sub: 'Almost there' },
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px 40px',
        gap: '20px',
        background: 'radial-gradient(circle at 50% 20%, #26212e 0%, var(--booth-black) 65%)',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          style={{ textAlign: 'center' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
              fontWeight: 700,
              color: '#FBF6EE',
              margin: '0 0 6px',
              fontFamily: 'var(--font-display)',
            }}
          >
            {statusText[phase].title}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(251,246,238,0.65)' }}>{statusText[phase].sub}</p>
        </motion.div>
      </AnimatePresence>

      {/* Camera preview — the booth screen */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '360px',
          aspectRatio: '3/4',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: '#000',
          boxShadow: '0 0 0 6px rgba(251,246,238,0.06), 0 30px 70px rgba(0,0,0,0.55)',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 0.4s ease',
            filter: phase === 'reviewing' || phase === 'printing' ? 'brightness(0.5)' : 'none',
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {!videoReady && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: '#fff',
              textAlign: 'center',
              padding: '0 24px',
            }}
          >
            {error ? (
              <>
                <p style={{ color: '#fff', fontWeight: 600 }}>{error}</p>
                <Button variant="glass" size="sm" onClick={() => startCamera()}>
                  Try again
                </Button>
              </>
            ) : (
              <>
                <motion.div
                  style={{
                    width: 36,
                    height: 36,
                    border: '3px solid rgba(255,255,255,0.25)',
                    borderTopColor: 'var(--flash-gold)',
                    borderRadius: '50%',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                />
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
                  {loading || !hasPermission ? 'Waking up the camera…' : 'Getting ready…'}
                </p>
              </>
            )}
          </div>
        )}

        {/* Dramatic countdown number */}
        <AnimatePresence>
          {countdownValue !== null && (
            <motion.div
              key={countdownValue}
              initial={{ opacity: 0, scale: 2.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '7rem',
                  fontWeight: 700,
                  color: '#FBF6EE',
                  textShadow: '0 0 40px rgba(240,185,78,0.7), 0 4px 24px rgba(0,0,0,0.5)',
                }}
              >
                {countdownValue}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviewing check mark */}
        {phase === 'reviewing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--flash-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(240,185,78,0.6)',
              }}
            >
              <Check size={30} color="var(--ink)" />
            </div>
          </motion.div>
        )}

        {/* Printing shimmer */}
        {phase === 'printing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              zIndex: 5,
            }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}>
              <Sparkles size={28} color="var(--flash-gold)" />
            </motion.div>
          </motion.div>
        )}

        {/* Shot counter overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 4,
          }}
        >
          {Array.from({ length: TOTAL_SHOTS }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: i < capturedShots ? 'var(--flash-gold)' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                boxShadow: i < capturedShots ? '0 0 8px rgba(240,185,78,0.6)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Flash overlay */}
        {phase === 'flash' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#fff',
              zIndex: 10,
              animation: 'flash-overlay 0.3s ease-out forwards',
            }}
          />
        )}
      </div>

      {/* Mini filmstrip of shots taken so far */}
      {shots.length > 0 && (
        <div style={{ display: 'flex', gap: 8 }}>
          {shots.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 260 }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                overflow: 'hidden',
                border: '2px solid rgba(251,246,238,0.2)',
              }}
            >
              <img src={src} alt={`Shot ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Controls */}
      {phase === 'ready' && (
        <motion.div
          style={{ display: 'flex', gap: '12px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="primary"
            size="lg"
            icon={<Camera size={20} />}
            onClick={startCaptureSession}
            disabled={!videoReady}
          >
            {videoReady ? 'Start Capture' : 'Waiting for camera…'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
