/* ============================================
   LumiStrip — Photo Strip Component
   Renders the composite Korean-style photo strip
   with layout, borders, date stamp, and decorations.
   Also supports "custom frame" mode: an imported
   frame image with the captured photos composited
   into its marked photo window.
   ============================================ */

import { useMemo } from 'react';
import { TEMPLATES } from '../../constants/templates';
import { FILTERS } from '../../constants/filters';
import { DEFAULT_PHOTO_AREA } from '../../hooks/useCustomAssets';
import type { CapturedPhoto, EditorState, Template } from '../../types';

interface PhotoStripProps {
  photos: CapturedPhoto[];
  editor: EditorState;
  template?: Template | null;
}

export function PhotoStrip({ photos, editor, template }: PhotoStripProps) {
  const activeTemplate = useMemo(() => {
    if (template) return template;
    return TEMPLATES.find((t) => t.id === editor.templateId) || TEMPLATES[0];
  }, [template, editor.templateId]);

  const stripStyle = activeTemplate.stripStyle;
  const decorations = activeTemplate.decorations;

  const imageFilterCss = useMemo(() => {
    const preset = FILTERS.find((f) => f.id === editor.filter)?.css || '';
    const adjustments = `brightness(${editor.brightness}%) contrast(${editor.contrast}%) saturate(${editor.saturation}%)`;
    return [preset, adjustments].filter(Boolean).join(' ');
  }, [editor.filter, editor.brightness, editor.contrast, editor.saturation]);

  function formatDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  function renderFilmBorder() {
    if (!decorations.showFilmBorder) return null;
    const holes = [0, 1, 2, 3, 4, 5];
    const holeStyle = { width: 8, height: 6, borderRadius: '50%' as const, background: 'rgba(0,0,0,0.06)' };
    return (
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          right: 8,
          bottom: 8,
          border: '2px solid rgba(0,0,0,0.08)',
          borderRadius: `${stripStyle.borderRadius - 4}px`,
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'absolute', top: -2, left: 20, display: 'flex', gap: 20 }}>
          {holes.map((i) => (<div key={`th-${i}`} style={holeStyle} />))}
        </div>
        <div style={{ position: 'absolute', bottom: -2, left: 20, display: 'flex', gap: 20 }}>
          {holes.map((i) => (<div key={`bh-${i}`} style={holeStyle} />))}
        </div>
      </div>
    );
  }

  function renderTexture() {
    if (stripStyle.texture === 'vintage') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
            opacity: 0.3,
            mixBlendMode: 'multiply',
          }}
        />
      );
    }
    if (stripStyle.texture === 'paper') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.01) 2px, rgba(0,0,0,0.01) 4px)',
            opacity: 0.2,
          }}
        />
      );
    }
    return null;
  }

  function renderExtraBottomSpace(bg: string, textColor: string) {
    if (!editor.extraBottomSpace) return null;
    return (
      <div
        style={{
          height: editor.extraBottomSpace,
          background: bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        {decorations.showDateStamp && editor.showDateStamp && (
          <span style={{ fontSize: '0.65rem', color: textColor, opacity: 0.6, fontFamily: activeTemplate.fonts.display }}>
            {formatDate()}
          </span>
        )}
        {editor.caption && (
          <span style={{ fontSize: '0.85rem', color: textColor, fontStyle: 'italic', fontFamily: activeTemplate.fonts.display }}>
            {editor.caption}
          </span>
        )}
      </div>
    );
  }

  if (!photos.length) {
    return (
      <div
        style={{
          width: 'var(--strip-width)',
          padding: 'var(--strip-padding)',
          background: stripStyle.backgroundColor,
          borderRadius: stripStyle.borderRadius,
          boxShadow: `0 8px 32px ${stripStyle.shadowColor}`,
          border: stripStyle.borderColor ? `${stripStyle.borderWidth || 1}px solid ${stripStyle.borderColor}` : 'none',
          textAlign: 'center',
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <p>No photos yet</p>
      </div>
    );
  }

  /* ── Custom frame mode: imported frame image + photos composited into its marked window ── */
  if (editor.customFrameUrl) {
    const area = editor.customFramePhotoArea || DEFAULT_PHOTO_AREA;
    return (
      <div id="lumistrip-photo-strip" style={{ width: 'var(--strip-width)' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <img src={editor.customFrameUrl} alt="Frame" style={{ width: '100%', height: 'auto', display: 'block' }} />
          <div
            style={{
              position: 'absolute',
              left: `${area.x}%`,
              top: `${area.y}%`,
              width: `${area.width}%`,
              height: `${area.height}%`,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              overflow: 'hidden',
              borderRadius: 3,
            }}
          >
            {photos.map((photo, index) => (
              <div key={photo.id} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <img
                  src={photo.dataUrl}
                  alt={`Photo ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: imageFilterCss }}
                />
              </div>
            ))}
          </div>
        </div>
        {renderExtraBottomSpace('var(--paper)', 'var(--ink)')}
      </div>
    );
  }

  return (
    <div
      id="lumistrip-photo-strip"
      style={{
        width: 'var(--strip-width)',
        background: stripStyle.backgroundColor,
        borderRadius: `${stripStyle.borderRadius}px`,
        boxShadow: `0 8px 32px ${stripStyle.shadowColor}`,
        border: stripStyle.borderColor ? `${stripStyle.borderWidth || 1}px solid ${stripStyle.borderColor}` : 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: `${stripStyle.padding}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${stripStyle.gap}px`,
          position: 'relative',
        }}
      >
        {renderFilmBorder()}

        {photos.map((photo, index) => (
          <div
            key={photo.id}
            style={{
              position: 'relative',
              borderRadius: '4px',
              overflow: 'hidden',
              aspectRatio: '4/3',
              background: '#f0f0f0',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <img
              src={photo.dataUrl}
              alt={`Photo ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: imageFilterCss,
              }}
            />
            {decorations.showVignette && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        ))}

        {decorations.showDateStamp && editor.showDateStamp && (
          <div
            style={{
              textAlign: 'center',
              fontFamily: activeTemplate.fonts.display,
              fontSize: '0.7rem',
              fontWeight: 500,
              color: activeTemplate.colors.primary,
              letterSpacing: '0.1em',
              padding: '4px 0 0',
              opacity: 0.7,
            }}
          >
            {formatDate()}
          </div>
        )}

        {decorations.showCaption && editor.caption && (
          <div
            style={{
              textAlign: 'center',
              fontFamily: activeTemplate.fonts.display,
              fontSize: '0.85rem',
              fontWeight: 500,
              color: activeTemplate.colors.primary,
              padding: '2px 0',
              fontStyle: 'italic',
            }}
          >
            {editor.caption}
          </div>
        )}

        {renderTexture()}
      </div>

      {renderExtraBottomSpace(stripStyle.backgroundColor.includes('gradient') ? 'var(--paper)' : stripStyle.backgroundColor, activeTemplate.colors.primary)}
    </div>
  );
}
