import { describe, expect, it } from 'vitest'
import { mountGamePage } from '@/test/mount-game-page'

describe('game page', () => {
  it('shows the setup form in Ukrainian on a first visit from a Ukrainian device (AR-6)', async () => {
    const page = await mountGamePage({ deviceLanguage: 'uk-UA' })

    expect(page.text()).toContain('Налаштування гри')
    expect(page.find('form').exists()).toBe(true)
    expect(page.find('button[type="submit"]').text()).toBe('Зберегти')
    expect(document.documentElement.lang).toBe('uk')
  })
})
