import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { CURRENT_GAME } from '@/static'
import {
  ANNA,
  BOHDAN,
  openGamePage,
  startComputerGame,
  startGame,
  SWATCHES,
} from '@/test/game-page'

const SWATCH_NAMES = ['Coral', 'Teal', 'Sunflower', 'Sky', 'Lavender', 'Leaf', 'Berry', 'Tangerine']

afterEach(() => {
  vi.restoreAllMocks()
})

describe('player colors on setup', () => {
  it('each person picks from 8 named swatches (VR-32, VR-34)', async () => {
    const page = await openGamePage()
    await page.chooseMode('twoPlayers')

    expect(page.swatchNames(1)).toEqual(SWATCH_NAMES)
    expect(page.swatchNames(2)).toEqual(SWATCH_NAMES)
  })

  it('names the swatches in the current language (VR-34)', async () => {
    const page = await openGamePage()

    await page.wrapper.get('button[lang="uk"]').trigger('click')

    expect(page.wrapper.find('[role="radiogroup"][aria-label="Колір"]').exists()).toBe(true)
    const names = page.wrapper
      .findAll('[role="radiogroup"][aria-label="Колір"] [role="radio"]')
      .map((el) => el.attributes('aria-label'))
    expect(names).toContain('Кораловий')
    expect(names).toContain('Мандариновий')
  })

  it('marks only the picked swatch as selected (VR-33)', async () => {
    const page = await openGamePage()

    await page.pickSwatch(1, 'lavender')

    expect(page.selectedSwatch(1)).toBe('lavender')
    await page.pickSwatch(1, 'leaf')
    expect(page.selectedSwatch(1)).toBe('leaf')
  })

  it('starts the two players on two different swatches (VR-35)', async () => {
    // the worst case for a random pick: the same draw for both players
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const page = await openGamePage()
    await page.chooseMode('twoPlayers')

    const [first, second] = [page.selectedSwatch(1), page.selectedSwatch(2)]
    expect(first).not.toBeNull()
    expect(second).not.toBeNull()
    expect(first).not.toBe(second)
  })

  it("rejects the other player's swatch in Two players mode (VR-36)", async () => {
    const page = await openGamePage()
    await page.chooseMode('twoPlayers')
    await page.input('player1.name').setValue('Anna')
    await page.input('player2.name').setValue('Bohdan')
    await page.pickSwatch(1, 'berry')
    await page.pickSwatch(2, 'berry')

    await page.wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(page.isSetupShown).toBe(true)
    expect(page.setupErrors()).toContain('This color is already taken')
  })

  it('the game uses the picked swatches for lines (VR-32)', async () => {
    const page = await startGame({ player1: ANNA, player2: { ...BOHDAN, color: 'teal' } })

    await page.drawLine([0, 0], [0, 1])
    await page.drawLine([0, 1], [1, 1])

    expect(page.line([0, 0], [0, 1])).toEqual({ color: SWATCHES.coral.rgb })
    expect(page.line([0, 1], [1, 1])).toEqual({ color: SWATCHES.teal.rgb })
  })
})

describe('the computer player color (VR-37)', () => {
  it('takes the swatch most different from mine', async () => {
    const page = await openGamePage()

    await page.pickSwatch(1, 'sunflower')
    expect(page.setupOpponent()?.color).toBe(SWATCHES.sky.rgb)

    await page.pickSwatch(1, 'teal')
    expect(page.setupOpponent()?.color).toBe(SWATCHES.tangerine.rgb)
  })

  it('plays in that swatch', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      const page = await startComputerGame({ player1: { ...ANNA, color: 'teal' }, first: 2 })

      await page.waitForComputer()

      const [line] = page.wrapper.findAll<HTMLElement>('.rounded-\\[2px\\]')
      expect(line?.element.style.backgroundColor).toBe(SWATCHES.tangerine.rgb)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('a game saved before the swatches (VR-39)', () => {
  it('loads and plays with its old colors', async () => {
    const saved = {
      player1: { name: 'Anna', color: '#ff0000' },
      player2: { name: 'Bohdan', color: '#0000ff' },
      size: 2,
      lines: [{ from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, ownerName: 'Anna' }],
      dirtySquares: [],
      currentPlayerName: 'Bohdan',
      status: 'playing',
      finishReason: null,
    }
    const page = await openGamePage({ storage: { [CURRENT_GAME]: saved } })

    expect(page.line([0, 0], [0, 1])).toEqual({ color: 'rgb(255, 0, 0)' })
    await page.drawLine([0, 0], [1, 0])
    expect(page.line([0, 0], [1, 0])).toEqual({ color: 'rgb(0, 0, 255)' })
    expect(page.turn()).toBe('Anna')
  })
})
