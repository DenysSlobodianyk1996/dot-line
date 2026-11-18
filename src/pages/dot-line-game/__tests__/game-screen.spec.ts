import { describe, expect, it } from 'vitest'
import { CURRENT_GAME } from '@/static'
import { ANNA, BOHDAN, startGame, SWATCHES, type DotPosition } from '@/test/game-page'

// ANNA plays in coral and BOHDAN in sky
const CORAL = SWATCHES.coral.rgb
const SKY = SWATCHES.sky.rgb

// Bohdan closes the top-left square; Anna is to move
const BOHDAN_OWNS_ONE: [DotPosition, DotPosition][] = [
  [
    [0, 0],
    [0, 1],
  ], // Anna
  [
    [0, 0],
    [1, 0],
  ], // Bohdan
  [
    [0, 1],
    [1, 1],
  ], // Anna
  [
    [1, 0],
    [1, 1],
  ], // Bohdan closes square 0,0
]

// a whole 2x2 game, Anna first: the outer ring, then the inside; each player closes two squares
const FULL_GAME_DRAW: [DotPosition, DotPosition][] = [
  [
    [0, 0],
    [0, 1],
  ],
  [
    [0, 1],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
  ],
  [
    [0, 2],
    [1, 2],
  ],
  [
    [1, 0],
    [2, 0],
  ],
  [
    [1, 2],
    [2, 2],
  ],
  [
    [2, 0],
    [2, 1],
  ],
  [
    [2, 1],
    [2, 2],
  ],
  [
    [0, 1],
    [1, 1],
  ],
  [
    [1, 1],
    [2, 1],
  ],
  [
    [1, 0],
    [1, 1],
  ], // Anna closes squares 0,0 and 1,0
  [
    [1, 1],
    [1, 2],
  ], // Bohdan closes squares 0,1 and 1,1
]

describe('game screen: board (MV-4..8)', () => {
  it('starts with every dot highlighted as a valid start and the chosen player to move (MV-1, MV-4, GB-4)', async () => {
    const page = await startGame({ size: 2, first: 2 })

    expect(page.dotCount).toBe(9)
    expect(page.dotsIn('start')).toHaveLength(9)
    expect(page.turn()).toBe(BOHDAN.name)
    expect(page.scores()).toEqual({ [ANNA.name]: 0, [BOHDAN.name]: 0 })
  })
  it('selecting Dot1 marks it and highlights its free neighbors as Dot2 targets (MV-5)', async () => {
    const page = await startGame()

    await page.clickDot([1, 1])

    expect(page.dotState([1, 1])).toBe('selected')
    expect(page.dotsIn('target')).toEqual([
      [0, 1],
      [1, 0],
      [1, 2],
      [2, 1],
    ])
  })

  it('clicking the selected dot again cancels the selection (MV-6)', async () => {
    const page = await startGame()

    await page.clickDot([1, 1])
    await page.clickDot([1, 1])

    expect(page.dotsIn('selected')).toEqual([])
    expect(page.dotsIn('target')).toEqual([])
    expect(page.dotsIn('start')).toHaveLength(9)
  })

  it('clicking another valid start that is not a target moves the selection (MV-7)', async () => {
    const page = await startGame()

    await page.clickDot([0, 0])
    await page.clickDot([2, 2])

    expect(page.dotsIn('selected')).toEqual([[2, 2]])
    expect(page.dotsIn('target')).toEqual([
      [1, 2],
      [2, 1],
    ])
    expect(page.lineCount).toBe(0)
  })

  it('after the first line only dots on a line are valid starts; other dots do nothing (MV-2, MV-4, MV-8)', async () => {
    const page = await startGame()
    await page.drawLine([0, 0], [0, 1])

    expect(page.dotsIn('start')).toEqual([
      [0, 0],
      [0, 1],
    ])

    await page.clickDot([2, 2])

    expect(page.dotsIn('selected')).toEqual([])
    expect(page.lineCount).toBe(1)
  })

  it('with Dot1 selected, clicking a dot that is neither a target nor a start keeps the selection (MV-8)', async () => {
    const page = await startGame()
    await page.drawLine([0, 0], [0, 1])

    await page.clickDot([0, 1])
    await page.clickDot([2, 2])

    expect(page.dotsIn('selected')).toEqual([[0, 1]])
    expect(page.lineCount).toBe(1)
  })
})

