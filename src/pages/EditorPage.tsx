/* ============================================
   LumiStrip — Editor Page
   A real booth-editor feel: dark kiosk shell,
   full sticker/text tools, custom sticker import
   (with background removal choice), custom frame
   import with photo-window placement, and a
   working export (download + share).
   ============================================ */

import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Download,
  Share2,
  Sticker as StickerIcon,
  Type as TypeIcon,
  SlidersHorizontal,
  LayoutTemplate,
  Wand2,
  Plus,
  Loader2,
  Upload,
  Bold,
  PenLine,
  Trash2,
  X,
  Move,
} from 'lucide-react';
import { usePhotoBooth } from '../context/PhotoBoothContext';
import { PhotoStrip } from '../components/strip/PhotoStrip';
import { StickerLayer } from '../components/editor/StickerLayer';
import { Button } from '../components/ui/Button';
import { STICKERS, STICKER_CATEGORIES } from '../constants/stickers';
import { FILTERS } from '../constants/filters';
import { TEMPLATES } from '../constants/templates';
import { GOOGLE_FONTS } from '../constants/fonts';
import { renderStripToPng, downloadDataUrl, shareDataUrl } from '../utils/exportStrip';
import { useCustomAssets, DEFAULT_PHOTO_AREA, type PreparedSticker } from '../hooks/useCustomAssets';
import type { StickerCategory } from '../types';

type Tab = 'filters' | 'adjust' | 'stickers' | 'text' | 'frame';

const TABS: { id: Tab; label: string; icon: typeof StickerIcon }[] = [
  { id: 'filters', label: 'Filters', icon: Wand2 },
  { id: 'adjust', label: 'Adjust', icon: SlidersHorizontal },
  { id: 'stickers', label: 'Stickers', icon: StickerIcon },
  { id: 'text', label: 'Text', icon: TypeIcon },
  { id: 'frame', label: 'Frame', icon: LayoutTemplate },
];

const STRIP_WIDTHS = { small: '280px', medium: '360px', large: '440px' };

const TEXT_COLORS = ['#221D28', '#FFFFFF', '#E8A6A3', '#C9BFE8', '#F0B94E', '#A9C2A0'];

const QUICK_CAPTIONS = ['best day ever', '오늘 하루도 화이팅', 'besties forever', '♡ memories ♡', 'just us', 'good times'];

