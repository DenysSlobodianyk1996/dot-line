import { vi } from 'vitest'
import { flushPromises, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { mountGamePage, type MountGamePageOptions } from './mount-game-page'

// Page-level driver for the game screen: tests read and click the page the way a player does,
// in English, and only this file knows how the DOM is put together.

export type DotState = 'idle' | 'start' | 'selected' | 'target'
export type DotPosition = [row: number, col: number]

export interface TestPlayer {
  name: string
  color: string // #rrggbb
}

export interface StartGameOptions {
  player1?: TestPlayer
  player2?: TestPlayer
  size?: number
  // which player gets the first turn; the game picks it with Math.random, which is stubbed
  first?: 1 | 2
}

export const ANNA: TestPlayer = { name: 'Anna', color: '#ff0000' }
export const BOHDAN: TestPlayer = { name: 'Bohdan', color: '#0000ff' }

// Opens the page in English. Pass storage (e.g. { CURRENT_GAME: game }) to load a saved game.
export async function openGamePage({ storage = {} }: MountGamePageOptions = {}) {
  const wrapper = await mountGamePage({ storage: { LOCALE: 'en', ...storage } })
  return new GamePage(wrapper)
}

// Opens the page, fills in the setup form and submits it.
export async function startGame({
  player1 = ANNA,
  player2 = BOHDAN,
  size = 2,
  first = 1,
}: StartGameOptions = {}) {
  const page = await openGamePage()
  await page.submitSetup({ player1, player2, size, first })
  return page
}

// Value for Math.random that makes start() pick the given player out of two.
export function randomFor(first: 1 | 2) {
  return first === 1 ? 0 : 0.99
}

export class GamePage {
  constructor(readonly wrapper: VueWrapper) {}

  // reload: remount the app from whatever the game saved in localStorage
  async reload() {
    return openGamePage()
  }

  text() {
    return this.wrapper.text()
  }

  // ---- setup screen ----

  get isSetupShown() {
    return this.wrapper.find('form').exists()
  }

  async submitSetup({ player1, player2, size, first }: Required<StartGameOptions>) {
    await this.input('player1.name').setValue(player1.name)
    await this.input('player1.color').setValue(player1.color)
    await this.input('player2.name').setValue(player2.name)
    await this.input('player2.color').setValue(player2.color)
    await this.input('size').setValue(String(size))
    await this.withFirstPlayer(first, async () => {
      await this.wrapper.find('form').trigger('submit')
      await flushPromises()
    })
  }

  private input(id: string) {
    return this.wrapper.find<HTMLInputElement>(`[id="${id}"]`)
  }

  // ---- board ----

  dot([row, col]: DotPosition) {
    const dot = this.wrapper.find<HTMLButtonElement>(
      `button[aria-label="Dot row ${row + 1}, column ${col + 1}"]`,
    )
    if (!dot.exists()) throw new Error(`No dot at ${row},${col}`)
    return dot
  }

  get dotCount() {
    return this.wrapper.findAll('button[aria-label^="Dot row"]').length
  }

  dotState(position: DotPosition): DotState {
    const dot = this.dot(position)
    if (dot.element.disabled) return 'idle'
    if (dot.attributes('aria-pressed') === 'true') return 'selected'
    // a target ring is dashed, a start ring is solid
    return dot.find('.border-dashed').exists() ? 'target' : 'start'
  }

  // every dot in the given state, as [row, col], sorted by row then column
  dotsIn(state: DotState): DotPosition[] {
    return this.wrapper
      .findAll<HTMLButtonElement>('button[aria-label^="Dot row"]')
      .map((button) => {
        const [, row, col] = button.attributes('aria-label')!.match(/row (\d+), column (\d+)/)!
        return [Number(row) - 1, Number(col) - 1] as DotPosition
      })
      .filter((position) => this.dotState(position) === state)
  }

  // A disabled dot can't be clicked by a player; clicking it here still fires nothing.
  async clickDot(position: DotPosition) {
    await this.dot(position).trigger('click')
  }

  async drawLine(from: DotPosition, to: DotPosition) {
    await this.clickDot(from)
    await this.clickDot(to)
  }

  // draws the lines in order, one per turn
  async drawLines(lines: [DotPosition, DotPosition][]) {
    for (const [from, to] of lines) await this.drawLine(from, to)
  }

  // The board places lines and squares at dot centers, so they are found by position.
  private center(position: DotPosition) {
    const style = this.dot(position).element.style
    return {
      x: parseFloat(style.left) + parseFloat(style.width) / 2,
      y: parseFloat(style.top) + parseFloat(style.height) / 2,
    }
  }

  private findAllAt(elements: DOMWrapper<HTMLElement>[], x: number, y: number) {
    return elements.filter(
      ({ element }) => parseFloat(element.style.left) === x && parseFloat(element.style.top) === y,
    )
  }

  private get lineElements() {
    return this.wrapper.findAll<HTMLElement>('.rounded-\\[2px\\]')
  }

  get lineCount() {
    return this.lineElements.length
  }

  // the drawn line between two neighboring dots, or null; color is the CSS rgb() string
  line(a: DotPosition, b: DotPosition) {
    // a line starts at its top or left dot, offset by half its 4 px width
    const [from, to] = a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]) ? [a, b] : [b, a]
    const isHorizontal = from[0] === to[0]
    const { x, y } = this.center(from)
    const line = this.findAllAt(this.lineElements, x - 2, y - 2).find(({ element }) => {
      const { width, height } = element.style
      return isHorizontal === parseFloat(width) > parseFloat(height)
    })
    return line ? { color: line.element.style.backgroundColor } : null
  }

  private get squareElements() {
    return this.wrapper.findAll<HTMLElement>('.font-bold.absolute')
  }

  // the owned square whose top-left dot is [row, col], or null
  square([row, col]: DotPosition) {
    const { x, y } = this.center([row, col])
    const [square] = this.findAllAt(this.squareElements, x, y)
    if (!square) return null
    return { initial: square.text(), color: square.element.style.color }
  }

  get squareCount() {
    return this.squareElements.length
  }

  // ---- status panel ----

  private panelSection(label: string) {
    const heading = this.wrapper
      .findAll('div.text-sm.font-medium')
      .find((el) => el.text() === label)
    if (!heading) throw new Error(`No "${label}" section`)
    return heading.element.parentElement!
  }

  // name of the player whose turn it is
  turn() {
    return this.panelSection('Turn').lastElementChild!.textContent!.trim()
  }

  // { name: owned squares } as the Score section lists them, top to bottom
  scores() {
    return readScores(this.panelSection('Score'))
  }

  hint() {
    return this.wrapper.find('p.text-sm.text-gray-500').text()
  }

  button(label: string) {
    const button = this.wrapper.findAll('button').find((el) => el.text() === label)
    if (!button) throw new Error(`No "${label}" button`)
    return button
  }

  hasButton(label: string) {
    return this.wrapper.findAll('button').some((el) => el.text() === label)
  }

  async click(label: string) {
    await this.button(label).trigger('click')
    await flushPromises()
  }

  // ---- Stop dialog ----

  get dialog() {
    return this.wrapper.find('[role="dialog"]')
  }

  // Stop, then confirm
  async stopGame() {
    await this.click('Stop')
    await this.click('Stop game')
  }

  // ---- result panel ----

  get isResultShown() {
    return this.wrapper.text().includes('Result')
  }

  // "Anna wins" or "Draw"
  resultHeadline() {
    return this.panelSection('Result').querySelector('h3')!.textContent!.trim()
  }

  // Rematch and New game; first = who moves first after a rematch
  async rematch(first: 1 | 2 = 1) {
    await this.withFirstPlayer(first, () => this.click('Rematch'))
  }

  async newGame() {
    await this.click('New game')
  }

  // ---- helpers ----

  private async withFirstPlayer(first: 1 | 2, action: () => Promise<void>) {
    const random = vi.spyOn(Math, 'random').mockReturnValue(randomFor(first))
    try {
      await action()
    } finally {
      random.mockRestore()
    }
  }
}

function readScores(section: Element): Record<string, number> {
  const rows = [...section.querySelectorAll('.tabular-nums')].map((score) => score.parentElement!)
  return Object.fromEntries(
    rows.map((row) => {
      const [, name, score] = row.querySelectorAll('span')
      return [name!.textContent!.trim(), Number(score!.textContent)]
    }),
  )
}
