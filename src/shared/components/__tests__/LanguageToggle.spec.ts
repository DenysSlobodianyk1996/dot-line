import { describe, expect, it } from 'vitest'
import { mountGamePage } from '@/test/mount-game-page'
import { GamePage, openGamePage } from '@/test/game-page'

describe('language toggle', () => {
  it('starts in Ukrainian with UA pressed on a Ukrainian device (I18N-2, I18N-5, UP-15, AR-6)', async () => {
    const page = await mountGamePage({ deviceLanguage: 'uk-UA' })

    expect(page.get('button[lang="uk"]').attributes('aria-pressed')).toBe('true')
    expect(page.get('button[lang="en"]').attributes('aria-pressed')).toBe('false')
    expect(page.get('button[lang="en"]').attributes('aria-label')).toBe('English')
    expect(document.title).toBe('Крапки й квадрати')
  })

  it('switches the text, page language and tab title when EN is pressed (I18N-3, APP-1, UP-15)', async () => {
    const page = await mountGamePage({ deviceLanguage: 'uk-UA' })

    await page.get('button[lang="en"]').trigger('click')

    expect(page.text()).toContain('Settings')
    expect(page.get('button[type="submit"]').text()).toBe('Save')
    expect(page.get('button[lang="en"]').attributes('aria-pressed')).toBe('true')
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe('Dots and Boxes')
  })

  it('keeps the chosen language after a reload (I18N-4)', async () => {
    const page = await mountGamePage({ deviceLanguage: 'uk-UA' })
    await page.get('button[lang="en"]').trigger('click')
    page.unmount()

    const reloaded = await mountGamePage({ deviceLanguage: 'uk-UA' })

    expect(reloaded.text()).toContain('Settings')
    expect(document.documentElement.lang).toBe('en')
  })
})

describe('first launch follows the device language', () => {
  it('picks Ukrainian on a uk-UA device (I18N-2, AR-6)', async () => {
    const page = await mountGamePage({ deviceLanguage: 'uk-UA' })

    expect(page.get('button[lang="uk"]').attributes('aria-pressed')).toBe('true')
    expect(document.documentElement.lang).toBe('uk')
    expect(document.title).toBe('Крапки й квадрати')
    expect(new GamePage(page).manifestHref()).toBe('/manifest.uk.webmanifest')
  })

  it.each(['en-US', 'de-DE'])('picks English on a %s device (I18N-2, AR-6)', async (language) => {
    const page = await mountGamePage({ deviceLanguage: language })

    expect(page.text()).toContain('Settings')
    expect(page.get('button[lang="en"]').attributes('aria-pressed')).toBe('true')
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe('Dots and Boxes')
    expect(new GamePage(page).manifestHref()).toBe('/manifest.en.webmanifest')
  })

  it('keeps a saved language over the device language (I18N-4, AR-7)', async () => {
    const page = await mountGamePage({ deviceLanguage: 'en-US', storage: { LOCALE: 'uk' } })

    expect(page.get('button[lang="uk"]').attributes('aria-pressed')).toBe('true')
    expect(document.documentElement.lang).toBe('uk')
    expect(document.title).toBe('Крапки й квадрати')
  })
})

describe('install manifest', () => {
  it('links the Ukrainian manifest on the first visit from a Ukrainian device (VR-50)', async () => {
    const page = new GamePage(await mountGamePage({ deviceLanguage: 'uk-UA' }))

    expect(page.manifestHref()).toBe('/manifest.uk.webmanifest')
  })

  it('swaps the manifest link when the language changes (VR-50, VR-51)', async () => {
    const page = await openGamePage()
    expect(page.manifestHref()).toBe('/manifest.en.webmanifest')

    await page.switchLanguage('uk')
    expect(page.manifestHref()).toBe('/manifest.uk.webmanifest')

    await page.switchLanguage('en')
    expect(page.manifestHref()).toBe('/manifest.en.webmanifest')
  })
})
