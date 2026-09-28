/** ⌘ på Mac, Ctrl ellers — så genvejen vises som den faktisk tastes. */
export const modKey =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl'
