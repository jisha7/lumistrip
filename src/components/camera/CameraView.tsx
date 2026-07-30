/* ============================================
   LumiStrip — Camera View
   Webcam preview with frame overlay
   ============================================ */

import { useRef, useEffect, useCallback } from 'react';

interface CameraViewProps {
  stream: MediaStream | null;
  mirrored?: boolean;
  aspectRatio?: number;
  onReady?: () => void;
}

export function CameraView({ stream, mirrored = true, aspectRatio = 3 / 4, onReady }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().then(() => {
        onReady?.();
      });
    }
  }, [stream, onReady]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    // Reset transform
    if (mirrored) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [mirrored]);

  // Expose captureFrame via ref-like pattern
  (CameraView as any)._captureFrame = captureFrame;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        aspectRatio: `${aspectRatio}`,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background: '#000',
        boxShadow: 'var(--shadow-xl)',
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: mirrored ? 'scaleX(-1)' : 'none',
        }}
      />

      {/* Corner frame overlay */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="0.5"
          rx="4"
        />
        {/* Corner accents */}
        <path d="M8 8 L20 8 M8 8 L8 20" stroke="#fff" strokeWidth="2" fill="none" />
        <path d="M92 8 L80 8 M92 8 L92 20" stroke="#fff" strokeWidth="2" fill="none" />
        <path d="M8 92 L20 92 M8 92 L8 80" stroke="#fff" strokeWidth="2" fill="none" />
        <path d="M92 92 L80 92 M92 92 L92 80" stroke="#fff" strokeWidth="2" fill="none" />
      </svg>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

// Store capture function on component for external access
let _captureInstance: (() => string | null) | null = null;
CameraView._captureFrame = null as unknown as (() => string | null);
Object.defineProperty(CameraView, 'captureFrame', {
  get: () => _captureInstance,
  set: (fn: (() => string | null) | null) => { _captureInstance = fn; },
});
