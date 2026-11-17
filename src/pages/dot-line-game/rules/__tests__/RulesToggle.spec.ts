import { describe, expect, it } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mountGamePage } from '@/test/mount-game-page'

const playingGame = {
  player1: { name: 'Alice', color: '#ff0000' },
  player2: { name: 'Bob', color: '#0000ff' },
  size: 3,
  lines: [],
  dirtySquares: [],
  currentPlayerName: 'Alice',
  status: 'playing',
  finishReason: null,
}

function rulesButton(page: VueWrapper) {
  const button = page
    .findAll('button')
    .find((b) => ['Показати правила', 'Сховати правила'].includes(b.text()))
  if (!button) throw new Error('No rules toggle')
  return button
}

function rulesPanel(page: VueWrapper) {
  return page.get<HTMLElement>(`[id="${rulesButton(page).attributes('aria-controls')}"]`)
}

describe('rules toggle', () => {
  it('shows the rules by default on the setup screen (RL-2, RL-3, RL-4)', async () => {
    const page = await mountGamePage()

    expect(rulesButton(page).text()).toBe('Сховати правила')
    expect(rulesButton(page).attributes('aria-expanded')).toBe('true')
    expect(rulesPanel(page).isVisible()).toBe(true)
    expect(rulesPanel(page).text()).toContain('Як грати')
  })

  it('hides the rules when pressed on the setup screen (RL-3, RL-4)', async () => {
    const page = await mountGamePage()

    await rulesButton(page).trigger('click')

    expect(rulesButton(page).text()).toBe('Показати правила')
    expect(rulesButton(page).attributes('aria-expanded')).toBe('false')
    expect(rulesPanel(page).isVisible()).toBe(false)
  })

  it('hides the rules by default in a game and shows them when pressed (RL-2, RL-3, RL-4)', async () => {
    const page = await mountGamePage({ storage: { CURRENT_GAME: playingGame } })
    expect(page.find('form').exists()).toBe(false)

    expect(rulesButton(page).text()).toBe('Показати правила')
    expect(rulesButton(page).attributes('aria-expanded')).toBe('false')
    expect(rulesPanel(page).isVisible()).toBe(false)

    await rulesButton(page).trigger('click')

    expect(rulesButton(page).text()).toBe('Сховати правила')
    expect(rulesButton(page).attributes('aria-expanded')).toBe('true')
    expect(rulesPanel(page).isVisible()).toBe(true)
  })
})
