import { describe, expect, it } from 'vitest'
import { mountGamePage } from '@/test/mount-game-page'
import { GamePage, openGamePage } from '@/test/game-page'

async function openOn(deviceLanguage: string, storage: Record<string, string> = {}) {
  return new GamePage(await mountGamePage({ deviceLanguage, storage }))
}

describe('language button', () => {
  it('shows UA and offers English, in English, on a Ukrainian device (I18N-2, I18N-3, I18N-5, NG-3, NG-4)', async () => {
    const page = await openOn('uk-UA')

    expect(page.languageButtonState()).toEqual({
      text: 'UA',
      label: 'Switch to English',
      labelLang: 'en',
    })
    expect(document.title).toBe('Крапки й квадрати')
  })

  it('switches the text, page language, tab title and manifest with one tap (I18N-3, APP-1, UP-15, NG-3)', async () => {
    const page = await openOn('uk-UA')

    await page.clickLanguageButton()

    expect(page.text()).toContain('Settings')
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe('Dots and Boxes')
    expect(page.manifestHref()).toBe('/manifest.en.webmanifest')
    expect(page.languageButtonState()).toEqual({
      text: 'EN',
      label: 'Перейти на українську',
      labelLang: 'uk',
    })
  })

  it('switches back with a second tap (I18N-3, NG-3)', async () => {
    const page = await openOn('uk-UA')

    await page.clickLanguageButton()
    await page.clickLanguageButton()

    expect(document.documentElement.lang).toBe('uk')
    expect(page.languageButtonState().text).toBe('UA')
  })

  it('keeps the chosen language after a reload (I18N-4)', async () => {
    const page = await openOn('uk-UA')
    await page.clickLanguageButton()
    page.wrapper.unmount()

    const reloaded = await openOn('uk-UA')

    expect(reloaded.text()).toContain('Settings')
    expect(document.documentElement.lang).toBe('en')
    expect(reloaded.languageButtonState().text).toBe('EN')
  })

  it('shows the short name in the header in both languages (HD-2, NG-1)', async () => {
    const page = await openOn('uk-UA')
    expect(page.headerTitle()).toBe('Крапки й квадрати')

    await page.clickLanguageButton()
    expect(page.headerTitle()).toBe('Dots and Boxes')
  })
})

describe('first launch follows the device language', () => {
  it('picks Ukrainian on a uk-UA device (I18N-2, AR-6)', async () => {
    const page = await openOn('uk-UA')

    expect(page.languageButtonState().text).toBe('UA')
    expect(document.documentElement.lang).toBe('uk')
    expect(document.title).toBe('Крапки й квадрати')
    expect(page.manifestHref()).toBe('/manifest.uk.webmanifest')
  })

  it.each(['en-US', 'de-DE'])('picks English on a %s device (I18N-2, AR-6)', async (language) => {
    const page = await openOn(language)

    expect(page.text()).toContain('Settings')
    expect(page.languageButtonState().text).toBe('EN')
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe('Dots and Boxes')
    expect(page.manifestHref()).toBe('/manifest.en.webmanifest')
  })

  it('keeps a saved language over the device language (I18N-4, AR-7)', async () => {
    const page = await openOn('en-US', { LOCALE: 'uk' })

    expect(page.languageButtonState().text).toBe('UA')
    expect(document.documentElement.lang).toBe('uk')
    expect(document.title).toBe('Крапки й квадрати')
  })
})

describe('install manifest', () => {
  it('links the Ukrainian manifest on the first visit from a Ukrainian device (VR-50)', async () => {
    const page = await openOn('uk-UA')

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
