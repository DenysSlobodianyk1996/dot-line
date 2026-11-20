import { describe, expect, it } from 'vitest'
import { openGamePage } from '@/test/game-page'
import { APP_VERSION, PRIVACY_UPDATED } from '@/static'
import { formatPrivacyDate } from '@/utils'

const EMAIL = 'mailto:denys.slobodianyk@gmail.com'
const ISSUES = 'https://github.com/DenysSlobodianyk1996/dots-and-boxes/issues'

describe('privacy screen', () => {
  it('opens from the footer, in the interface language, inside the app (PV-1, PV-2, FT-4)', async () => {
    const page = await openGamePage()

    await page.openPrivacy()

    expect(page.privacyScreen()).toEqual({
      lang: 'en',
      title: 'Privacy policy',
      updated: `Updated: ${formatPrivacyDate(PRIVACY_UPDATED, 'en')}`,
      version: `Version: ${APP_VERSION}`,
      author: 'Created by Denys Slobodianyk',
      links: [EMAIL, ISSUES],
      back: 'Back to the game',
    })
    expect(page.footerLinks()).toBeNull()
  })

  it('follows the language (PV-2)', async () => {
    const page = await openGamePage()
    await page.openPrivacy()

    await page.switchLanguage('uk')

    expect(page.privacyScreen()).toMatchObject({
      lang: 'uk',
      title: 'Політика конфіденційності',
      updated: `Оновлено: ${formatPrivacyDate(PRIVACY_UPDATED, 'uk')}`,
      version: `Версія: ${APP_VERSION}`,
      author: 'Створив Денис Слободяник',
      back: 'Назад до гри',
    })
  })

  it('goes back to the setup screen (PV-3)', async () => {
    const page = await openGamePage()
    await page.openPrivacy()

    await page.closePrivacy()

    expect(page.privacyScreen()).toBeNull()
    expect(page.footerLinks()?.map((link) => link.text)).toEqual(['Privacy', 'Contact'])
  })
})
