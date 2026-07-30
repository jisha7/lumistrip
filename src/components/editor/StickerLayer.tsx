/* ============================================
   LumiStrip — Sticker & Text Overlay Layer
   Drag to move, corner handle to resize+rotate,
   double-tap text to edit inline, trash to delete.
   ============================================ */

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Trash2 } from 'lucide-react';
import { usePhotoBooth } from '../../context/PhotoBoothContext';
import type { Sticker } from '../../types';

interface StickerLayerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  selected: string | null;
  setSelected: (id: string | null) => void;
  stickerLibrary: Sticker[];
}

export function StickerLayer({ containerRef, selected, setSelected, stickerLibrary }: StickerLayerProps) {
  const { state, updateSticker, removeSticker, updateText, removeText } = usePhotoBooth();
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const bringToFront = (kind: 'sticker' | 'text', id: string) => {
    const maxZ = Math.max(
      0,
      ...state.editor.stickers.map((s) => s.zIndex),
      ...state.editor.texts.map((t) => t.zIndex)
    );
    if (kind === 'sticker') updateSticker(id, { zIndex: maxZ + 1 });
    else updateText(id, { zIndex: maxZ + 1 });
  };

  return (
    <div
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      onPointerDown={(e) => {
        // Clicking empty canvas deselects
        if (e.target === e.currentTarget) setSelected(null);
      }}
    >
      {state.editor.stickers.map((s) => {
        const sticker = stickerLibrary.find((st) => st.id === s.stickerId);
        if (!sticker) return null;
        return (
          <DraggableItem
            key={s.id}
            containerRef={containerRef}
            x={s.x}
            y={s.y}
            scale={s.scale}
            rotation={s.rotation}
            zIndex={s.zIndex}
            isSelected={selected === s.id}
            onSelect={() => {
              setSelected(s.id);
              bringToFront('sticker', s.id);
            }}
            onMove={(x, y) => updateSticker(s.id, { x, y })}
            onTransform={(scale, rotation) => updateSticker(s.id, { scale, rotation })}
            onDelete={() => {
              removeSticker(s.id);
              setSelected(null);
            }}
          >
            {sticker.imageUrl ? (
              <img
                src={sticker.imageUrl}
                alt={sticker.name}
                draggable={false}
                style={{ width: sticker.size, height: sticker.size, objectFit: 'contain', userSelect: 'none', pointerEvents: 'none' }}
              />
            ) : (
              <span style={{ fontSize: sticker.size, lineHeight: 1, userSelect: 'none' }}>{sticker.emoji}</span>
            )}
          </DraggableItem>
        );
      })}

      {state.editor.texts.map((t) => (
        <DraggableItem
          key={t.id}
          containerRef={containerRef}
          x={t.x}
          y={t.y}
          scale={1}
          rotation={t.rotation}
          zIndex={t.zIndex}
          isSelected={selected === t.id}
          onSelect={() => {
            setSelected(t.id);
            bringToFront('text', t.id);
          }}
          onMove={(x, y) => updateText(t.id, { x, y })}
          onTransform={(_scale, rotation) => updateText(t.id, { rotation })}
          onDelete={() => {
            removeText(t.id);
            setSelected(null);
          }}
          onDoubleClick={() => setEditingTextId(t.id)}
        >
          {editingTextId === t.id ? (
            <input
              autoFocus
              value={t.content}
              onChange={(e) => updateText(t.id, { content: e.target.value })}
              onBlur={() => setEditingTextId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditingTextId(null);
              }}
              style={{
                fontFamily: t.font,
                fontSize: t.fontSize,
                color: t.color,
                background: 'rgba(255,255,255,0.85)',
                border: '1px dashed var(--flash-gold)',
                borderRadius: 6,
                padding: '2px 6px',
                outline: 'none',
                minWidth: 40,
              }}
            />
          ) : (
            <span
              style={{
                fontFamily: t.font,
                fontSize: t.fontSize,
                color: t.color,
                fontWeight: t.bold ? 700 : 400,
                letterSpacing: t.letterSpacing ? `${t.letterSpacing}px` : 'normal',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                WebkitTextStroke: t.outline ? '5px #FFFFFF' : undefined,
                paintOrder: t.outline ? 'stroke fill' : undefined,
                textShadow: t.outline ? 'none' : '0 1px 3px rgba(0,0,0,0.12)',
              }}
            >
              {t.content}
            </span>
          )}
        </DraggableItem>
      ))}
    </div>
  );
}

/* ── Shared draggable/resizable/rotatable wrapper ── */
interface DraggableItemProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onTransform: (scale: number, rotation: number) => void;
  onDelete: () => void;
  onDoubleClick?: () => void;
  children: React.ReactNode;
}

function DraggableItem({
  containerRef,
  x,
  y,
  scale,
  rotation,
  zIndex,
  isSelected,
  onSelect,
  onMove,
  onTransform,
  onDelete,
  onDoubleClick,
  children,
}: DraggableItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startScale: number; startRotation: number; centerX: number; centerY: number } | null>(
    null
  );

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const container = containerRef.current;
    const item = itemRef.current;
    if (!container || !item) return;
    const rect = item.getBoundingClientRect();
    dragState.current = {
      startScale: scale,
      startRotation: rotation,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      if (!dragState.current) return;
      const { centerX, centerY } = dragState.current;
      const dx = ev.clientX - centerX;
      const dy = ev.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 45;
      const newScale = Math.max(0.3, Math.min(2.5, dist / 45));
      onTransform(newScale, angle);
    };
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <motion.div
      ref={itemRef}
      drag
      dragConstraints={containerRef}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_e, info) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const newX = Math.max(0, Math.min(100, ((info.point.x - rect.left) / rect.width) * 100));
        const newY = Math.max(0, Math.min(100, ((info.point.y - rect.top) / rect.height) * 100));
        onMove(newX, newY);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={onDoubleClick}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        zIndex,
        pointerEvents: 'auto',
        cursor: 'grab',
        touchAction: 'none',
      }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <div
        style={{
          position: 'relative',
          padding: 6,
          outline: isSelected ? '2px dashed var(--flash-gold)' : 'none',
          borderRadius: 8,
        }}
      >
        {children}

        {isSelected && (
          <>
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{
                position: 'absolute',
                top: -14,
                right: -14,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--booth-black)',
                color: '#fff',
                border: '2px solid var(--paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Delete"
            >
              <Trash2 size={12} />
            </button>
            <div
              onPointerDown={handleResizeStart}
              style={{
                position: 'absolute',
                bottom: -14,
                right: -14,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--flash-gold)',
                color: 'var(--ink)',
                border: '2px solid var(--paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grab',
              }}
              aria-label="Resize and rotate"
            >
              <RotateCw size={12} />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
