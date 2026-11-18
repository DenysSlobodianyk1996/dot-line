import { Dot, DotsAndBoxesGame, type Line, type Square } from '@/models'
import { SWATCHES } from '@/utils/swatches'

// The scripted 3×3 game behind the rules panel's storyboard (RL-7). It is played on a real
// DotsAndBoxesGame, so every line is legal (MV-1..3) and squares are claimed by the game rules (SQ-1..2).

export type StoryPlayer = 'coral' | 'teal'

export const STORY_SIZE = 3

// player names are the swatch keys, so a line's or square's owner is its swatch
export const STORY_COLORS: Record<StoryPlayer, string> = {
  coral: SWATCHES.find(({ key }) => key === 'coral')!.hex,
  teal: SWATCHES.find(({ key }) => key === 'teal')!.hex,
}

export interface StoryFrame {
  lines: Line[]
  squares: Square[]
  // Dot1 picked by `current`, with its free neighbors highlighted
  dot1: Dot | null
  neighbors: Dot[]
  current: StoryPlayer
}

const dot = (row: number, col: number) => new Dot({ row, col })

// Coral draws first and the turn alternates; ends Coral 1, Teal 2
const MOVES: [Dot, Dot][] = [
  [dot(1, 0), dot(1, 1)],
  [dot(1, 1), dot(0, 1)],
  [dot(1, 0), dot(2, 0)],
  [dot(0, 1), dot(0, 0)],
  [dot(0, 0), dot(1, 0)], // Coral's fourth side: square 0,0
  [dot(1, 1), dot(1, 2)],
  [dot(1, 2), dot(2, 2)],
  [dot(2, 2), dot(2, 1)],
  [dot(2, 0), dot(2, 1)],
  [dot(1, 1), dot(2, 1)], // Teal closes squares 1,0 and 1,1 with one line
]

function snapshot(game: DotsAndBoxesGame, dot1: Dot | null = null): StoryFrame {
  return {
    lines: [...game.lines],
    squares: [...game.dirtySquares],
    dot1,
    neighbors: dot1 ? game.validNeighbors(dot1) : [],
    current: game.currentPlayerName as StoryPlayer,
  }
}

/**
 * The four frames: first line, Dot1 with its neighbors, one owned square, two squares from one line.
 * Throws if a scripted line breaks the rules, so a bad script can't silently drop a move.
 */
export function storyFrames(moves: [Dot, Dot][] = MOVES): StoryFrame[] {
  const game = new DotsAndBoxesGame({
    player1: { name: 'coral', color: STORY_COLORS.coral },
    player2: { name: 'teal', color: STORY_COLORS.teal },
    size: STORY_SIZE,
    currentPlayerName: 'coral',
  })
  const frames: StoryFrame[] = []
  moves.forEach(([from, to], index) => {
    if (index === 1) frames.push(snapshot(game, from))
    if (!game.canDraw(from, to)) {
      throw new Error(`Storyboard move ${index + 1} (${from.key}-${to.key}) is not a legal line`)
    }
    game.drawLine(from, to)
    if (index === 0 || index === 4 || index === moves.length - 1) frames.push(snapshot(game))
  })
  return frames
}
