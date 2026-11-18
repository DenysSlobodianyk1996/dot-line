import { describe, expect, it } from 'vitest'
import { ANNA, BOHDAN, GamePage, openGamePage, stubSystemTheme } from '@/test/game-page'
import { mountGamePage } from '@/test/mount-game-page'

describe('theme', () => {
  it('follows the device setting when no theme was chosen (VR-11)', async () => {
    stubSystemTheme('dark')

    const page = await openGamePage()

    expect(page.theme()).toBe('dark')
  })

  it('keeps following the device setting while it changes (VR-15)', async () => {
    const system = stubSystemTheme('light')
    const page = await openGamePage()
    expect(page.theme()).toBe('light')

    await system.set('dark')

    expect(page.theme()).toBe('dark')
  })

  it('switches between light and dark with the header button, named after what it switches to (VR-13, VR-16)', async () => {
    stubSystemTheme('light')
    const page = await openGamePage()
    expect(page.themeButtonLabel()).toBe('Dark theme')

    await page.toggleTheme()

    expect(page.theme()).toBe('dark')
    expect(page.themeButtonLabel()).toBe('Light theme')

    await page.toggleTheme()

    expect(page.theme()).toBe('light')
    expect(page.themeButtonLabel()).toBe('Dark theme')
  })

  it('remembers the chosen theme after a reload, over the device setting (VR-14)', async () => {
    const system = stubSystemTheme('light')
    const page = await openGamePage()
    await page.toggleTheme()

    const reloaded = await page.reload()

    expect(reloaded.theme()).toBe('dark')
    await system.set('light')
    expect(reloaded.theme()).toBe('dark')
    expect(localStorage.getItem('THEME')).toBe('dark')
  })

  it('names the theme button in Ukrainian on a first visit from a Ukrainian device (VR-16, AR-6)', async () => {
    stubSystemTheme('dark')

    const page = new GamePage(await mountGamePage({ deviceLanguage: 'uk-UA' }))

    expect(page.themeButtonLabel()).toBe('Світла тема')
    expect(page.headerTitle()).toBe('Крапки й квадрати: ланцюжок')
  })
})

describe('header', () => {
  it('shows the game name and the theme button on the setup and game screens (VR-18, VR-22)', async () => {
    const page = await openGamePage()
    expect(page.headerTitle()).toBe('Dots and Boxes: Connected')
    expect(page.themeButtonLabel()).toBe('Dark theme')

    await page.submitSetup({
      mode: 'twoPlayers',
      player1: ANNA,
      player2: BOHDAN,
      size: 2,
      first: 1,
    })

    expect(page.isSetupShown).toBe(false)
    expect(page.headerTitle()).toBe('Dots and Boxes: Connected')
    expect(page.themeButtonLabel()).toBe('Dark theme')
  })
  it('shows the logo before the game name, hidden from screen readers (VR-18, VR-19)', async () => {
    const page = await openGamePage()

    expect(page.headerLogo()).toEqual({ decorative: true, beforeTitle: true })
  })
})
