/* ============================================
   LumiStrip — Google Fonts Configuration
   ============================================ */

export const GOOGLE_FONTS = [
  'Inter',
  'Fraunces',
  'Plus Jakarta Sans',
  'Playfair Display',
  'Cormorant Garamond',
  'Space Mono',
  'Crimson Text',
  'Nanum Pen Script',
  'Nanum Gothic',
  'Noto Sans KR',
  'Black Han Sans',
  'Jua',
  'Gaegu',
  'Hi Melody',
  'Dongle',
];

export const FONT_CATEGORIES = [
  {
    id: 'korean',
    label: 'Korean',
    fonts: ['Noto Sans KR', 'Nanum Gothic', 'Nanum Pen Script', 'Black Han Sans', 'Jua', 'Gaegu', 'Hi Melody', 'Dongle'],
  },
  {
    id: 'display',
    label: 'Display',
    fonts: ['Playfair Display', 'Cormorant Garamond', 'Plus Jakarta Sans', 'Space Mono'],
  },
  {
    id: 'body',
    label: 'Body',
    fonts: ['Inter', 'Crimson Text'],
  },
];

export const FONT_URL = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;