export function EditorPage() {
  const {
    state,
    setPage,
    addSticker,
    addText,
    setFilter,
    setCaption,
    toggleDateStamp,
    setStripSize,
    dispatch,
    showToast,
  } = usePhotoBooth();

  const {
    customStickers,
    prepareSticker,
    confirmSticker,
    removeCustomSticker,
    customFrames,
    importFrame,
    updateFramePhotoArea,
    removeCustomFrame,
  } = useCustomAssets();

  const [activeTab, setActiveTab] = useState<Tab>('stickers');
  const [stickerCategory, setStickerCategory] = useState<StickerCategory | 'all'>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'download' | 'share' | null>(null);
  const [preparingSticker, setPreparingSticker] = useState(false);
  const [pendingSticker, setPendingSticker] = useState<PreparedSticker | null>(null);
  const [uploadingFrame, setUploadingFrame] = useState(false);
  const [activeFrameId, setActiveFrameId] = useState<string | null>(null);

  const exportNodeRef = useRef<HTMLDivElement>(null);
  const stickerFileInputRef = useRef<HTMLInputElement>(null);
  const frameFileInputRef = useRef<HTMLInputElement>(null);

  const stickerLibrary = useMemo(() => [...STICKERS, ...customStickers], [customStickers]);

  const filteredStickers = useMemo(() => {
    if (stickerCategory === 'all') return stickerLibrary;
    if (stickerCategory === 'custom') return customStickers;
    return STICKERS.filter((s) => s.category === stickerCategory);
  }, [stickerCategory, stickerLibrary, customStickers]);

  const editor = state.editor;
  const selectedSticker = editor.stickers.find((s) => s.id === selected) || null;
  const selectedTextItem = editor.texts.find((t) => t.id === selected) || null;
  const activeFrame = customFrames.find((f) => f.id === activeFrameId) || null;

  function nextZ() {
    return Math.max(0, ...editor.stickers.map((s) => s.zIndex), ...editor.texts.map((t) => t.zIndex)) + 1;
  }

  function handleAddSticker(stickerId: string) {
    const id = `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    addSticker({ id, stickerId, x: 50, y: 50, scale: 1, rotation: 0, zIndex: nextZ() });
    setSelected(id);
  }

  function handleAddText(content = 'tap to edit') {
    const id = `text-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    addText({
      id,
      content,
      font: 'Gaegu',
      fontSize: 22,
      color: '#221D28',
      x: 50,
      y: 50,
      rotation: 0,
      zIndex: nextZ(),
      bold: false,
      outline: false,
      letterSpacing: 0,
    });
    setSelected(id);
    setActiveTab('text');
  }

  function updateSelectedText(
    updates: Partial<{ font: string; fontSize: number; color: string; bold: boolean; outline: boolean; letterSpacing: number; content: string }>
  ) {
    if (!selected) return;
    dispatch({ type: 'UPDATE_TEXT', payload: { id: selected, updates } });
  }

  async function handleStickerFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPreparingSticker(true);
    const result = await prepareSticker(file);
    setPreparingSticker(false);
    if (result.ok && result.result) {
      setPendingSticker(result.result);
    } else {
      showToast(result.error || 'Could not import that sticker', 'error');
    }
  }

  function finalizeSticker(imageUrl: string) {
    if (!pendingSticker) return;
    confirmSticker(imageUrl, pendingSticker.fileName);
    setPendingSticker(null);
    setStickerCategory('custom');
    showToast('Sticker imported! 💛', 'success');
  }

  async function handleFrameFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingFrame(true);
    const result = await importFrame(file);
    setUploadingFrame(false);
    if (result.ok && result.frame) {
      setActiveFrameId(result.frame.id);
      dispatch({ type: 'SET_CUSTOM_FRAME', payload: { url: result.frame.dataUrl, photoArea: result.frame.photoArea } });
      showToast('Frame imported! Adjust where your photos sit below 💛', 'success');
    } else {
      showToast(result.error || 'Could not import that frame', 'error');
    }
  }

  function selectFrame(frameId: string, dataUrl: string, photoArea = DEFAULT_PHOTO_AREA) {
    setActiveFrameId(frameId);
    dispatch({ type: 'SET_CUSTOM_FRAME', payload: { url: dataUrl, photoArea } });
  }

  function updateActiveFrameArea(updates: Partial<typeof DEFAULT_PHOTO_AREA>) {
    if (!activeFrame) return;
    const area = { ...(editor.customFramePhotoArea || DEFAULT_PHOTO_AREA), ...updates };
    updateFramePhotoArea(activeFrame.id, area);
    dispatch({ type: 'SET_CUSTOM_FRAME', payload: { url: activeFrame.dataUrl, photoArea: area } });
  }

  async function handleExport(kind: 'download' | 'share') {
    if (!exportNodeRef.current || exporting) return;
    setSelected(null);
    setExporting(kind);
    // wait a frame so selection handles are fully removed from the DOM before capture
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      const dataUrl = await renderStripToPng(exportNodeRef.current, state.exportConfig.quality);
      const fileName = `lumistrip-${Date.now()}.png`;
      if (kind === 'download') {
        downloadDataUrl(dataUrl, fileName);
        showToast('Saved! Check your downloads 💛', 'success');
      } else {
        const result = await shareDataUrl(dataUrl, fileName);
        if (result === 'shared') showToast('Shared! ✨', 'success');
        else if (result === 'downloaded') showToast('Sharing isn\u2019t supported here — saved instead', 'info');
      }
    } catch {
      showToast('Something went wrong exporting your strip. Try again?', 'error');
    } finally {
      setExporting(null);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: 84,
        paddingBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(circle at 50% 0%, #26212e 0%, var(--booth-black) 60%)',
      }}
    >
      {/* Header — kiosk device bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 12px' }}>
        <button
          onClick={() => setPage('capture')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            color: 'rgba(251,246,238,0.7)',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <ChevronLeft size={18} /> Retake
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--flash-gold)' }} />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              fontWeight: 600,
              color: '#FBF6EE',
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            LumiStrip Booth
          </h1>
        </div>
        <div style={{ width: 62 }} />
      </div>

      {/* Strip preview — lit like a print emerging from the booth */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '18px 20px 26px',
          flexShrink: 0,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(240,185,78,0.08) 0%, transparent 65%)',
        }}
      >
        <div
          ref={exportNodeRef}
          style={{
            position: 'relative',
            ['--strip-width' as string]: STRIP_WIDTHS[editor.stripSize],
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          >
            <PhotoStrip photos={editor.photos} editor={editor} />
          </motion.div>

          <StickerLayer containerRef={exportNodeRef} selected={selected} setSelected={setSelected} stickerLibrary={stickerLibrary} />
        </div>
      </div>

      {/* Tool tabs — icon rail, gold underline for active */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          padding: '0 16px 14px',
          borderBottom: '1px solid rgba(251,246,238,0.08)',
          margin: '0 16px',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 14px 10px',
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid var(--flash-gold)' : '2px solid transparent',
                color: active ? '#FBF6EE' : 'rgba(251,246,238,0.45)',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: -1,
              }}
            >
              <Icon size={17} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tool panel */}
      <div style={{ padding: '16px 16px 0', flex: 1 }}>
        <div
          style={{
            background: 'rgba(251,246,238,0.04)',
            border: '1px solid rgba(251,246,238,0.08)',
            borderRadius: 'var(--radius-xl)',
            padding: 16,
            minHeight: 200,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'filters' && (
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      style={{
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        border: editor.filter === f.id ? '2px solid var(--flash-gold)' : '1px solid rgba(251,246,238,0.12)',
                        background: editor.filter === f.id ? 'rgba(240,185,78,0.14)' : 'rgba(251,246,238,0.03)',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{f.icon}</span>
                      <span style={{ fontSize: '0.72rem', color: '#FBF6EE', fontWeight: 600 }}>{f.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'adjust' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <AdjustSlider label="Brightness" value={editor.brightness} onChange={(v) => dispatch({ type: 'SET_BRIGHTNESS', payload: v })} />
                  <AdjustSlider label="Contrast" value={editor.contrast} onChange={(v) => dispatch({ type: 'SET_CONTRAST', payload: v })} />
                  <AdjustSlider label="Saturation" value={editor.saturation} onChange={(v) => dispatch({ type: 'SET_SATURATION', payload: v })} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#FBF6EE', fontWeight: 600 }}>Strip size</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setStripSize(size)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: editor.stripSize === size ? '2px solid var(--flash-gold)' : '1px solid rgba(251,246,238,0.12)',
                            background: editor.stripSize === size ? 'rgba(240,185,78,0.14)' : 'rgba(251,246,238,0.03)',
                            color: '#FBF6EE',
                            fontSize: '0.75rem',
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stickers' && (
                <div>
                  {/* Selected sticker size control */}
                  {selectedSticker && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 12,
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(240,185,78,0.3)',
                        background: 'rgba(240,185,78,0.08)',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FBF6EE', flexShrink: 0 }}>Size</span>
                      <input
                        type="range"
                        min={0.3}
                        max={3}
                        step={0.05}
                        value={selectedSticker.scale}
                        onChange={(e) =>
                          dispatch({ type: 'UPDATE_STICKER', payload: { id: selectedSticker.id, updates: { scale: Number(e.target.value) } } })
                        }
                        style={{ flex: 1, accentColor: 'var(--flash-gold)' }}
                      />
                      <button
                        onClick={() => {
                          dispatch({ type: 'REMOVE_STICKER', payload: selectedSticker.id });
                          setSelected(null);
                        }}
                        style={{ padding: 6, borderRadius: 'var(--radius-md)', border: 'none', background: 'none', color: '#E8A6A3', cursor: 'pointer', display: 'flex' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, alignItems: 'center' }}>
                    <input ref={stickerFileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleStickerFile} />
                    <button
                      onClick={() => stickerFileInputRef.current?.click()}
                      disabled={preparingSticker}
                      style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--flash-gold)',
                        background: 'rgba(240,185,78,0.1)',
                        color: '#FBF6EE',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {preparingSticker ? <Loader2 className="animate-spin" size={13} /> : <Upload size={13} />} Import
                    </button>
                    {STICKER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setStickerCategory(cat.id as StickerCategory | 'all')}
                        style={{
                          flexShrink: 0,
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-md)',
                          border: stickerCategory === cat.id ? '2px solid var(--flash-gold)' : '1px solid rgba(251,246,238,0.12)',
                          background: stickerCategory === cat.id ? 'rgba(240,185,78,0.14)' : 'rgba(251,246,238,0.03)',
                          color: '#FBF6EE',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                        }}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                    {customStickers.length > 0 && (
                      <button
                        onClick={() => setStickerCategory('custom')}
                        style={{
                          flexShrink: 0,
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-md)',
                          border: stickerCategory === 'custom' ? '2px solid var(--flash-gold)' : '1px solid rgba(251,246,238,0.12)',
                          background: stickerCategory === 'custom' ? 'rgba(240,185,78,0.14)' : 'rgba(251,246,238,0.03)',
                          color: '#FBF6EE',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                        }}
                      >
                        📤 My uploads
                      </button>
                    )}
                  </div>

                  {preparingSticker && (
                    <p style={{ fontSize: '0.72rem', color: 'rgba(251,246,238,0.6)', marginBottom: 8 }}>
                      Removing the background… first time can take a few seconds.
                    </p>
                  )}

                  {pendingSticker && (
                    <div
                      style={{
                        marginBottom: 12,
                        padding: 12,
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid rgba(240,185,78,0.3)',
                        background: 'rgba(240,185,78,0.06)',
                      }}
                    >
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FBF6EE', margin: '0 0 8px' }}>Which version do you want?</p>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div
                            style={{
                              aspectRatio: '1',
                              borderRadius: 'var(--radius-md)',
                              background: pendingSticker.processed
                                ? 'repeating-conic-gradient(#3a3542 0% 25%, #2a2632 0% 50%) 50% / 12px 12px'
                                : 'rgba(251,246,238,0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              marginBottom: 6,
                              padding: pendingSticker.processed ? 0 : 8,
                            }}
                          >
                            {pendingSticker.processed ? (
                              <img src={pendingSticker.processed} alt="Background removed" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: 'rgba(251,246,238,0.45)' }}>Couldn't remove background</span>
                            )}
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            disabled={!pendingSticker.processed}
                            onClick={() => pendingSticker.processed && finalizeSticker(pendingSticker.processed)}
                          >
                            No background
                          </Button>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div
                            style={{
                              aspectRatio: '1',
                              borderRadius: 'var(--radius-md)',
                              background: 'rgba(251,246,238,0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              marginBottom: 6,
                            }}
                          >
                            <img src={pendingSticker.original} alt="Original" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                          <Button variant="secondary" size="sm" fullWidth onClick={() => finalizeSticker(pendingSticker.original)}>
                            Keep original
                          </Button>
                        </div>
                      </div>
                      <button
                        onClick={() => setPendingSticker(null)}
                        style={{ marginTop: 8, fontSize: '0.72rem', color: 'rgba(251,246,238,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
                      gap: 8,
                      maxHeight: 150,
                      overflowY: 'auto',
                    }}
                  >
                    {filteredStickers.map((s) => (
                      <div key={s.id} style={{ position: 'relative' }}>
                        <button
                          onClick={() => handleAddSticker(s.id)}
                          title={s.name}
                          style={{
                            width: '100%',
                            fontSize: 24,
                            padding: 6,
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(251,246,238,0.12)',
                            background: 'rgba(251,246,238,0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {s.imageUrl ? <img src={s.imageUrl} alt={s.name} style={{ width: 28, height: 28, objectFit: 'contain' }} /> : s.emoji}
                        </button>
                        {s.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCustomSticker(s.id);
                            }}
                            style={{
                              position: 'absolute',
                              top: -5,
                              right: -5,
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: '#221D28',
                              color: '#fff',
                              border: '1px solid var(--paper)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <X size={9} />
                          </button>
                        )}
                      </div>
                    ))}
                    {stickerCategory === 'custom' && customStickers.length === 0 && (
                      <p style={{ gridColumn: '1 / -1', fontSize: '0.78rem', color: 'rgba(251,246,238,0.5)' }}>
                        No uploads yet — tap Import to add your own stickers.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Layer list */}
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                    <button
                      onClick={() => handleAddText()}
                      style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--flash-gold)',
                        background: 'rgba(240,185,78,0.1)',
                        color: '#FBF6EE',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} /> New text
                    </button>
                    {editor.texts.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelected(t.id)}
                        style={{
                          flexShrink: 0,
                          maxWidth: 100,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: selected === t.id ? '2px solid var(--flash-gold)' : '1px solid rgba(251,246,238,0.12)',
                          background: selected === t.id ? 'rgba(240,185,78,0.14)' : 'rgba(251,246,238,0.03)',
                          color: '#FBF6EE',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        {t.content || 'text'}
                      </button>
                    ))}
                  </div>

                  {selectedTextItem ? (
                    <>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <PenLine size={14} color="rgba(251,246,238,0.5)" />
                        <input
                          value={selectedTextItem.content}
                          onChange={(e) => updateSelectedText({ content: e.target.value })}
                          placeholder="Type your text…"
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(251,246,238,0.15)',
                            background: 'rgba(251,246,238,0.05)',
                            color: '#FBF6EE',
                            fontSize: '0.85rem',
                          }}
                        />
                        <button
                          onClick={() => {
                            dispatch({ type: 'REMOVE_TEXT', payload: selectedTextItem.id });
                            setSelected(null);
                          }}
                          style={{
                            padding: 8,
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(251,246,238,0.15)',
                            background: 'rgba(251,246,238,0.05)',
                            color: '#E8A6A3',
                            cursor: 'pointer',
                            display: 'flex',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {TEXT_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateSelectedText({ color: c })}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              background: c,
                              border: selectedTextItem.color === c ? '2px solid var(--flash-gold)' : '1px solid rgba(251,246,238,0.2)',
                              cursor: 'pointer',
                            }}
                          />
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <select
                          value={selectedTextItem.font}
                          onChange={(e) => updateSelectedText({ font: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(251,246,238,0.15)',
                            background: 'rgba(251,246,238,0.05)',
                            color: '#FBF6EE',
                            fontSize: '0.82rem',
                          }}
                        >
                          {GOOGLE_FONTS.map((f) => (
                            <option key={f} value={f} style={{ color: '#000' }}>
                              {f}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => updateSelectedText({ bold: !selectedTextItem.bold })}
                          title="Bold"
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: selectedTextItem.bold ? '2px solid var(--flash-gold)' : '1px solid rgba(251,246,238,0.15)',
                            background: selectedTextItem.bold ? 'rgba(240,185,78,0.14)' : 'rgba(251,246,238,0.05)',
                            color: '#FBF6EE',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Bold size={15} />
                        </button>
                        <button
                          onClick={() => updateSelectedText({ outline: !selectedTextItem.outline })}
                          title="Outline"
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: selectedTextItem.outline ? '2px solid var(--flash-gold)' : '1px solid rgba(251,246,238,0.15)',
                            background: selectedTextItem.outline ? 'rgba(240,185,78,0.14)' : 'rgba(251,246,238,0.05)',
                            color: '#FBF6EE',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            WebkitTextStroke: '1px #FBF6EE',
                          }}
                        >
                          O
                        </button>
                      </div>

                      <AdjustSlider label="Size" value={selectedTextItem.fontSize} min={12} max={64} onChange={(v) => updateSelectedText({ fontSize: v })} />
                      <AdjustSlider
                        label="Letter spacing"
                        value={selectedTextItem.letterSpacing ?? 0}
                        min={-2}
                        max={12}
                        onChange={(v) => updateSelectedText({ letterSpacing: v })}
                      />
                      <p style={{ fontSize: '0.72rem', color: 'rgba(251,246,238,0.5)', margin: 0 }}>
                        Drag on the strip to move · handle to resize/rotate
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'rgba(251,246,238,0.55)', margin: 0 }}>Add a text layer, or tap one above to style it.</p>
                  )}

                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(251,246,238,0.7)' }}>Quick captions</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                      {QUICK_CAPTIONS.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleAddText(c)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(251,246,238,0.15)',
                            background: 'rgba(251,246,238,0.05)',
                            color: '#FBF6EE',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(251,246,238,0.7)' }}>Caption under strip</label>
                    <input
                      value={editor.caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="best day ever ✨"
                      maxLength={40}
                      style={{
                        width: '100%',
                        marginTop: 6,
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(251,246,238,0.15)',
                        background: 'rgba(251,246,238,0.05)',
                        color: '#FBF6EE',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'frame' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FBF6EE' }}>Show date stamp</span>
                    <button
                      onClick={toggleDateStamp}
                      style={{
                        width: 40,
                        height: 22,
                        borderRadius: 999,
                        background: editor.showDateStamp ? 'var(--flash-gold)' : 'rgba(251,246,238,0.2)',
                        position: 'relative',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <motion.div
                        animate={{ x: editor.showDateStamp ? 20 : 2 }}
                        style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2 }}
                      />
                    </button>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FBF6EE', display: 'flex', alignItems: 'center', gap: 5 }}>
                        Extra space at bottom (for writing)
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(251,246,238,0.6)' }}>{editor.extraBottomSpace}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={140}
                      value={editor.extraBottomSpace}
                      onChange={(e) => dispatch({ type: 'SET_EXTRA_BOTTOM_SPACE', payload: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: 'var(--flash-gold)' }}
                    />
                  </div>

                  {!editor.customFrameUrl && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
                        gap: 8,
                        maxHeight: 140,
                        overflowY: 'auto',
                        marginBottom: 16,
                      }}
                    >
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => dispatch({ type: 'SELECT_TEMPLATE', payload: t.id })}
                          style={{
                            padding: '8px 6px',
                            borderRadius: 'var(--radius-md)',
                            border: editor.templateId === t.id ? '2px solid var(--flash-gold)' : '1px solid rgba(251,246,238,0.12)',
                            background: t.stripStyle.backgroundColor,
                            cursor: 'pointer',
                            fontSize: '0.65rem',
                            color: t.colors.primary,
                            fontWeight: 600,
                          }}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(251,246,238,0.7)' }}>Custom frame overlay</span>
                    {editor.customFrameUrl && (
                      <button
                        onClick={() => {
                          dispatch({ type: 'SET_CUSTOM_FRAME', payload: { url: null } });
                          setActiveFrameId(null);
                        }}
                        style={{ fontSize: '0.72rem', color: '#E8A6A3', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input ref={frameFileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFrameFile} />
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14 }}>
                    <button
                      onClick={() => frameFileInputRef.current?.click()}
                      disabled={uploadingFrame}
                      style={{
                        flexShrink: 0,
                        width: 60,
                        height: 60,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--flash-gold)',
                        background: 'rgba(240,185,78,0.1)',
                        color: '#FBF6EE',
                        cursor: 'pointer',
                      }}
                    >
                      {uploadingFrame ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                      <span style={{ fontSize: '0.6rem' }}>Import</span>
                    </button>
                    {customFrames.map((f) => (
                      <div key={f.id} style={{ position: 'relative', flexShrink: 0 }}>
                        <button
                          onClick={() => selectFrame(f.id, f.dataUrl, f.photoArea)}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 'var(--radius-md)',
                            border: activeFrameId === f.id ? '2px solid var(--flash-gold)' : '1px solid rgba(251,246,238,0.15)',
                            overflow: 'hidden',
                            padding: 0,
                            cursor: 'pointer',
                            background: '#fff',
                          }}
                        >
                          <img src={f.dataUrl} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                        <button
                          onClick={() => {
                            removeCustomFrame(f.id);
                            if (activeFrameId === f.id) {
                              setActiveFrameId(null);
                              dispatch({ type: 'SET_CUSTOM_FRAME', payload: { url: null } });
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: '#221D28',
                            color: '#fff',
                            border: '1px solid var(--paper)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={9} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {activeFrame && (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid rgba(240,185,78,0.3)',
                        background: 'rgba(240,185,78,0.06)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#FBF6EE',
                          margin: '0 0 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Move size={13} /> Position your photos in the frame
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <MiniSlider
                          label="Left"
                          value={(editor.customFramePhotoArea || DEFAULT_PHOTO_AREA).x}
                          onChange={(v) => updateActiveFrameArea({ x: v })}
                        />
                        <MiniSlider
                          label="Top"
                          value={(editor.customFramePhotoArea || DEFAULT_PHOTO_AREA).y}
                          onChange={(v) => updateActiveFrameArea({ y: v })}
                        />
                        <MiniSlider
                          label="Width"
                          value={(editor.customFramePhotoArea || DEFAULT_PHOTO_AREA).width}
                          onChange={(v) => updateActiveFrameArea({ width: v })}
                        />
                        <MiniSlider
                          label="Height"
                          value={(editor.customFramePhotoArea || DEFAULT_PHOTO_AREA).height}
                          onChange={(v) => updateActiveFrameArea({ height: v })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Export actions */}
      <div style={{ position: 'sticky', bottom: 0, display: 'flex', gap: 10, padding: '16px 20px', marginTop: 12 }}>
        <Button
          variant="glass"
          size="lg"
          fullWidth
          icon={exporting === 'share' ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />}
          onClick={() => handleExport('share')}
          disabled={!!exporting}
        >
          Share
        </Button>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={exporting === 'download' ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          onClick={() => handleExport('download')}
          disabled={!!exporting}
        >
          Download HD
        </Button>
      </div>
    </div>
  );
}

function AdjustSlider({
  label,
  value,
  onChange,
  min = 50,
  max = 150,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FBF6EE' }}>{label}</span>
        <span style={{ fontSize: '0.75rem', color: 'rgba(251,246,238,0.6)' }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--flash-gold)' }}
      />
    </div>
  );
}

function MiniSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: '0.7rem', color: 'rgba(251,246,238,0.7)' }}>{label}</span>
        <span style={{ fontSize: '0.68rem', color: 'rgba(251,246,238,0.5)' }}>{Math.round(value)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--flash-gold)' }}
      />
    </div>
  );
}
