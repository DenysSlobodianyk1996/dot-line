import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ANNA,
  BOHDAN,
  COMPUTER,
  openGamePage,
  startComputerGame,
  startGame,
  YOUR_TURN,
} from '@/test/game-page'

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
    expect(page.text()).not.toContain(RULES_EN[0])

    await page.submitSetup({
      mode: 'twoPlayers',
      player1: ANNA,
      player2: BOHDAN,
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

const GOAL = {
  en: {
    sentence: 'Dots and Boxes — whoever owns more squares when the board is full wins.',
    name: 'Dots and Boxes',
    link: 'How to play →',
    title: 'Settings',
  },
  uk: {
    sentence: 'Крапки й квадрати — перемагає той, у кого більше квадратів, коли поле заповниться.',
    name: 'Крапки й квадрати',
    link: 'Як грати →',
    title: 'Налаштування',
  },
} as const

describe('game goal on setup (NG-5, NG-6, NG-8)', () => {
  it.each(['en', 'uk'] as const)(
    'opens with the goal, the game name in bold, then How to play, then Settings (%s)',
    async (locale) => {
      const page = await openGamePage({ storage: { LOCALE: locale } })

      expect(page.setupIntro()).toEqual({
        sentence: GOAL[locale].sentence,
        boldName: GOAL[locale].name,
        link: { text: GOAL[locale].link, atEnd: true, tapHeight44BelowSm: true },
        title: GOAL[locale].title,
        titleAfterGoal: true,
        titleAboveForm: true,
      })
    },
  )

  it('opens the rules panel from the How to play link', async () => {
    const page = await openGamePage()

    await page.openRules({ from: 'how to play' })

    expect(page.isRulesOpen()).toBe(true)
    expect(page.rulesPanelName()).toBe('How to play')
  })

  it.each(['button', 'backdrop', 'escape'] as const)(
    'returns focus to the How to play link after closing with %s (UP-2)',
    async (how) => {
      const page = await openGamePage()
      await page.openRules({ from: 'how to play' })

      await page.closeRules(how)

      expect(page.focus()).toBe('how to play link')
    },
  )

  it('still returns focus to the header button when that one opened the panel (UP-2)', async () => {
    const page = await openGamePage()
    await page.openRules({ from: 'how to play' })
    await page.closeRules('escape')

    await page.openRules({ from: 'header' })
    await page.closeRules('escape')

    expect(page.focus()).toBe('info button')
  })

  it('has no info button of its own: only the header one opens the rules (NG-9)', async () => {
    const page = await openGamePage()

    expect(page.rulesInfoButtons()).toEqual(['header'])
  })

  it('is not on the game screen', async () => {
    const page = await startGame()

    expect(page.setupIntro()).toBeNull()
  })
})

describe('game goal in the rules panel (NG-7)', () => {
  it.each(['en', 'uk'] as const)(
    'starts with the same sentence, before the steps (%s)',
    async (locale) => {
      const page = await openGamePage({ storage: { LOCALE: locale } })

      await page.openRules()

      expect(page.rulesGoal()).toEqual({
        sentence: GOAL[locale].sentence,
        boldName: GOAL[locale].name,
        firstBeforeSteps: true,
      })
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
