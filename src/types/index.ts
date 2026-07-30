/* ============================================
   LumiStrip — Core TypeScript Types
   ============================================ */

/* ── Template Types ── */
export type TemplateCategory = 'classic' | 'vintage' | 'modern' | 'premium' | 'minimal' | 'retro';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  stripStyle: {
    borderRadius: number;
    padding: number;
    gap: number;
    backgroundColor: string;
    borderColor?: string;
    borderWidth?: number;
    shadowColor: string;
    texture: 'none' | 'polaroid' | 'vintage' | 'paper';
  };
  fonts: {
    display: string;
    body: string;
  };
  decorations: {
    showDateStamp: boolean;
    showCaption: boolean;
    showBorder: boolean;
    showFilmBorder: boolean;
    showVignette: boolean;
  };
  isPremium: boolean;
  previewUrl?: string;
}

/* ── Photo Booth Capture Types ── */
export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  index: number; // 0-3 for the 4 shots
  width: number;
  height: number;
}

export type CaptureStatus = 'idle' | 'countdown' | 'capturing' | 'flash' | 'complete' | 'error';

export interface CaptureSession {
  id: string;
  templateId: string;
  photos: CapturedPhoto[];
  startedAt: number;
  completedAt?: number;
  status: CaptureStatus;
}

/* ── Filter Types ── */
export type FilterPreset =
  | 'none'
  | 'vintage'
  | 'mono'
  | 'warm'
  | 'cool'
  | 'dreamy'
  | 'pastel'
  | 'contrast'
  | 'fade'
  | 'grain';

export interface FilterConfig {
  id: FilterPreset;
  name: string;
  css: string;
  icon: string;
}

/* ── Sticker Types ── */
export interface Sticker {
  id: string;
  name: string;
  emoji?: string;
  imageUrl?: string; // set for user-uploaded stickers, takes priority over emoji
  category: StickerCategory;
  size: number;
  isCustom?: boolean;
}

export type StickerCategory = 'heart' | 'star' | 'flower' | 'sparkle' | 'ribbon' | 'korean' | 'cute' | 'seasonal' | 'film' | 'cafe' | 'custom';

export interface PlacedSticker {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

/* ── Text Overlay Types ── */
export interface TextOverlay {
  id: string;
  content: string;
  font: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  bold?: boolean;
  outline?: boolean;
  letterSpacing?: number;
}

export interface PhotoArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/* ── Editor Types ── */
export interface EditorState {
  photos: CapturedPhoto[];
  activePhotoIndex: number;
  templateId: string;
  filter: FilterPreset;
  stickers: PlacedSticker[];
  texts: TextOverlay[];
  caption: string;
  showDateStamp: boolean;
  stripSize: 'small' | 'medium' | 'large';
  brightness: number;
  contrast: number;
  saturation: number;
  customFrameUrl: string | null;
  customFramePhotoArea: PhotoArea | null;
  extraBottomSpace: number;
}

export interface EditorAction {
  type: string;
  payload: unknown;
}

/* ── Download Types ── */
export type ExportFormat = 'png' | 'jpg';
export type ExportQuality = 'standard' | 'hd' | '4k';

export interface ExportConfig {
  format: ExportFormat;
  quality: ExportQuality;
  includeWatermark: boolean;
  fileName?: string;
}

/* ── Theme Types ── */
export type ThemeMode = 'light' | 'dark' | 'system';

/* ── UI Types ── */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/* ── Navigation Types ── */
export type AppPage =
  | 'landing'
  | 'gallery'
  | 'camera'
  | 'capture'
  | 'result'
  | 'download'
  | 'editor';

