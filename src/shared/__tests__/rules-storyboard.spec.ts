import { describe, expect, it } from 'vitest'
import { Dot } from '@/models'
import { storyFrames } from '@/shared/rules-storyboard'

const dot = (row: number, col: number) => new Dot({ row, col })

// the storyboard is a scripted game played by the real rules (RL-7)
describe('storyFrames', () => {
  it('throws on a scripted line the rules do not allow, instead of skipping it (MV-2)', () => {
    // the second line does not start from a drawn one
    expect(() =>
      storyFrames([
        [dot(0, 0), dot(0, 1)],
        [dot(2, 2), dot(2, 3)],
      ]),
    ).toThrow(/2,2/)
  })
})