describe('game screen: lines and squares (GB-2..4, SQ-1)', () => {
  it("draws the line in the current player's color and passes the turn (GB-2, GB-4)", async () => {
    const page = await startGame({ first: 1 })

    await page.drawLine([0, 0], [0, 1])

    expect(page.line([0, 0], [0, 1])).toEqual({ color: CORAL })
    expect(page.line([0, 1], [0, 2])).toBeNull()
    expect(page.turn()).toBe(BOHDAN.name)

    await page.drawLine([0, 0], [1, 0])

    expect(page.line([1, 0], [0, 0])).toEqual({ color: SKY })
    expect(page.line([0, 0], [0, 1])).toEqual({ color: CORAL })
    expect(page.turn()).toBe(ANNA.name)
  })

  it('closing a square gives it to the drawer, with their initial and color, and updates the score (SQ-1, GB-3, GB-4)', async () => {
    const page = await startGame({ first: 1 })

    await page.drawLines(BOHDAN_OWNS_ONE.slice(0, 3))
    expect(page.squareCount).toBe(0)

    await page.drawLine([1, 0], [1, 1]) // Bohdan draws the 4th edge

    expect(page.square([0, 0])).toEqual({ initial: 'B', color: SKY })
    expect(page.squareCount).toBe(1)
    expect(page.scores()).toEqual({ [ANNA.name]: 0, [BOHDAN.name]: 1 })
    expect(page.turn()).toBe(ANNA.name)
  })
})

describe('game screen: side panel layout (UP-4..UP-6)', () => {
  it('puts Stop first, above the turn, score and hint (UP-4)', async () => {
    const page = await startGame()

    expect(page.sidePanelOrder()).toEqual(['Stop', 'Turn', 'Score', 'hint'])
  })

  it('shows New game settings and Rematch in the slot Stop used (UP-6)', async () => {
    const page = await startGame()
    expect(page.sidePanelActions()).toEqual(['Stop'])

    await page.stopGame()

    expect(page.sidePanelActions()).toEqual(['New game settings', 'Rematch'])
  })
})

describe('game screen: button icons (UP-9)', () => {
  const icon = (name: string, accessibleName: string) => ({
    name,
    decorative: true,
    followsTextColor: true,
    beforeLabel: true,
    accessibleName,
  })

  it('Stop shows a hand before its label, which stays its accessible name (UP-9)', async () => {
    const page = await startGame()

    expect(page.buttonIcon('Stop')).toEqual(icon('stop-hand', 'Stop'))
    await page.switchLanguage('uk')
    expect(page.buttonIcon('Зупинити')).toEqual(icon('stop-hand', 'Зупинити'))
  })

  it('New game settings shows a gear and Rematch a refresh arrow, in both languages (UP-9)', async () => {
    const page = await startGame()
    await page.stopGame()

    expect(page.buttonIcon('New game settings')).toEqual(icon('settings', 'New game settings'))
    expect(page.buttonIcon('Rematch')).toEqual(icon('refresh', 'Rematch'))
    await page.switchLanguage('uk')
    expect(page.buttonIcon('Налаштування нової гри')).toEqual(
      icon('settings', 'Налаштування нової гри'),
    )
    expect(page.buttonIcon('Реванш')).toEqual(icon('refresh', 'Реванш'))
  })

  it('the Stop dialog buttons stay text only (UP-9)', async () => {
    const page = await startGame()
    await page.click('Stop')

    expect(page.buttonIcon('Cancel')).toBeNull()
    expect(page.buttonIcon('Stop game')).toBeNull()
  })
})

