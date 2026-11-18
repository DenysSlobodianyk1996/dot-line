/*
 * The game's logo, the one SVG source for the header logo, the favicon and the install icons
 * (VR-19, VR-40..VR-43): four dots in a 2×2 square, the top line coral, the left line teal and a
 * dashed sunflower "waiting" line on the right, with a soft halo on the dot it starts from.
 * No imports: `scripts/generate-icons.ts` loads this file straight into Node.
 */

export const LOGO_COLORS = {
  top: '#e8735a', // coral
  left: '#2a9d8f', // teal
  wait: '#e2a93b', // sunflower
  dotLight: '#4a3a2e', // cocoa, on light backgrounds
  dotDark: '#f6ebdc', // cream, on dark backgrounds
  tile: '#fbf5ec', // cream tile behind the install icons
} as const

export interface LogoOptions {
  // dot fill: a color, or 'currentColor' to follow the surrounding text color
  dot?: string
  // inline <style> rules (e.g. the favicon's color-scheme switch); dots carry class "logo-dot"
  style?: string
  // tile background; omitted = transparent
  tile?: string
  // rounded tile corners in viewBox units; 0 = full-bleed square that the OS masks itself
  tileRadius?: number
  // share of the tile the logo is scaled to (only with a tile)
  scale?: number
  // rendered width and height in px; omitted = sized by CSS
  size?: number
}

export function logoSvg({
  dot = LOGO_COLORS.dotLight,
  style,
  tile,
  tileRadius = 22,
  scale = 0.8,
  size,
}: LogoOptions = {}): string {
  const offset = (100 - 100 * scale) / 2
  const sizeAttrs = size === undefined ? '' : ` width="${size}" height="${size}"`
  const dotAt = (cx: number, cy: number) =>
    `<circle class="logo-dot" cx="${cx}" cy="${cy}" r="9" fill="${dot}"/>`
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${sizeAttrs} aria-hidden="true">`,
    style ? `<style>${style}</style>` : '',
    tile ? `<rect width="100" height="100" rx="${tileRadius}" fill="${tile}"/>` : '',
    tile ? `<g transform="translate(${offset} ${offset}) scale(${scale})">` : '<g>',
    `<line x1="22" y1="22" x2="78" y2="22" stroke="${LOGO_COLORS.top}" stroke-width="11" stroke-linecap="round"/>`,
    `<line x1="22" y1="22" x2="22" y2="78" stroke="${LOGO_COLORS.left}" stroke-width="11" stroke-linecap="round"/>`,
    `<line class="logo-wait" x1="78" y1="22" x2="78" y2="78" stroke="${LOGO_COLORS.wait}" stroke-width="9" stroke-linecap="round" stroke-dasharray="0.1 16"/>`,
    dotAt(22, 22),
    dotAt(22, 78),
    dotAt(78, 78),
    // the dot the next line starts from
    `<circle cx="78" cy="22" r="14" fill="${LOGO_COLORS.wait}" opacity="0.25"/>`,
    dotAt(78, 22),
    '</g></svg>',
  ].join('')
}

// the favicon: transparent, cocoa dots on light tab bars and cream dots on dark ones (VR-40, VR-41)
export function faviconSvg(): string {
  return logoSvg({
    style: `.logo-dot{fill:${LOGO_COLORS.dotLight}}@media (prefers-color-scheme:dark){.logo-dot{fill:${LOGO_COLORS.dotDark}}}`,
  })
}
