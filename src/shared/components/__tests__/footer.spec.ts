import { describe, expect, it } from 'vitest'
import { openGamePage, startGame } from '@/test/game-page'

const CONTACT =
  'mailto:denys.slobodianyk@gmail.com?subject=Contact%20support%20from%20Dots%20and%20Boxes'

describe('footer', () => {
  it('ends the setup screen with Privacy and Contact, nothing else (FT-1, FT-4)', async () => {
    const page = await openGamePage()

    expect(page.footerLinks()).toEqual([
      { text: 'Privacy', href: '/privacy-policy', tall: true },
      { text: 'Contact', href: CONTACT, tall: true },
    ])
  })

  it('is not on the game screen, in progress or finished (FT-2)', async () => {
    const page = await startGame()
    expect(page.footerLinks()).toBeNull()

    await page.stopGame()
    expect(page.footerLinks()).toBeNull()
  })

  it('follows the language; the email subject stays in English (FT-1, FT-3)', async () => {
    const page = await openGamePage()

    await page.switchLanguage('uk')

    expect(page.footerLinks()?.map(({ text, href }) => ({ text, href }))).toEqual([
      { text: 'Конфіденційність', href: '/privacy-policy' },
      { text: 'Зв’язатися', href: CONTACT },
    ])
  })

  it('comes back with the setup screen after a game (FT-2)', async () => {
    const page = await startGame()
    await page.stopGame()

    await page.openSettings()

    expect(page.footerLinks()?.map((link) => link.text)).toEqual(['Privacy', 'Contact'])
  })
})
