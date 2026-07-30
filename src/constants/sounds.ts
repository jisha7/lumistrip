/* ============================================
   LumiStrip — Sound Effects Config
   ============================================ */

export const SOUNDS = {
  shutter: '/sounds/shutter.mp3',
  countdown: '/sounds/countdown.mp3',
  countdownFinal: '/sounds/countdown-final.mp3',
  flash: '/sounds/flash.mp3',
  stickerPlace: '/sounds/sticker-place.mp3',
  stickerRemove: '/sounds/sticker-remove.mp3',
  download: '/sounds/download.mp3',
  success: '/sounds/success.mp3',
  click: '/sounds/click.mp3',
  hover: '/sounds/hover.mp3',
  transition: '/sounds/transition.mp3',
} as const;

/* ── Sound will be generated as simple Web Audio beeps if files don't exist ── */
export const SOUND_ENABLED_DEFAULT = true;

