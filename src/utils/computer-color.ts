import { SWATCHES } from './swatches'

type Rgb = [number, number, number]

function toRgb(hex: string): Rgb | null {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim())
  if (!match) return null
  return [parseInt(match[1]!, 16), parseInt(match[2]!, 16), parseInt(match[3]!, 16)]
}

// "redmean" approximation of how different two colors look
function distance([r1, g1, b1]: Rgb, [r2, g2, b2]: Rgb): number {
  const redMean = (r1 + r2) / 2
  const dr = r1 - r2
  const dg = g1 - g2
  const db = b1 - b2
  return Math.sqrt(
    (2 + redMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - redMean) / 256) * db * db,
  )
}

/** The swatch that looks most different from the person's color (CM-9, VR-37). */
export function computerColorFor(personColor: string | null | undefined): string {
  const person = toRgb(personColor ?? '')
  let best: string = SWATCHES[0].hex
  if (!person) return best
  let bestDistance = -1
  for (const { hex: color } of SWATCHES) {
    const d = distance(person, toRgb(color)!)
    if (d > bestDistance) {
      best = color
      bestDistance = d
    }
  }
  return best
}
