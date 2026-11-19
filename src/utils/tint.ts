/**
 * A player's color at `alpha` (0..1), as rgba(). Not color-mix(): that needs Chrome 111, and an old
 * Android system WebView drops the whole declaration (AR-21). Saved games may hold any hex, so a
 * value that isn't #rgb or #rrggbb comes back unchanged.
 */
export function tint(color: string, alpha: number): string {
  const hex = color.trim().replace(/^#/, '')
  const full = /^[0-9a-f]{3}$/i.test(hex)
    ? hex
        .split('')
        .map((c) => c + c)
        .join('')
    : hex
  if (!/^[0-9a-f]{6}$/i.test(full)) return color
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
