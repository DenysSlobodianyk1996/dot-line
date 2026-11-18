// The player colors (VR-32): mid-tones that read as a line and as a light square fill on both the
// light and the dark board, same hex in both themes (VR-38). Keys double as i18n keys (colors.<key>).
export const SWATCHES = [
  { key: 'coral', hex: '#e8735a' },
  { key: 'teal', hex: '#2a9d8f' },
  { key: 'sunflower', hex: '#e2a93b' },
  { key: 'sky', hex: '#4f93d1' },
  { key: 'lavender', hex: '#9479cf' },
  { key: 'leaf', hex: '#6aa45a' },
  { key: 'berry', hex: '#d0638c' },
  { key: 'tangerine', hex: '#ee8a3c' },
] as const

/** A random swatch's hex, other than `except` (VR-35). */
export function randomSwatch(except?: string): string {
  const pool = SWATCHES.filter(({ hex }) => hex !== except)
  return pool[Math.floor(Math.random() * pool.length)]!.hex
}
