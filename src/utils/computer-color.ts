// Colors the computer player can get; all readable on white and as a 30% square fill
export const COMPUTER_PALETTE = [
  '#32a06e', // green
  '#2f6fd6', // blue
  '#cd3f5a', // red
  '#e08a1e', // orange
  '#8a4fd1', // purple
  '#1f9bb0', // teal
] as const

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

/** The palette color that looks most different from the person's color (CM-9). */
export function computerColorFor(personColor: string | null | undefined): string {
  const person = toRgb(personColor ?? '')
  let best: string = COMPUTER_PALETTE[0]
  if (!person) return best
  let bestDistance = -1
  for (const color of COMPUTER_PALETTE) {
    const d = distance(person, toRgb(color)!)
    if (d > bestDistance) {
      best = color
      bestDistance = d
    }
  }
  return best
}
