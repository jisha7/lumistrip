/* ============================================
   LumiStrip — Custom Uploaded Assets
   Lets users import their own trending stickers
   and frame overlays. Stored locally in the
   browser so they persist between visits.
   ============================================ */

import { useCallback, useEffect, useState } from 'react';
import type { Sticker, PhotoArea } from '../types';
import { removeImageBackground } from '../utils/backgroundRemoval';

const STICKERS_KEY = 'lumistrip:customStickers';
const FRAMES_KEY = 'lumistrip:customFrames';
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4MB per file

export const DEFAULT_PHOTO_AREA: PhotoArea = { x: 15, y: 10, width: 70, height: 80 };

export interface CustomFrame {
  id: string;
  name: string;
  dataUrl: string;
  photoArea: PhotoArea;
}

function readStickers(): Sticker[] {
  try {
    const raw = localStorage.getItem(STICKERS_KEY);
    return raw ? (JSON.parse(raw) as Sticker[]) : [];
  } catch {
    return [];
  }
}

function readFrames(): CustomFrame[] {
  try {
    const raw = localStorage.getItem(FRAMES_KEY);
    return raw ? (JSON.parse(raw) as CustomFrame[]) : [];
  } catch {
    return [];
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export interface PreparedSticker {
  fileName: string;
  original: string;
  processed: string | null; // null if background removal failed
}

export function useCustomAssets() {
  const [customStickers, setCustomStickers] = useState<Sticker[]>([]);
  const [customFrames, setCustomFrames] = useState<CustomFrame[]>([]);

  useEffect(() => {
    setCustomStickers(readStickers());
    setCustomFrames(readFrames());
  }, []);

  /** Step 1: read the file and try background removal, but don't save yet — the
   *  caller shows both versions so the person can pick which one they want. */
  const prepareSticker = useCallback(async (file: File): Promise<{ ok: boolean; error?: string; result?: PreparedSticker }> => {
    if (!file.type.startsWith('image/')) return { ok: false, error: 'Please upload an image file' };
    if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: 'Image is too large (max 4MB)' };

    try {
      const original = await fileToDataUrl(file);
      const processed = await removeImageBackground(original);
      return { ok: true, result: { fileName: file.name.replace(/\.[^.]+$/, ''), original, processed } };
    } catch {
      return { ok: false, error: 'Something went wrong importing that file' };
    }
  }, []);

  /** Step 2: save whichever version (original or background-removed) the person picked. */
  const confirmSticker = useCallback((imageUrl: string, name: string) => {
    const sticker: Sticker = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      imageUrl,
      category: 'custom',
      size: 64,
      isCustom: true,
    };
    const updated = [...readStickers(), sticker];
    localStorage.setItem(STICKERS_KEY, JSON.stringify(updated));
    setCustomStickers(updated);
    return sticker;
  }, []);

  const removeCustomSticker = useCallback((id: string) => {
    const updated = readStickers().filter((s) => s.id !== id);
    localStorage.setItem(STICKERS_KEY, JSON.stringify(updated));
    setCustomStickers(updated);
  }, []);

  const importFrame = useCallback(async (file: File): Promise<{ ok: boolean; error?: string; frame?: CustomFrame }> => {
    if (!file.type.startsWith('image/')) return { ok: false, error: 'Please upload an image file' };
    if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: 'Image is too large (max 4MB)' };
    try {
      const dataUrl = await fileToDataUrl(file);
      const frame: CustomFrame = {
        id: `frame-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        dataUrl,
        photoArea: { ...DEFAULT_PHOTO_AREA },
      };
      const updated = [...readFrames(), frame];
      localStorage.setItem(FRAMES_KEY, JSON.stringify(updated));
      setCustomFrames(updated);
      return { ok: true, frame };
    } catch {
      return { ok: false, error: 'Something went wrong importing that file' };
    }
  }, []);

  const updateFramePhotoArea = useCallback((id: string, photoArea: PhotoArea) => {
    const updated = readFrames().map((f) => (f.id === id ? { ...f, photoArea } : f));
    localStorage.setItem(FRAMES_KEY, JSON.stringify(updated));
    setCustomFrames(updated);
  }, []);

  const removeCustomFrame = useCallback((id: string) => {
    const updated = readFrames().filter((f) => f.id !== id);
    localStorage.setItem(FRAMES_KEY, JSON.stringify(updated));
    setCustomFrames(updated);
  }, []);

  return {
    customStickers,
    prepareSticker,
    confirmSticker,
    removeCustomSticker,
    customFrames,
    importFrame,
    updateFramePhotoArea,
    removeCustomFrame,
  };
}
