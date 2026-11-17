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

export type TestGameMode = 'twoPlayers' | 'computer'
export type TestDifficulty = 'easy' | 'normal'

export interface StartGameOptions {
  // Two players by default, so earlier specs keep testing that mode; 'computer' plays player1
  // against the computer player (player2 is then ignored)
  mode?: TestGameMode
  // Versus computer only; when left out, setup's preselected difficulty is kept
  difficulty?: TestDifficulty
  player1?: TestPlayer
  player2?: TestPlayer
  size?: number
  // which player gets the first turn; the game picks it with Math.random, which is stubbed.
  // In Versus computer mode the computer player is player 2.
  first?: 1 | 2
}

// the computer's pause before it draws (CM-15)
export const COMPUTER_DELAY_MS = 1000

// the computer player's name as the English page shows it (CM-12)
export const COMPUTER = 'Computer'

const MODE_LABELS: Record<TestGameMode, string> = {
  twoPlayers: 'Two players',
  computer: 'Versus computer',
}

const DIFFICULTY_LABELS: Record<TestDifficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
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
  mode = 'twoPlayers',
  difficulty,
  player1 = ANNA,
  player2 = BOHDAN,
  size = 2,
  first = 1,
}: StartGameOptions = {}) {
  const page = await openGamePage()
  await page.submitSetup({ mode, difficulty, player1, player2, size, first })
  return page
}

// Starts a Versus computer game; the computer's pause runs on fake timers, so the test calls
// vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }) first (flushPromises needs a real setImmediate)
export async function startComputerGame(options: Omit<StartGameOptions, 'mode' | 'player2'> = {}) {
  return startGame({ ...options, mode: 'computer' })
}

// Value for Math.random that makes start() pick the given player out of two.
export function randomFor(first: 1 | 2) {
  return first === 1 ? 0 : 0.99
}

export class GamePage {
  constructor(readonly wrapper: VueWrapper) {}

  // reload: close this page (which cancels anything pending) and open the app again
  // from whatever the game saved in localStorage
  async reload() {
    this.wrapper.unmount()
    return openGamePage()
  }

  text() {
    return this.wrapper.text()
  }

  // ---- setup screen ----

  get isSetupShown() {
    return this.wrapper.find('form').exists()
  }

  async submitSetup({
    mode,
    difficulty,
    player1,
    player2,
    size,
    first,
  }: Required<Omit<StartGameOptions, 'difficulty'>> & Pick<StartGameOptions, 'difficulty'>) {
    await this.chooseMode(mode)
    if (mode === 'computer' && difficulty) await this.chooseDifficulty(difficulty)
    await this.input('player1.name').setValue(player1.name)
    await this.input('player1.color').setValue(player1.color)
    if (mode === 'twoPlayers') {
      await this.input('player2.name').setValue(player2.name)
      await this.input('player2.color').setValue(player2.color)
    }
    await this.input('size').setValue(String(size))
    await this.withFirstPlayer(first, async () => {
      await this.wrapper.find('form').trigger('submit')
      await flushPromises()
    })
  }

  input(id: 'player1.name' | 'player1.color' | 'player2.name' | 'player2.color' | 'size') {
    return this.wrapper.find<HTMLInputElement>(`[id="${id}"]`)
  }

  // the options of a labelled switch (radiogroup), e.g. 'Game mode'
  private switchOptions(label: string) {
    const group = this.wrapper.find(`[role="radiogroup"][aria-label="${label}"]`)
    return group.exists() ? group.findAll('[role="radio"]') : []
  }

  private async chooseOption(label: string, optionLabel: string) {
    const option = this.switchOptions(label).find((el) => el.text() === optionLabel)
    if (!option) throw new Error(`No "${optionLabel}" in "${label}"`)
    await option.trigger('click')
    await flushPromises()
  }

  private selectedOption<T extends string>(label: string, labels: Record<T, string>): T | null {
    const checked = this.switchOptions(label).find((el) => el.attributes('aria-checked') === 'true')
    const entry = Object.entries(labels).find(([, text]) => text === checked?.text())
    return (entry?.[0] as T) ?? null
  }

  async chooseMode(mode: TestGameMode) {
    await this.chooseOption('Game mode', MODE_LABELS[mode])
  }

  // the checked game mode
  selectedMode(): TestGameMode | null {
    return this.selectedOption('Game mode', MODE_LABELS)
  }

  get hasDifficultySwitch() {
    return this.switchOptions('Difficulty').length > 0
  }

  async chooseDifficulty(difficulty: TestDifficulty) {
    await this.chooseOption('Difficulty', DIFFICULTY_LABELS[difficulty])
  }

  // the checked difficulty, or null when the switch isn't shown
  selectedDifficulty(): TestDifficulty | null {
    return this.selectedOption('Difficulty', DIFFICULTY_LABELS)
  }

  // the fieldsets of the setup form by legend, e.g. ['You', 'Opponent'] or ['Player 1', 'Player 2']
  setupFieldsets() {
    return this.wrapper.findAll('fieldset legend').map((legend) => legend.text())
  }

  // the setup's read-only Opponent field in Versus computer mode
  setupOpponent() {
    const fieldset = this.wrapper
      .findAll('fieldset')
      .find((el) => el.find('legend').text() === 'Opponent')
    if (!fieldset) return null
    const swatch = fieldset.find<HTMLElement>('[data-color]')
    return {
      name: fieldset.find('[data-name]').text(),
      color: swatch.element.style.backgroundColor,
    }
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

  // locked: no dot can be picked, so nothing is highlighted and clicks do nothing (CM-16)
  get isBoardLocked() {
    return this.dotsIn('idle').length === this.dotCount
  }

  // Draws some legal line for the person: the first valid start, then its first free neighbor.
  async drawAnyLine() {
    const [start] = this.dotsIn('start')
    if (!start) throw new Error('No valid start dot')
    await this.clickDot(start)
    const [target] = this.dotsIn('target')
    if (!target) throw new Error('No target dot')
    await this.clickDot(target)
  }

  // lets the computer's pause run out (fake timers), so it draws its line
  async waitForComputer(ms = COMPUTER_DELAY_MS) {
    await vi.advanceTimersByTimeAsync(ms)
    await flushPromises()
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

  // ---- names (GB-5) ----

  // Where the name appears on screen (turn, scores, Stop dialog, result), each place says whether the
  // whole name is shown: nothing around it clips it with "…" or keeps it on one line, and a long
  // single word may break onto the next line. jsdom has no layout, so this reads the Tailwind classes.
  nameDisplays(name: string) {
    const holders = [...(this.wrapper.element as HTMLElement).querySelectorAll('span, h3')].filter(
      (el) =>
        el.textContent!.includes(name) &&
        ![...el.children].some((child) => child.textContent!.includes(name)),
    )
    return holders.map((el) => ({
      text: el.textContent!.trim(),
      shownInFull: !ancestry(el).some(clips) && ancestry(el).some(breaksLongWords),
    }))
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

function ancestry(el: Element): Element[] {
  return el.parentElement ? [el, ...ancestry(el.parentElement)] : [el]
}

const CLIPPING = /^(truncate|text-ellipsis|text-clip|whitespace-nowrap|text-nowrap|line-clamp-\d+)$/
function clips(el: Element) {
  return [...el.classList].some((c) => CLIPPING.test(c))
}

const BREAKING = /^(wrap-break-word|wrap-anywhere|break-words|break-all)$/
function breaksLongWords(el: Element) {
  return [...el.classList].some((c) => BREAKING.test(c))
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
