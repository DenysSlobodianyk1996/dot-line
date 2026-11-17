import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CURRENT_GAME } from '@/static'
import { COMPUTER_NAME } from '@/models/computer-player.model'
import {
  ANNA,
  BOHDAN,
  COMPUTER,
  COMPUTER_DELAY_MS,
  openGamePage,
  startComputerGame,
  startGame,
} from '@/test/game-page'
import { flushPromises } from '@vue/test-utils'

// ANNA is #ff0000; the page reports colors as CSS rgb()
const RED = 'rgb(255, 0, 0)'

beforeEach(() => {
  // only the computer's pause is faked: flushPromises still needs a real setImmediate
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('setup in Versus computer mode', () => {
  it('opens in Versus computer mode and asks only for my name, color and the size (CM-1, CM-2, CM-4)', async () => {
    const page = await openGamePage()

    expect(page.selectedMode()).toBe('computer')
    expect(page.setupFieldsets()).toEqual(['You', 'Opponent'])
    expect(page.input('player1.name').exists()).toBe(true)
    expect(page.input('player1.color').exists()).toBe(true)
    expect(page.input('player2.name').exists()).toBe(false)
    expect(page.input('size').exists()).toBe(true)
  })

  it('shows the computer as the opponent, with a color far from mine (CM-9, CM-12)', async () => {
    const page = await openGamePage()

    await page.input('player1.color').setValue(ANNA.color)

    const opponent = page.setupOpponent()
    expect(opponent?.name).toBe(COMPUTER)
    expect(opponent?.color).toBeTruthy()
    expect(opponent?.color).not.toBe(RED)
  })

  it('keeps what I typed when I switch the game mode back and forth (CM-10)', async () => {
    const page = await openGamePage()
    await page.input('player1.name').setValue('Anna')
    await page.input('size').setValue('5')

    await page.chooseMode('twoPlayers')
    expect(page.setupFieldsets()).toEqual(['Player 1', 'Player 2'])
    await page.input('player2.name').setValue('Bohdan')
    await page.chooseMode('computer')
    await page.chooseMode('twoPlayers')

    expect(page.input('player1.name').element.value).toBe('Anna')
    expect(page.input('player2.name').element.value).toBe('Bohdan')
    expect(page.input('size').element.value).toBe('5')
  })

  it('does not compare my name with a hidden second player (CM-4)', async () => {
    const page = await openGamePage()
    await page.chooseMode('twoPlayers')
    await page.input('player2.name').setValue('Anna')
    await page.chooseMode('computer')

    await page.input('player1.name').setValue('Anna')
    await page.input('size').setValue('2')
    await page.wrapper.find('form').trigger('submit')
    await vi.waitFor(() => expect(page.isSetupShown).toBe(false))
  })
})

describe("my name can't be the computer's (CM-8)", () => {
  async function submitName(name: string, locale: 'en' | 'uk' = 'en') {
    const page = await openGamePage({ storage: { LOCALE: locale } })
    await page.input('player1.name').setValue(name)
    await page.input('size').setValue('2')
    await page.wrapper.find('form').trigger('submit')
    await flushPromises()
    return page
  }

  it.each(['Computer', 'computer', 'КОМП’ЮТЕР', "комп'ютер"])(
    'rejects "%s" with its own message',
    async (name) => {
      const page = await submitName(name)

      expect(page.isSetupShown).toBe(true)
      expect(page.wrapper.text()).toContain('This name belongs to the computer')
    },
  )

  it('shows the message in Ukrainian', async () => {
    const page = await submitName('Computer', 'uk')

    expect(page.isSetupShown).toBe(true)
    expect(page.wrapper.text()).toContain('Це ім’я належить комп’ютеру')
  })

  it('allows the name in Two players mode', async () => {
    const page = await startGame({ player1: { name: 'Computer', color: '#ff0000' } })

    expect(page.isSetupShown).toBe(false)
  })
})

describe('the rules read the same in both modes (CM-35, RL-5)', () => {
  const rulesText = (page: Awaited<ReturnType<typeof openGamePage>>) =>
    page.wrapper.get('section ol').text()

  it('says "take turns" and "the other player", never "two players"', async () => {
    const page = await openGamePage()
    const computerRules = rulesText(page)
    await page.chooseMode('twoPlayers')

    expect(rulesText(page)).toBe(computerRules)
    expect(computerRules).toContain('Take turns')
    expect(computerRules).toContain('the other player')
    expect(computerRules.toLowerCase()).not.toContain('two players')
  })

  it('reads neutrally in Ukrainian too', async () => {
    const page = await openGamePage({ storage: { LOCALE: 'uk' } })
    const rules = rulesText(page)

    expect(rules).toContain('Гравці по черзі')
    expect(rules).toContain('іншого гравця')
    expect(rules.toLowerCase()).not.toContain('двоє')
    expect(rules.toLowerCase()).not.toContain('два гравці')
  })
})

describe('difficulty', () => {
  it('offers Easy and Normal only in Versus computer mode, Normal by default (CM-5, CM-6, CM-7)', async () => {
    const page = await openGamePage()
    expect(page.selectedDifficulty()).toBe('normal')

    await page.chooseMode('twoPlayers')
    expect(page.hasDifficultySwitch).toBe(false)

    await page.chooseMode('computer')
    await page.chooseDifficulty('easy')
    expect(page.selectedDifficulty()).toBe('easy')
  })

  it('starts the game at the chosen difficulty (CM-5, CM-30)', async () => {
    await startComputerGame({ difficulty: 'normal', first: 1 })

    expect(JSON.parse(localStorage.getItem(CURRENT_GAME)!).difficulty).toBe('normal')
  })

  it('Rematch keeps the game mode, difficulty, players and size (CM-28)', async () => {
    const page = await startComputerGame({ difficulty: 'easy', size: 3, first: 1 })
    await page.stopGame()

    await page.rematch(1)

    const saved = JSON.parse(localStorage.getItem(CURRENT_GAME)!)
    expect(saved).toMatchObject({ gameMode: 'computer', difficulty: 'easy', size: 3 })
    expect(page.scores()).toEqual({ Anna: 0, [COMPUTER]: 0 })
    expect(page.dotCount).toBe(16)
  })
})

describe('remembered choices', () => {
  it('a first visit opens in Versus computer on Normal (CM-2, CM-7)', async () => {
    const page = await openGamePage()

    expect(page.selectedMode()).toBe('computer')
    expect(page.selectedDifficulty()).toBe('normal')
  })

  it('New game preselects the last game mode and difficulty (CM-29)', async () => {
    const page = await startComputerGame({ difficulty: 'easy', first: 1 })
    await page.stopGame()

    await page.newGame()

    expect(page.selectedMode()).toBe('computer')
    expect(page.selectedDifficulty()).toBe('easy')
  })

  it('the next visit opens in the last game mode, keeping the last difficulty (CM-3, CM-7)', async () => {
    const first = await startComputerGame({ difficulty: 'easy', first: 1 })
    await first.stopGame()
    await first.newGame()
    await first.chooseMode('twoPlayers')
    await first.submitSetup({
      mode: 'twoPlayers',
      player1: ANNA,
      player2: BOHDAN,
      size: 2,
      first: 1,
    })
    await first.stopGame()
    await first.newGame()

    const next = await first.reload()
    expect(next.selectedMode()).toBe('twoPlayers')

    await next.chooseMode('computer')
    expect(next.selectedDifficulty()).toBe('easy')
  })

  it('a mode switched in setup without starting a game is not remembered (CM-3)', async () => {
    const page = await openGamePage()
    await page.chooseMode('twoPlayers')

    const next = await page.reload()

    expect(next.selectedMode()).toBe('computer')
  })
})

describe('playing against the computer', () => {
  it('waits about a second on its turn with the board locked, then draws one line (CM-15, CM-16, CM-20)', async () => {
    const page = await startComputerGame({ first: 1 })
    expect(page.turn()).toBe('Anna')
    expect(page.isBoardLocked).toBe(false)

    await page.drawAnyLine()

    expect(page.turn()).toBe(COMPUTER)
    expect(page.isBoardLocked).toBe(true)
    await page.waitForComputer(COMPUTER_DELAY_MS - 1)
    expect(page.lineCount).toBe(1)

    await page.waitForComputer(1)

    expect(page.lineCount).toBe(2)
    expect(page.turn()).toBe('Anna')
    expect(page.isBoardLocked).toBe(false)
  })

  it('ignores my clicks during its turn (CM-16)', async () => {
    const page = await startComputerGame({ first: 2 })

    await page.clickDot([0, 0])
    await page.clickDot([0, 1])

    expect(page.lineCount).toBe(0)
    expect(page.dotsIn('selected')).toEqual([])
  })

  it('moves on its own when it is picked to go first (CM-11)', async () => {
    const page = await startComputerGame({ first: 2 })
    expect(page.turn()).toBe(COMPUTER)

    await page.waitForComputer()

    expect(page.lineCount).toBe(1)
    expect(page.turn()).toBe('Anna')
  })

  it('shows its name in my language and follows the language toggle (CM-12)', async () => {
    const page = await startComputerGame({ first: 2 })
    expect(page.scores()).toEqual({ Anna: 0, [COMPUTER]: 0 })

    await page.wrapper.get('button[lang="uk"]').trigger('click')

    expect(page.wrapper.text()).toContain('Комп’ютер')
    expect(page.wrapper.text()).not.toContain(COMPUTER)
  })

  it('draws its lines in a color different from mine (CM-9, CM-21)', async () => {
    const page = await startComputerGame({ first: 2 })

    await page.waitForComputer()

    const [line] = page.wrapper.findAll<HTMLElement>('.rounded-\\[2px\\]')
    expect(line?.element.style.backgroundColor).toBeTruthy()
    expect(line?.element.style.backgroundColor).not.toBe(RED)
  })

  it('plays to the end: the game finishes when the last square is owned (CM-21, CM-26)', async () => {
    const page = await startComputerGame({ first: 1, size: 2 })

    for (let turn = 0; turn < 12 && !page.isResultShown; turn++) {
      await page.drawAnyLine()
      if (!page.isResultShown) await page.waitForComputer()
    }

    expect(page.isResultShown).toBe(true)
    expect(page.lineCount).toBe(12)
    const scores = Object.values(page.scores())
    expect(scores.reduce((a, b) => a + b, 0)).toBe(4)
  })
})

describe('stopping and starting again', () => {
  it('Stop during its turn cancels its pending move (CM-17)', async () => {
    const page = await startComputerGame({ first: 2 })

    await page.stopGame()
    await page.waitForComputer()

    expect(page.isResultShown).toBe(true)
    expect(page.lineCount).toBe(0)
  })

  it('a Rematch the computer opens makes it move on its own, once (CM-28)', async () => {
    const page = await startComputerGame({ first: 2 })
    await page.stopGame()

    await page.rematch(2)
    await page.waitForComputer()

    expect(page.lineCount).toBe(1)
    expect(page.turn()).toBe('Anna')
    expect(page.scores()).toEqual({ Anna: 0, [COMPUTER]: 0 })
  })

  it('New game goes to setup and the computer does not move afterwards (CM-29)', async () => {
    const page = await startComputerGame({ first: 2 })
    await page.stopGame()

    await page.newGame()
    await page.waitForComputer()

    expect(page.isSetupShown).toBe(true)
    expect(page.selectedMode()).toBe('computer')
  })
})

describe('saving and reloading', () => {
  it('saves the game mode and difficulty with the game (CM-30)', async () => {
    await startComputerGame({ difficulty: 'easy', first: 1 })

    const saved = JSON.parse(localStorage.getItem(CURRENT_GAME)!)
    expect(saved.gameMode).toBe('computer')
    expect(saved.difficulty).toBe('easy')
  })

  it('a reload during its turn resumes the game and the computer moves (CM-31)', async () => {
    const page = await startComputerGame({ first: 1 })
    await page.drawAnyLine()

    const reloaded = await page.reload()
    expect(reloaded.lineCount).toBe(1)
    expect(reloaded.turn()).toBe(COMPUTER)
    expect(reloaded.isBoardLocked).toBe(true)

    await reloaded.waitForComputer()

    expect(reloaded.lineCount).toBe(2)
    expect(reloaded.turn()).toBe('Anna')
  })

  it('loads a game saved before game modes as Two players (CM-33)', async () => {
    const legacy = {
      player1: ANNA,
      player2: BOHDAN,
      size: 2,
      lines: [],
      dirtySquares: [],
      currentPlayerName: 'Anna',
      status: 'playing',
      finishReason: null,
    }
    const page = await openGamePage({ storage: { [CURRENT_GAME]: legacy } })

    await page.drawAnyLine()
    await page.waitForComputer()

    expect(page.turn()).toBe('Bohdan')
    expect(page.lineCount).toBe(1)
    expect(page.isBoardLocked).toBe(false)
  })
})

describe('the result speaks to me (CM-27)', () => {
  // a stopped 2x2 Versus computer game where I own `mine` squares and the computer owns `its`
  function finishedGame(mine: number, its: number) {
    const owners = [...Array(mine).fill(ANNA.name), ...Array(its).fill(COMPUTER_NAME)]
    return {
      player1: ANNA,
      player2: { name: COMPUTER_NAME, color: '#00ff00' },
      size: 2,
      lines: [],
      dirtySquares: owners.map((ownerName, i) => ({
        row: Math.floor(i / 2),
        col: i % 2,
        ownerName,
      })),
      currentPlayerName: ANNA.name,
      status: 'finished',
      finishReason: 'stopped',
      gameMode: 'computer',
      difficulty: 'easy',
    }
  }

  it('says "You won!" when I win, with both scores', async () => {
    const page = await openGamePage({ storage: { [CURRENT_GAME]: finishedGame(2, 1) } })

    expect(page.resultHeadline()).toBe('You won!')
    expect(page.scores()).toEqual({ Anna: 2, [COMPUTER]: 1 })
  })

  it('says "Computer won" when the computer wins, with both scores', async () => {
    const page = await openGamePage({ storage: { [CURRENT_GAME]: finishedGame(1, 2) } })

    expect(page.resultHeadline()).toBe('Computer won')
    expect(page.scores()).toEqual({ [COMPUTER]: 2, Anna: 1 })
  })

  it('says "Draw" on equal scores', async () => {
    const page = await openGamePage({ storage: { [CURRENT_GAME]: finishedGame(1, 1) } })

    expect(page.resultHeadline()).toBe('Draw')
    expect(page.scores()).toEqual({ Anna: 1, [COMPUTER]: 1 })
  })

  it('says it in Ukrainian too', async () => {
    const won = await openGamePage({
      storage: { LOCALE: 'uk', [CURRENT_GAME]: finishedGame(2, 1) },
    })
    expect(won.wrapper.get('h3').text()).toBe('Ви перемогли!')

    const lost = await openGamePage({
      storage: { LOCALE: 'uk', [CURRENT_GAME]: finishedGame(0, 2) },
    })
    expect(lost.wrapper.get('h3').text()).toBe('Комп’ютер переміг')
  })
})
