import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPUTER, openGamePage, startComputerGame, startGame, YOUR_TURN } from '@/test/game-page'

const RULES_EN = [
  'Take turns drawing a line between two neighboring dots: left, right, up or down.',
  'The first line can go anywhere. After that, start from a dot that already has a line.',
  'Draw the fourth side of a square to claim it. One line can claim two squares.',
  'After every line, the turn passes to the other player.',
  'The game ends when all squares are claimed or someone presses Stop. Most squares wins; equal scores are a draw.',
]

describe('rules panel', () => {
  it('opens from the info button in the header on the setup screen (VR-23)', async () => {
    const page = await openGamePage()
    expect(page.isRulesOpen()).toBe(false)

    await page.openRules()

    expect(page.isRulesOpen()).toBe(true)
    expect(page.rulesPanelName()).toBe('How to play')
  })

  it('opens from the header during a game too (VR-23)', async () => {
    const page = await startGame()

    await page.openRules()

    expect(page.isRulesOpen()).toBe(true)
  })

  it('is closed by default on both screens, with no rules shown inline (VR-27, VR-28)', async () => {
    const page = await openGamePage()
    expect(page.isRulesOpen()).toBe(false)
    expect(page.hasInlineRules()).toBe(false)
    expect(page.hasButton('Show rules')).toBe(false)
    expect(page.text()).not.toContain('How to play')

    await page.submitSetup({
      mode: 'twoPlayers',
      player1: { name: 'Anna', color: '#ff0000' },
      player2: { name: 'Bohdan', color: '#0000ff' },
      size: 2,
      first: 1,
    })
    expect(page.isSetupShown).toBe(false)
    expect(page.isRulesOpen()).toBe(false)
    expect(page.hasInlineRules()).toBe(false)
    expect(page.text()).not.toContain('How to play')
  })

  it.each(['button', 'backdrop', 'escape'] as const)('closes with %s (VR-26)', async (how) => {
    const page = await openGamePage()
    await page.openRules()

    await page.closeRules(how)

    expect(page.isRulesOpen()).toBe(false)
  })

  it('shows the five rules unchanged (VR-30)', async () => {
    const page = await openGamePage()

    await page.openRules()

    expect(page.rulesPoints()).toEqual(RULES_EN)
  })

  it('shows the rules in Ukrainian with a Ukrainian title (VR-30)', async () => {
    const page = await openGamePage({ storage: { LOCALE: 'uk' } })

    await page.openRules()

    expect(page.rulesPanelName()).toBe('Як грати')
    expect(page.rulesText()).toContain('Гравці по черзі')
  })
})

describe('rules panel for keyboard and screen reader (VR-29)', () => {
  it('the info button reports whether the panel is open', async () => {
    const page = await openGamePage()
    expect(page.rulesButtonState()).toEqual({ label: 'Rules', expanded: 'false' })

    await page.openRules()
    expect(page.rulesButtonState()).toEqual({ label: 'Rules', expanded: 'true' })

    await page.closeRules('button')
    expect(page.rulesButtonState()).toEqual({ label: 'Rules', expanded: 'false' })
  })

  it('moves focus into the panel on open and keeps it there on Tab and Shift+Tab', async () => {
    const page = await openGamePage()

    await page.openRules()
    expect(page.focus()).toBe('rules panel')

    await page.pressTab()
    expect(page.focus()).toBe('rules panel')
    await page.pressTab()
    expect(page.focus()).toBe('rules panel')
    await page.pressTab({ shift: true })
    expect(page.focus()).toBe('rules panel')
  })

  it.each(['button', 'backdrop', 'escape'] as const)(
    'returns focus to the info button after closing with %s',
    async (how) => {
      const page = await openGamePage()
      await page.openRules()

      await page.closeRules(how)

      expect(page.focus()).toBe('info button')
    },
  )
})

describe('rules panel on the computer turn (VR-31)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("the computer waits while the panel is open and moves after it's closed", async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const page = await startComputerGame({ first: 2 })

    await page.openRules()
    await page.waitForComputer(5000)
    expect(page.lineCount).toBe(0)
    expect(page.turn()).toBe(COMPUTER)

    await page.closeRules('escape')
    expect(page.lineCount).toBe(0)
    await page.waitForComputer()
    expect(page.lineCount).toBe(1)
    expect(page.turn()).toBe(YOUR_TURN)
  })
})