describe('game screen: stopping (END-2, END-4)', () => {
  it('Stop asks for confirmation and Cancel keeps playing (END-2)', async () => {
    const page = await startGame()
    await page.drawLines(BOHDAN_OWNS_ONE)

    await page.click('Stop')

    expect(page.dialog.exists()).toBe(true)
    expect(page.dialog.text()).toContain('Stop the game?')

    await page.click('Cancel')

    expect(page.dialog.exists()).toBe(false)
    expect(page.isResultShown).toBe(false)
    expect(page.turn()).toBe(ANNA.name)
    await page.drawLine([1, 1], [1, 2])
    expect(page.lineCount).toBe(5)
  })

  it('confirming Stop shows the result with the winner and both scores, over the final board (END-2, END-4)', async () => {
    const page = await startGame()
    await page.drawLines(BOHDAN_OWNS_ONE)

    await page.stopGame()

    expect(page.dialog.exists()).toBe(false)
    expect(page.resultHeadline()).toBe('Bohdan wins')
    expect(page.text()).toContain('The game was stopped.')
    expect(page.scores()).toEqual({ [BOHDAN.name]: 1, [ANNA.name]: 0 })
    expect(page.lineCount).toBe(4)
    expect(page.square([0, 0])).toEqual({ initial: 'B', color: SKY })
    expect(page.hasButton('Stop')).toBe(false)
  })

  it('no dot can be picked once the game has ended (END-7, MV-8)', async () => {
    const page = await startGame()
    await page.drawLine([0, 0], [0, 1])
    await page.stopGame()

    expect(page.dotsIn('start')).toEqual([])
    await page.drawLine([0, 1], [1, 1])
    expect(page.lineCount).toBe(1)
  })
})

describe('game screen: result (END-3..6)', () => {
  it('a finished board with equal scores is a Draw showing both scores (END-1, END-3, END-4)', async () => {
    const page = await startGame({ first: 1 })

    await page.drawLines(FULL_GAME_DRAW)

    expect(page.resultHeadline()).toBe('Draw')
    expect(page.text()).toContain('All squares are filled.')
    expect(page.scores()).toEqual({ [ANNA.name]: 2, [BOHDAN.name]: 2 })
    expect(page.square([1, 0])).toEqual({ initial: 'A', color: CORAL })
    expect(page.square([1, 1])).toEqual({ initial: 'B', color: SKY })
  })

  it('Rematch empties the board, keeps players and size, and picks a new first player (END-6)', async () => {
    const page = await startGame({ size: 3, first: 1 })
    await page.drawLines(BOHDAN_OWNS_ONE)
    await page.stopGame()

    await page.rematch(2)

    expect(page.isResultShown).toBe(false)
    expect(page.lineCount).toBe(0)
    expect(page.squareCount).toBe(0)
    expect(page.dotCount).toBe(16)
    expect(page.dotsIn('start')).toHaveLength(16)
    expect(page.turn()).toBe(BOHDAN.name)
    expect(page.scores()).toEqual({ [ANNA.name]: 0, [BOHDAN.name]: 0 })
  })

  it('offers New game settings and Rematch, shown in full in both languages (END-5, MB-6)', async () => {
    const page = await startGame()
    await page.stopGame()

    expect(page.resultButtons()).toEqual([
      { label: 'New game settings', shownInFull: true },
      { label: 'Rematch', shownInFull: true },
    ])
    await page.switchLanguage('uk')
    expect(page.resultButtons()).toEqual([
      { label: 'Налаштування нової гри', shownInFull: true },
      { label: 'Реванш', shownInFull: true },
    ])
  })

  it('New game settings opens the setup screen and clears the saved game (END-5)', async () => {
    const page = await startGame()
    await page.drawLine([0, 0], [0, 1])
    await page.stopGame()

    await page.newGameSettings()

    expect(page.isSetupShown).toBe(true)
    expect(localStorage.getItem(CURRENT_GAME)).toBeNull()
    const reloaded = await page.reload()
    expect(reloaded.isSetupShown).toBe(true)
  })
})

