import { describe, expect, it } from 'vitest'
import { GamePage, openGamePage } from '@/test/game-page'
import { mountGamePage } from '@/test/mount-game-page'

// The app was renamed, but data saved before the rename must still load (UP-16). The keys are
// written out literally here, so renaming a key constant fails these tests.
describe('data saved before the rename (UP-16)', () => {
  it('restores a game saved under CURRENT_GAME and keeps saving it there', async () => {
    const saved = {
      player1: { name: 'Anna', color: '#ff0000' },
      player2: { name: 'Bohdan', color: '#0000ff' },
      size: 2,
      lines: [{ from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, ownerName: 'Anna' }],
      dirtySquares: [],
      currentPlayerName: 'Bohdan',
      status: 'playing',
      finishReason: null,
    }
    const page = await openGamePage({ storage: { CURRENT_GAME: saved } })

    expect(page.line([0, 0], [0, 1])).toEqual({ color: 'rgb(255, 0, 0)' })
    expect(page.turn()).toBe('Bohdan')

    await page.drawLine([0, 0], [1, 0])

    expect(JSON.parse(localStorage.getItem('CURRENT_GAME')!).lines).toHaveLength(2)
  })

  it('keeps the language saved under LOCALE and the theme saved under THEME', async () => {
    const page = new GamePage(await mountGamePage({ storage: { LOCALE: 'en', THEME: 'dark' } }))

    expect(page.headerTitle()).toBe('Dots and Boxes: Connected')
    expect(page.theme()).toBe('dark')
  })

  // both differ from setup's defaults (Versus computer, Normal)
  it('opens setup with the game mode saved under GAME_MODE', async () => {
    const page = await openGamePage({ storage: { GAME_MODE: 'twoPlayers' } })

    expect(page.selectedMode()).toBe('twoPlayers')
  })

  it('opens setup with the difficulty saved under DIFFICULTY', async () => {
    const page = await openGamePage({ storage: { GAME_MODE: 'computer', DIFFICULTY: 'easy' } })

    expect(page.selectedDifficulty()).toBe('easy')
  })
})
