/* ============================================
   LumiStrip — Strip Export
   Renders the on-screen strip node to a high-res
   PNG for download and native share.
   ============================================ */

import { toPng } from 'html-to-image';
import type { ExportQuality } from '../types';

const PIXEL_RATIO: Record<ExportQuality, number> = {
  standard: 1.5,
  hd: 2.5,
  '4k': 4,
};

export async function renderStripToPng(node: HTMLElement, quality: ExportQuality = 'hd'): Promise<string> {
  // Two passes: fonts/images can lag on the first render.
  await document.fonts?.ready?.catch(() => {});
  const options = {
    pixelRatio: PIXEL_RATIO[quality],
    cacheBust: true,
    backgroundColor: undefined,
  };
  await toPng(node, options);
  return toPng(node, options);
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function shareDataUrl(dataUrl: string, fileName: string, title = 'My LumiStrip'): Promise<'shared' | 'downloaded' | 'cancelled'> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], fileName, { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
        text: 'Made with LumiStrip 💛',
      });
      return 'shared';
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    // fall through to download fallback
  }
  downloadDataUrl(dataUrl, fileName);
  return 'downloaded';
}