describe('game screen: reload (PS-1, PS-2)', () => {
  it('restores lines, owners and the current player, but not the selection (PS-1, PS-2)', async () => {
    const page = await startGame({ first: 1 })
    await page.drawLines(BOHDAN_OWNS_ONE)
    await page.clickDot([1, 1])

    const reloaded = await page.reload()

    expect(reloaded.lineCount).toBe(4)
    expect(reloaded.line([0, 0], [0, 1])).toEqual({ color: CORAL })
    expect(reloaded.line([1, 0], [1, 1])).toEqual({ color: SKY })
    expect(reloaded.square([0, 0])).toEqual({ initial: 'B', color: SKY })
    expect(reloaded.scores()).toEqual({ [ANNA.name]: 0, [BOHDAN.name]: 1 })
    expect(reloaded.turn()).toBe(ANNA.name)
    expect(reloaded.dotsIn('selected')).toEqual([])

    await reloaded.drawLine([1, 1], [1, 2])
    expect(reloaded.line([1, 1], [1, 2])).toEqual({ color: CORAL })
  })

  it('a finished game reloads to the result panel (PS-2)', async () => {
    const page = await startGame()
    await page.drawLines(BOHDAN_OWNS_ONE)
    await page.stopGame()

    const reloaded = await page.reload()

    expect(reloaded.resultHeadline()).toBe('Bohdan wins')
    expect(reloaded.scores()).toEqual({ [BOHDAN.name]: 1, [ANNA.name]: 0 })
    expect(reloaded.square([0, 0])).toEqual({ initial: 'B', color: SKY })
  })
})

describe('game screen: long names (GB-5)', () => {
  // two 15-character names, the most GS-1 allows; the first is one long word
  const LONG_1 = { name: 'Wolfgangwilhelm', color: 'coral' } as const
  const LONG_2 = { name: 'Maria-Magdalena', color: 'sky' } as const

  it('shows the whole name in the turn and the scores, wrapping instead of cutting (GB-5)', async () => {
    const page = await startGame({ player1: LONG_1, player2: LONG_2 })

    expect(page.turn()).toBe(LONG_1.name)
    expect(page.scores()).toEqual({ [LONG_1.name]: 0, [LONG_2.name]: 0 })
    expect(page.nameDisplays(LONG_1.name)).toEqual([
      { text: LONG_1.name, shownInFull: true }, // turn
      { text: LONG_1.name, shownInFull: true }, // score
    ])
  })

  it('shows the whole names in the Stop dialog (GB-5)', async () => {
    const page = await startGame({ player1: LONG_1, player2: LONG_2 })

    await page.click('Stop')

    expect(page.dialog.text()).toContain(LONG_1.name)
    expect(page.dialog.text()).toContain(LONG_2.name)
    // turn, score, and the dialog's score
    expect(page.nameDisplays(LONG_1.name)).toEqual([
      { text: LONG_1.name, shownInFull: true },
      { text: LONG_1.name, shownInFull: true },
      { text: LONG_1.name, shownInFull: true },
    ])
  })

  it('shows the whole winner name in the result headline and scores (GB-5)', async () => {
    const page = await startGame({ player1: LONG_1, player2: LONG_2 })
    await page.drawLines(BOHDAN_OWNS_ONE) // player 2 closes a square

    await page.stopGame()

    expect(page.resultHeadline()).toBe(`${LONG_2.name} wins`)
    expect(page.nameDisplays(LONG_2.name)).toEqual([
      { text: `${LONG_2.name} wins`, shownInFull: true }, // headline
      { text: LONG_2.name, shownInFull: true }, // score
    ])
  })
})
