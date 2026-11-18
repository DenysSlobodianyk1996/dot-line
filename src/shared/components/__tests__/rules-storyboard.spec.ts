import { describe, expect, it } from 'vitest'
import { openGamePage } from '@/test/game-page'

const CAPTIONS_EN = [
  'The first line goes anywhere.',
  'Next lines start from a drawn one: pick a dot, then a neighbor.',
  'Draw the fourth side and the square is yours.',
  'One line can close two squares.',
]

describe('rules panel storyboard (RL-7)', () => {
  it('shows four captioned pictures under the rules', async () => {
    const page = await openGamePage()

    await page.openRules()

    const storyboard = page.storyboard()
    expect(storyboard?.heading).toBe('In pictures')
    expect(storyboard?.frames.map((frame) => frame.caption)).toEqual(CAPTIONS_EN)
  })

  // one scripted 3×3 game between a coral and a teal player (issue #41)
  it('frame 1: the first line on an empty board', async () => {
    const page = await openGamePage()
    await page.openRules()

    const frame = page.storyboard()!.frames[0]!

    expect(frame.lines).toEqual({ '1,0-1,1': 'coral' })
    expect(frame.squares).toEqual({})
    expect(frame.dot1).toBeNull()
    expect(frame.neighbors).toEqual([])
  })

  it('frame 2: teal picks Dot1 at the end of that line and its free neighbors light up', async () => {
    const page = await openGamePage()
    await page.openRules()

    const frame = page.storyboard()!.frames[1]!

    expect(frame.lines).toEqual({ '1,0-1,1': 'coral' })
    expect(frame.dot1).toEqual({ at: '1,1', color: 'teal' })
    expect(frame.neighbors.sort()).toEqual(['0,1', '1,2', '2,1'])
    expect(frame.squares).toEqual({})
  })

  it('frame 3: coral draws a fourth side and owns the square', async () => {
    const page = await openGamePage()
    await page.openRules()

    const frame = page.storyboard()!.frames[2]!

    expect(frame.lines).toEqual({
      '1,0-1,1': 'coral',
      '0,1-1,1': 'teal',
      '1,0-2,0': 'coral',
      '0,0-0,1': 'teal',
      '0,0-1,0': 'coral',
    })
    expect(frame.squares).toEqual({ '0,0': { letter: 'C', color: 'coral' } })
    expect(frame.dot1).toBeNull()
  })

  it("frame 4: teal's one line closes two squares", async () => {
    const page = await openGamePage()
    await page.openRules()

    const frame = page.storyboard()!.frames[3]!

    expect(Object.keys(frame.lines)).toHaveLength(10)
    expect(frame.lines['1,1-2,1']).toBe('teal')
    expect(frame.squares).toEqual({
      '0,0': { letter: 'C', color: 'coral' },
      '1,0': { letter: 'T', color: 'teal' },
      '1,1': { letter: 'T', color: 'teal' },
    })
  })

  it('is hidden from assistive technology', async () => {
    const page = await openGamePage()
    await page.openRules()

    expect(page.storyboard()?.hiddenFromAssistiveTech).toBe(true)
  })

  it('draws the boards in theme tokens, so they follow light and dark live; players keep their swatches', async () => {
    const page = await openGamePage()
    await page.openRules()

    expect(page.storyboardPaints()).toEqual([
      'coral',
      'teal',
      'var(--color-border)',
      'var(--color-dot)',
      'var(--color-ink)',
      'var(--color-surface)',
    ])
  })

  it('follows the language toggle: heading, captions and owner letters', async () => {
    const page = await openGamePage()
    await page.openRules()

    await page.switchLanguage('uk')

    const storyboard = page.storyboard()!
    expect(storyboard.heading).toBe('У картинках')
    expect(storyboard.frames.map((frame) => frame.caption)).toEqual([
      'Першу лінію можна провести будь-де.',
      'Наступні лінії починаються від уже проведеної: оберіть точку, потім сусідню.',
      'Проведіть четверту сторону, і квадрат ваш.',
      'Одна лінія може закрити два квадрати.',
    ])
    // «Кораловий», «Бірюзовий»
    expect(storyboard.frames[3]!.squares).toEqual({
      '0,0': { letter: 'К', color: 'coral' },
      '1,0': { letter: 'Б', color: 'teal' },
      '1,1': { letter: 'Б', color: 'teal' },
    })
  })
})
