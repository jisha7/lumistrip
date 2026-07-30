/* ============================================
   LumiStrip — Filter Presets
   ============================================ */

import type { FilterConfig } from '../types';

export const FILTERS: FilterConfig[] = [
  {
    id: 'none',
    name: 'Original',
    css: '',
    icon: '🔲',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    css: 'sepia(0.3) contrast(0.9) brightness(1.1) saturate(0.8)',
    icon: '🎞️',
  },
  {
    id: 'mono',
    name: 'Monochrome',
    css: 'grayscale(1) contrast(1.1) brightness(1.05)',
    icon: '⚫',
  },
  {
    id: 'warm',
    name: 'Warm Glow',
    css: 'sepia(0.15) saturate(1.2) hue-rotate(-10deg) brightness(1.05)',
    icon: '🌅',
  },
  {
    id: 'cool',
    name: 'Cool Tone',
    css: 'sepia(0.05) saturate(0.9) hue-rotate(10deg) brightness(1.02) contrast(1.05)',
    icon: '❄️',
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    css: 'brightness(1.1) contrast(0.85) saturate(1.1) blur(0.3px)',
    icon: '💭',
  },
  {
    id: 'pastel',
    name: 'Pastel',
    css: 'brightness(1.15) contrast(0.8) saturate(0.7) sepia(0.1)',
    icon: '🌸',
  },
  {
    id: 'contrast',
    name: 'High Contrast',
    css: 'contrast(1.4) brightness(1.1) saturate(1.1)',
    icon: '🎯',
  },
  {
    id: 'fade',
    name: 'Fade',
    css: 'brightness(1.05) contrast(0.85) saturate(0.6) opacity(0.9)',
    icon: '🌫️',
  },
  {
    id: 'grain',
    name: 'Film Grain',
    css: 'brightness(1.05) contrast(1.1) saturate(0.85) sepia(0.15)',
    icon: '📷',
  },
];

