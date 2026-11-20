import { describe, expect, it } from 'vitest'
import { renderPrivacyPage } from '@/privacy-static'
import { PRIVACY_UPDATED } from '@/static'

// the static page Google Play links to: the in-app screen's text, both languages, no script (PV-4)
describe('static privacy page', () => {
  async function render() {
    const html = await renderPrivacyPage({
      stylesheet: '../assets/index-test.css',
      darkVars: '--wc-paper: #241c17 !important; ',
    })
    return new DOMParser().parseFromString(html, 'text/html')
  }

  it('shows the policy in English and Ukrainian, from the same content as the app', async () => {
    const doc = await render()

    const sections = [...doc.querySelectorAll('[data-privacy-content]')]
    expect(sections.map((s) => s.getAttribute('lang'))).toEqual(['en', 'uk'])
    expect(sections.map((s) => s.querySelector('h1, h2')?.textContent?.trim())).toEqual([
      'Privacy policy',
      'Політика конфіденційності',
    ])
    expect(doc.querySelectorAll('h1')).toHaveLength(1)
    expect(
      [...doc.querySelectorAll('[data-privacy-author]')].map((a) => a.textContent?.trim()),
    ).toEqual(['Created by Denys Slobodianyk', 'Створив Денис Слободяник'])
    expect(
      [...doc.querySelectorAll('time')].map((time) => time.getAttribute('datetime')),
    ).toEqual([PRIVACY_UPDATED, PRIVACY_UPDATED])
  })

  it('needs no JavaScript: no script, the app stylesheet, dark from the device', async () => {
    const doc = await render()

    expect(doc.querySelectorAll('script')).toHaveLength(0)
    expect(doc.querySelector('link[rel="stylesheet"]')?.getAttribute('href')).toBe(
      '../assets/index-test.css',
    )
    expect(doc.querySelector('style')?.textContent).toContain(
      '@media (prefers-color-scheme: dark)',
    )
    expect(doc.title).toBe('Privacy policy · Dots and Boxes')
  })

  it("has the app's header with the logo and the game's name, and no buttons", async () => {
    const doc = await render()

    const header = doc.querySelector('header')
    expect(header?.querySelector('[data-app-logo] svg')).not.toBeNull()
    expect(header?.querySelector('[data-app-title]')?.textContent?.trim()).toBe('Dots and Boxes')
    expect(header?.querySelectorAll('button')).toHaveLength(0)
  })

  it('links back to the game', async () => {
    const doc = await render()

    expect(doc.querySelector('[data-open-game]')?.getAttribute('href')).toBe('../')
  })
})
