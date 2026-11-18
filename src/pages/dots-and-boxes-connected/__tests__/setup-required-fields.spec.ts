import { describe, expect, it } from 'vitest'
import { openGamePage } from '@/test/game-page'

// Required setup fields: a visible `*` after the label, hidden from screen readers, which hear
// the input announced as required instead (GS-1, GS-2)
describe('Setup required fields', () => {
  it('marks the name and the size as required in Two players mode (GS-1, GS-2)', async () => {
    const page = await openGamePage({ storage: { LOCALE: 'en' } })
    await page.chooseMode('twoPlayers')

    for (const id of ['player1.name', 'player2.name', 'size'] as const) {
      expect(page.fieldLabel(id)).toMatch(/\*$/)
      expect(page.isRequired(id)).toBe(true)
    }
  })

  it("marks the person's name and the size as required in Versus computer mode (GS-1, GS-2)", async () => {
    const page = await openGamePage({ storage: { LOCALE: 'en' } })
    await page.chooseMode('computer')

    expect(page.fieldLabel('player1.name')).toMatch(/\*$/)
    expect(page.fieldLabel('size')).toMatch(/\*$/)
    expect(page.isRequired('player1.name')).toBe(true)
    expect(page.isRequired('size')).toBe(true)
  })

  it('hides the marker from screen readers (GS-1, GS-2)', async () => {
    const page = await openGamePage({ storage: { LOCALE: 'en' } })
    await page.chooseMode('twoPlayers')

    expect(page.fieldAccessibleLabel('player1.name')).toBe('Name')
    expect(page.fieldAccessibleLabel('player2.name')).toBe('Name')
    expect(page.fieldAccessibleLabel('size')).toBe('Size')
  })
})
