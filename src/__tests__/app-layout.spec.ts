import { describe, expect, it } from 'vitest'
import { openGamePage, startGame } from '@/test/game-page'

// MB-11: the app never scrolls as a whole; only the screen between the header and the footer does
const FIXED_SHELL = {
  shellFillsScreen: true,
  shellScrolls: false,
  mains: 1,
  mainScrolls: true,
  headerAboveMain: true,
  screenInMain: true,
}

describe('app layout', () => {
  it('keeps the header on top and the footer at the bottom of the setup screen; only the form scrolls (MB-11, FT-1)', async () => {
    const page = await openGamePage()

    expect(page.layout()).toEqual({ ...FIXED_SHELL, footer: { belowMain: true } })
  })

  it('scrolls the game screen inside the app, under a fixed header (MB-11, FT-2)', async () => {
    const page = await startGame()

    expect(page.layout()).toEqual({ ...FIXED_SHELL, footer: null })
  })

  it('scrolls the privacy screen inside the app, under a fixed header (MB-11, PV-2)', async () => {
    const page = await openGamePage()
    await page.openPrivacy()

    expect(page.layout()).toEqual({ ...FIXED_SHELL, footer: null })
  })
})
