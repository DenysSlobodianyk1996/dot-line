import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COMPUTER_NAME } from '@/models'
import { CURRENT_GAME } from '@/static'
import {
  ANNA,
  BOHDAN,
  COMPUTER,
  COMPUTER_DELAY_MS,
  openGamePage,
  startComputerGame,
  THINKING,
  YOUR_TURN,
} from '@/test/game-page'

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

describe('playing against the computer', () => {
  it('waits about a second on its turn with the board locked, then draws one line (CM-15, CM-16, CM-20)', async () => {
    const page = await startComputerGame({ first: 1 })
    expect(page.turn()).toBe(YOUR_TURN)
    expect(page.isBoardLocked).toBe(false)

    await page.drawAnyLine()

    expect(page.turn()).toBe(COMPUTER)
    expect(page.isBoardLocked).toBe(true)
    await page.waitForComputer(COMPUTER_DELAY_MS - 1)
    expect(page.lineCount).toBe(1)

    await page.waitForComputer(1)

    expect(page.lineCount).toBe(2)
    expect(page.turn()).toBe(YOUR_TURN)
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
    expect(page.turn()).toBe(YOUR_TURN)
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

  it('draws a line whose valid end comes second, e.g. up from a drawn line (CM-20)', async () => {
    // Anna drew [1,0]-[1,1]; the computer's first legal move is [0,0]-[1,0], which starts at [1,0]
    const saved = {
      player1: ANNA,
      player2: { name: COMPUTER_NAME, color: '#32a06e' },
      size: 2,
      lines: [{ from: { row: 1, col: 0 }, to: { row: 1, col: 1 }, ownerName: 'Anna' }],
      dirtySquares: [],
      currentPlayerName: COMPUTER_NAME,
      status: 'playing',
      finishReason: null,
      gameMode: 'computer',
      difficulty: 'easy',
    }
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const page = await openGamePage({ storage: { [CURRENT_GAME]: saved } })

    await page.waitForComputer()

    expect(page.lineCount).toBe(2)
    expect(page.turn()).toBe(YOUR_TURN)
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
    expect(page.turn()).toBe(YOUR_TURN)
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
    await startComputerGame({ first: 1 })

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
    expect(reloaded.turn()).toBe(YOUR_TURN)
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

describe("the computer's turn on screen", () => {
  it('shows a pulsing "Thinking…" in a polite live region in place of the hint (CM-14, CM-37)', async () => {
    const page = await startComputerGame({ first: 2 })

    expect(page.turn()).toBe(COMPUTER)
    expect(page.thinking()).toBe(THINKING)
    expect(page.isThinkingPulsing()).toBe(true)
    expect(page.hasHint()).toBe(false)

    await page.waitForComputer()

    expect(page.thinking()).toBe('')
    expect(page.hasHint()).toBe(true)
  })

  it('says "Your turn" on my turn (CM-19)', async () => {
    const page = await startComputerGame({ first: 1 })

    expect(page.turn()).toBe(YOUR_TURN)
    expect(page.thinking()).toBe('')
  })

  it('marks the computer with a robot icon in the turn, scores and Stop dialog (CM-13)', async () => {
    const page = await startComputerGame({ first: 2 })

    expect(page.robotsIn('Turn')).toEqual([COMPUTER])
    expect(page.robotsIn('Score')).toEqual([COMPUTER])
    await page.click('Stop')
    expect(page.robotsIn('dialog')).toEqual([COMPUTER])
  })

  it('marks the computer in the result scores, and beside the heading when it wins (CM-13)', async () => {
    // a stopped game the computer leads by one square
    const computer = { name: COMPUTER_NAME, color: '#32a06e' }
    const side = (from: [number, number], to: [number, number]) => ({
      from: { row: from[0], col: from[1] },
      to: { row: to[0], col: to[1] },
      ownerName: COMPUTER_NAME,
    })
    const finished = {
      player1: ANNA,
      player2: computer,
      size: 2,
      lines: [
        side([0, 0], [0, 1]),
        side([0, 1], [1, 1]),
        side([1, 1], [1, 0]),
        side([1, 0], [0, 0]),
      ],
      dirtySquares: [{ row: 0, col: 0, ownerName: COMPUTER_NAME }],
      currentPlayerName: 'Anna',
      status: 'finished',
      finishReason: 'stopped',
      gameMode: 'computer',
      difficulty: 'easy',
    }
    const page = await openGamePage({ storage: { [CURRENT_GAME]: finished } })
    expect(page.isResultShown).toBe(true)
    expect(page.scores()).toEqual({ [COMPUTER]: 1, Anna: 0 })

    // beside the heading, whatever its wording (#17)
    const [heading, ...rest] = page.robotsIn('Result')
    expect(heading).toMatch(/Computer/)
    expect(rest).toEqual([])
    expect(page.robotsIn('Score')).toEqual([COMPUTER])
  })

  it('shows the robot in the setup Opponent field (CM-13)', async () => {
    const page = await openGamePage()

    expect(page.setupOpponent()?.hasRobot).toBe(true)
  })

  it('shows no robot and no "Your turn" in a Two players game', async () => {
    const page = await openGamePage()
    await page.submitSetup({
      mode: 'twoPlayers',
      player1: ANNA,
      player2: BOHDAN,
      size: 2,
      first: 1,
    })

    expect(page.turn()).toBe('Anna')
    expect(page.robotsIn('Score')).toEqual([])
  })

  it("highlights the computer's last line until I draw (CM-18)", async () => {
    const page = await startComputerGame({ first: 2 })
    await page.waitForComputer()

    expect(page.lineCount).toBe(1)
    expect(page.highlightedLineCount).toBe(1)

    await page.drawAnyLine()

    expect(page.highlightedLineCount).toBe(0)
    await page.waitForComputer()
    expect(page.highlightedLineCount).toBe(1)
  })

  it("keeps the computer's line highlighted after a reload on my turn (CM-32)", async () => {
    const page = await startComputerGame({ first: 2 })
    await page.waitForComputer()

    const reloaded = await page.reload()

    expect(reloaded.turn()).toBe(YOUR_TURN)
    expect(reloaded.highlightedLineCount).toBe(1)
  })

  it('drops the highlight once the game is over (CM-18)', async () => {
    const page = await startComputerGame({ first: 2 })
    await page.waitForComputer()

    await page.stopGame()

    expect(page.highlightedLineCount).toBe(0)
  })

  it('shows the new texts in Ukrainian (CM-36)', async () => {
    const page = await startComputerGame({ first: 2 })
    await page.wrapper.get('button[lang="uk"]').trigger('click')

    expect(page.wrapper.text()).toContain('Думає…')
    await page.waitForComputer()
    expect(page.wrapper.text()).toContain('Ваш хід')
  })
})
