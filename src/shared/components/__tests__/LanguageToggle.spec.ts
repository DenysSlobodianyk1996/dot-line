import { describe, expect, it } from 'vitest'
import { mountGamePage } from '@/test/mount-game-page'
import { GamePage, openGamePage } from '@/test/game-page'

describe('language toggle', () => {
  it('starts in Ukrainian with UA pressed (I18N-2, I18N-5)', async () => {
    const page = await mountGamePage()

    expect(page.get('button[lang="uk"]').attributes('aria-pressed')).toBe('true')
    expect(page.get('button[lang="en"]').attributes('aria-pressed')).toBe('false')
    expect(page.get('button[lang="en"]').attributes('aria-label')).toBe('English')
    expect(document.title).toBe('Точки й лінії')
  })

  it('switches the text, page language and tab title when EN is pressed (I18N-3, APP-1)', async () => {
    const page = await mountGamePage()

    await page.get('button[lang="en"]').trigger('click')

    expect(page.text()).toContain('Game Setup')
    expect(page.get('button[type="submit"]').text()).toBe('Save')
    expect(page.get('button[lang="en"]').attributes('aria-pressed')).toBe('true')
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe('Dots & Lines')
  })

  it('keeps the chosen language after a reload (I18N-4)', async () => {
    const page = await mountGamePage()
    await page.get('button[lang="en"]').trigger('click')
    page.unmount()

    const reloaded = await mountGamePage()

    expect(reloaded.text()).toContain('Game Setup')
    expect(document.documentElement.lang).toBe('en')
  })
})

describe('install manifest', () => {
  it('links the Ukrainian manifest on the first visit (VR-50)', async () => {
    const page = new GamePage(await mountGamePage())

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
