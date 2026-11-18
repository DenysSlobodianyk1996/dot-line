import { vi } from 'vitest'
import { flushPromises, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { mountGamePage, type MountGamePageOptions } from './mount-game-page'

// Page-level driver for the game screen: tests read and click the page the way a player does,
// in English, and only this file knows how the DOM is put together.

export type DotState = 'idle' | 'start' | 'selected' | 'target'
export type DotPosition = [row: number, col: number]

// the 8 player color swatches (VR-32): each one's English name and how the page reports it
// (CSS rgb()); the hex values are in the spec
export const SWATCHES = {
  coral: { name: 'Coral', rgb: 'rgb(232, 115, 90)', hex: '#e8735a' },
  teal: { name: 'Teal', rgb: 'rgb(42, 157, 143)', hex: '#2a9d8f' },
  sunflower: { name: 'Sunflower', rgb: 'rgb(226, 169, 59)', hex: '#e2a93b' },
  sky: { name: 'Sky', rgb: 'rgb(79, 147, 209)', hex: '#4f93d1' },
  lavender: { name: 'Lavender', rgb: 'rgb(148, 121, 207)', hex: '#9479cf' },
  leaf: { name: 'Leaf', rgb: 'rgb(106, 164, 90)', hex: '#6aa45a' },
  berry: { name: 'Berry', rgb: 'rgb(208, 99, 140)', hex: '#d0638c' },
  tangerine: { name: 'Tangerine', rgb: 'rgb(238, 138, 60)', hex: '#ee8a3c' },
} as const
export type SwatchKey = keyof typeof SWATCHES

// a hex color as its swatch key, anything else unchanged
function paintKeyOf(color: string | null): string {
  const hex = color?.toLowerCase()
  const match = Object.entries(SWATCHES).find(([, swatch]) => swatch.hex === hex)
  return match ? match[0] : (color ?? '')
}

export interface TestPlayer {
  name: string
  color: SwatchKey
}

// a player as a saved game stores it: the color is a hex string
export function savedPlayer({ name, color }: TestPlayer) {
  return { name, color: SWATCHES[color].hex }
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

// the Turn area in Versus computer mode (CM-14, CM-19)
export const THINKING = 'Thinking…'
export const YOUR_TURN = 'Your turn'
// what the live region says after the computer's line (CM-37)
export const COMPUTER_DREW = 'Computer drew a line'
export const COMPUTER_CLAIMED = 'Computer drew a line and claimed a square'

const MODE_LABELS: Record<TestGameMode, string> = {
  twoPlayers: 'Two players',
  computer: 'Versus computer',
}

// the robot icon that marks the computer player (CM-13)
const ROBOT = 'svg[data-icon="robot"]'
const DIFFICULTY_LABELS: Record<TestDifficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
}

export const ANNA: TestPlayer = { name: 'Anna', color: 'coral' }
export const BOHDAN: TestPlayer = { name: 'Bohdan', color: 'sky' }

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

export type TestTheme = 'light' | 'dark'

// Stubs the device's light/dark setting (prefers-color-scheme) before the page opens; set() changes
// it live, like switching the phone to dark mode while the game is open (VR-11, VR-15).
// Other media queries (the board's layout) keep answering "no match".
export function stubSystemTheme(initial: TestTheme) {
  let dark = initial === 'dark'
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const isDarkQuery = (query: string) => query.includes('prefers-color-scheme: dark')
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        get matches() {
          return isDarkQuery(query) && dark
        },
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          if (isDarkQuery(query)) listeners.add(listener)
        },
        removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          listeners.delete(listener)
        },
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  )
  return {
    async set(theme: TestTheme) {
      dark = theme === 'dark'
      const event = { matches: dark, media: '(prefers-color-scheme: dark)' } as MediaQueryListEvent
      listeners.forEach((listener) => listener(event))
      await flushPromises()
    },
  }
}

// Value for Math.random that makes start() pick the given player out of two.
export function randomFor(first: 1 | 2) {
  return first === 1 ? 0 : 0.99
}

// an element's text as a screen reader reads it: parts hidden from assistive technology (such as
// a label's required marker `*`) are left out (GS-1, GS-2)
export function accessibleText(element: Element) {
  const copy = element.cloneNode(true) as Element
  copy.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove())
  return copy.textContent?.trim() ?? ''
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

  // ---- header ----

  private get header() {
    return this.wrapper.get('header')
  }

  // the game name at the start of the header (VR-18, VR-22)
  headerTitle() {
    return this.header.get('[data-app-title]').text()
  }

  // the logo in the header: decorative (hidden from screen readers) and placed before the game name (VR-18)
  headerLogo() {
    const logo = this.header.find('[data-app-logo]')
    if (!logo.exists()) return null
    const title = this.header.get('[data-app-title]').element
    return {
      decorative: logo.attributes('aria-hidden') === 'true',
      beforeTitle: Boolean(
        logo.element.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    }
  }

  private get themeButton() {
    return this.header.get('button[data-theme-toggle]')
  }

  // what the theme button says it switches to, e.g. 'Dark theme' (VR-16)
  themeButtonLabel() {
    return this.themeButton.attributes('aria-label')
  }

  async toggleTheme() {
    await this.themeButton.trigger('click')
    await flushPromises()
  }

  // the theme the page is drawn in: the root element's data-theme
  theme(): TestTheme | null {
    const theme = document.documentElement.dataset.theme
    return theme === 'light' || theme === 'dark' ? theme : null
  }

  // ---- document ----

  async switchLanguage(locale: 'uk' | 'en') {
    await this.header.get(`button[lang="${locale}"]`).trigger('click')
    await flushPromises()
  }

  // the install manifest the page links to; it names the installed app (VR-50, VR-51)
  manifestHref() {
    return document.head.querySelector('link[rel="manifest"]')?.getAttribute('href') ?? null
  }

  // ---- rules panel (VR-23..VR-31) ----

  private get rulesButton() {
    return this.header.get<HTMLButtonElement>('button[data-rules-button]')
  }

  private get rulesPanel() {
    return this.wrapper.find<HTMLElement>('[role="dialog"][data-rules-panel]')
  }

  // what the header's info button tells assistive technology (VR-29)
  rulesButtonState() {
    return {
      label: this.rulesButton.attributes('aria-label'),
      expanded: this.rulesButton.attributes('aria-expanded'),
    }
  }

  // the info button next to the setup title (UP-1)
  private get setupRulesButton() {
    return this.wrapper.find<HTMLButtonElement>('button[data-setup-rules-button]')
  }

  // what the setup's info button tells assistive technology, or null when setup shows none (UP-1)
  setupRulesButtonState() {
    const button = this.setupRulesButton
    if (!button.exists()) return null
    return {
      label: button.attributes('aria-label'),
      haspopup: button.attributes('aria-haspopup'),
      expanded: button.attributes('aria-expanded'),
    }
  }

  // Opens the panel with the header's info button or the one next to the setup title (UP-1).
  // Focuses the button first, as a click does in the browser.
  async openRules({ from = 'header' }: { from?: 'header' | 'setup' } = {}) {
    const button = from === 'setup' ? this.setupRulesButton : this.rulesButton
    ;(button.element as HTMLElement).focus()
    await button.trigger('click')
    await flushPromises()
  }

  async closeRules(how: 'button' | 'backdrop' | 'escape') {
    if (how === 'button') await this.rulesPanel.get('button[data-rules-close]').trigger('click')
    if (how === 'backdrop') await this.wrapper.get('[data-rules-backdrop]').trigger('click')
    if (how === 'escape') {
      const target = (document.activeElement ?? document.body) as HTMLElement
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    }
    await flushPromises()
  }

  isRulesOpen() {
    return this.rulesPanel.exists()
  }

  // the panel's accessible name: the text of the element it is labelled by
  rulesPanelName() {
    const panel = this.rulesPanel.element
    if (panel.getAttribute('aria-modal') !== 'true') throw new Error('The rules panel is not modal')
    const id = panel.getAttribute('aria-labelledby')
    return id ? document.getElementById(id)?.textContent?.trim() : undefined
  }

  // the rules points, joined, as the open panel shows them
  rulesText() {
    return this.rulesPanel.get('ol[data-rules-steps]').text()
  }

  // each rules point as the open panel shows it, without its number
  rulesPoints() {
    return this.rulesPanel
      .findAll('ol[data-rules-steps] > li > span:last-child')
      .map((point) => point.text())
  }

  // The "In pictures" storyboard under the rules (RL-7), or null. Each frame lists what its small board
  // shows: lines and owned squares by position ('row,col-row,col' / 'row,col', 0-based) with their
  // player color, the picked Dot1 and the highlighted neighbors. Colors are swatch keys.
  storyboard() {
    const section = this.rulesPanel.find<HTMLElement>('[data-rules-storyboard]')
    if (!section.exists()) return null
    return {
      heading: section.get('h3').text(),
      hiddenFromAssistiveTech: section.attributes('aria-hidden') === 'true',
      frames: section.findAll('[data-storyboard-frame]').map((frame) => {
        const colorOf = (element: Element, attribute: 'fill' | 'stroke') =>
          paintKeyOf(element.getAttribute(attribute))
        const selected = frame.find('[data-dot1]')
        return {
          caption: frame.get('[data-caption]').text(),
          lines: Object.fromEntries(
            frame
              .findAll('[data-line]')
              .map(({ element }) => [
                element.getAttribute('data-line'),
                colorOf(element, 'stroke'),
              ]),
          ),
          squares: Object.fromEntries(
            frame
              .findAll('[data-square]')
              .map(({ element }) => [
                element.getAttribute('data-square'),
                { letter: element.textContent?.trim(), color: colorOf(element, 'fill') },
              ]),
          ),
          dot1: selected.exists()
            ? {
                at: selected.attributes('data-dot1'),
                color: colorOf(selected.element, 'stroke'),
              }
            : null,
          neighbors: frame.findAll('[data-neighbor]').map((n) => n.attributes('data-neighbor')),
        }
      }),
    }
  }

  // every paint (fill and stroke) the storyboard boards use, sorted: player colors as swatch keys,
  // everything else as written (theme tokens are var(--color-…))
  storyboardPaints() {
    const section = this.rulesPanel.get('[data-rules-storyboard]')
    const paints = new Set<string>()
    for (const element of section.element.querySelectorAll('svg, svg *')) {
      for (const attribute of ['fill', 'stroke'] as const) {
        const value = element.getAttribute(attribute)
        if (value && value !== 'none') paints.add(paintKeyOf(value))
      }
    }
    return [...paints].sort()
  }

  // whether any rules text is shown on the page itself, outside the panel (VR-28)
  hasInlineRules() {
    return this.wrapper.findAll('ol').some((ol) => !ol.element.closest('[data-rules-panel]'))
  }

  // where keyboard focus is
  focus(): 'rules panel' | 'info button' | 'setup info button' | 'elsewhere' {
    const active = document.activeElement
    if (active && this.rulesPanel.exists() && this.rulesPanel.element.contains(active)) {
      return 'rules panel'
    }
    if (active === this.rulesButton.element) return 'info button'
    if (this.setupRulesButton.exists() && active === this.setupRulesButton.element) {
      return 'setup info button'
    }
    return 'elsewhere'
  }

  // Presses Tab (or Shift+Tab) the way a browser does: the page may handle the key; if it doesn't,
  // focus moves to the next (previous) focusable element of the document.
  async pressTab({ shift = false } = {}) {
    const active = (document.activeElement ?? document.body) as HTMLElement
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: shift,
      bubbles: true,
      cancelable: true,
    })
    if (active.dispatchEvent(event)) {
      const focusable = [
        ...document.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ]
      const index = focusable.indexOf(active)
      const next = focusable[(index + (shift ? -1 : 1) + focusable.length) % focusable.length]
      next?.focus()
    }
    await flushPromises()
  }

  // presses a key (e.g. 'ArrowRight') on whatever has keyboard focus
  async pressKey(key: string) {
    const active = (document.activeElement ?? document.body) as HTMLElement
    active.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
    await flushPromises()
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
    if (mode === 'twoPlayers') {
      // the other player's default may be the swatch player 1 wants, so it moves first (VR-36)
      if (this.selectedSwatch(2) === player1.color) await this.pickSwatch(2, player2.color)
      await this.pickSwatch(1, player1.color)
      await this.input('player2.name').setValue(player2.name)
      await this.pickSwatch(2, player2.color)
    } else {
      await this.pickSwatch(1, player1.color)
    }
    await this.input('size').setValue(String(size))
    await this.withFirstPlayer(first, () => this.submitSetupForm())
  }

  // submits the setup form as it is filled in
  async submitSetupForm() {
    await this.wrapper.get('form').trigger('submit')
    await flushPromises()
  }

  input(id: 'player1.name' | 'player2.name' | 'size') {
    return this.wrapper.find<HTMLInputElement>(`[id="${id}"]`)
  }

  // a setup field's label as it is shown, with its required marker, e.g. 'Name *'
  fieldLabel(id: 'player1.name' | 'player2.name' | 'size') {
    return this.label(id).text().trim()
  }

  // a setup field's label as a screen reader reads it: parts hidden from assistive technology
  // (such as the required marker) are left out
  fieldAccessibleLabel(id: 'player1.name' | 'player2.name' | 'size') {
    return accessibleText(this.label(id).element)
  }

  // whether a setup field is announced as required
  isRequired(id: 'player1.name' | 'player2.name' | 'size') {
    const input = this.input(id)
    return (
      input.attributes('aria-required') === 'true' || input.attributes('required') !== undefined
    )
  }

  private label(id: 'player1.name' | 'player2.name' | 'size') {
    return this.wrapper.get(`label[for="${id}"]`)
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

  // the hint that describes the difficulty switch for assistive technology (aria-describedby), as
  // shown below the switch, or null when there is none (VC-26)
  difficultyHint() {
    const group = this.wrapper.find('[role="radiogroup"][aria-label="Difficulty"]')
    const id = group.exists() ? group.attributes('aria-describedby') : undefined
    if (!id) return null
    const hint = document.getElementById(id)
    if (!hint) return null
    const followsSwitch = Boolean(
      group.element.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING,
    )
    if (!followsSwitch) throw new Error('The difficulty hint must sit below the switch')
    return hint.textContent!.trim()
  }

  // the hint that describes the size input for assistive technology (aria-describedby), as shown
  // below the input, or null when there is none (GS-2)
  sizeHint() {
    const hint = this.sizeHintElement()
    return hint ? hint.textContent!.trim() : null
  }

  // the messages shown under the size input, top to bottom: its hint, then any validation
  // error (GS-2)
  sizeMessages() {
    const hint = this.sizeHintElement()
    if (!hint) return []
    const errors = this.wrapper
      .findAll('form [data-field-error]')
      .map((el) => el.element)
      .filter((el) => el.parentElement === hint.parentElement)
    return [hint, ...errors]
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .map((el) => el.textContent!.trim())
  }

  // what assistive technology reads as the size input's description: the text of every element
  // its aria-describedby points at, in order (GS-2)
  sizeDescription() {
    return this.sizeDescribedBy().map((el) => el.textContent!.trim())
  }

  // whether the size input is announced as invalid (GS-2)
  isSizeInvalid() {
    return this.input('size').attributes('aria-invalid') === 'true'
  }

  private sizeDescribedBy() {
    const input = this.input('size')
    const ids = input.exists() ? (input.attributes('aria-describedby') ?? '') : ''
    return ids
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
  }

  private sizeHintElement() {
    const input = this.input('size')
    const hint = this.sizeDescribedBy()[0] ?? null
    if (!hint) return null
    const followsInput = Boolean(
      input.element.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING,
    )
    if (!followsInput) throw new Error('The size hint must sit below the input')
    return hint
  }

  // the fieldsets of the setup form by legend, e.g. ['You', 'Opponent'] or ['Player 1', 'Player 2']
  setupFieldsets() {
    return this.wrapper.findAll('fieldset legend').map((legend) => legend.text())
  }

  // a person's fieldset on setup ("Player 1", or "You" in Versus computer mode), found by its
  // name field so it works in any language
  private playerFieldset(player: 1 | 2) {
    return this.wrapper
      .findAll('fieldset')
      .find((el) => el.find(`[id="player${player}.name"]`).exists())
  }

  // a person's color swatches on setup: the fieldset's radiogroup (VR-32, VR-34)
  private swatchGroup(player: 1 | 2) {
    const group = this.playerFieldset(player)?.find('[role="radiogroup"]')
    return group?.exists() ? group : null
  }

  private swatchOptions(player: 1 | 2) {
    return this.swatchGroup(player)?.findAll('[role="radio"]') ?? []
  }

  // the swatch group's accessible name, e.g. 'Color' (VR-34)
  swatchGroupLabel(player: 1 | 2) {
    return this.swatchGroup(player)?.attributes('aria-label') ?? null
  }

  // the swatch names a person can pick from, as a screen reader reads them in the page's
  // language, e.g. ['Coral', …]
  swatchNames(player: 1 | 2) {
    return this.swatchOptions(player).map((el) => el.attributes('aria-label'))
  }

  async pickSwatch(player: 1 | 2, color: SwatchKey) {
    const swatch = this.swatchOptions(player).find(
      (el) => el.attributes('aria-label') === SWATCHES[color].name,
    )
    if (!swatch) throw new Error(`No ${color} swatch for player ${player}`)
    await swatch.trigger('click')
    await flushPromises()
  }

  // the swatches a person's Tab key stops on (roving tabindex: only the checked one, VR-34)
  swatchTabStops(player: 1 | 2): SwatchKey[] {
    return this.swatchOptions(player)
      .filter((el) => el.attributes('tabindex') !== '-1')
      .map((el) => swatchKeyOf(el.attributes('aria-label')))
      .filter((key): key is SwatchKey => key !== null)
  }

  // puts keyboard focus on a person's swatch, as Tab into the group would
  focusSwatch(player: 1 | 2, color: SwatchKey) {
    const swatch = this.swatchOptions(player).find(
      (el) => el.attributes('aria-label') === SWATCHES[color].name,
    )
    if (!swatch) throw new Error(`No ${color} swatch for player ${player}`)
    ;(swatch.element as HTMLElement).focus()
  }

  // the swatch of a person that has keyboard focus, or null
  focusedSwatch(player: 1 | 2): SwatchKey | null {
    const focused = this.swatchOptions(player).find((el) => el.element === document.activeElement)
    return focused ? swatchKeyOf(focused.attributes('aria-label')) : null
  }

  // the checked swatch of a person, or null
  selectedSwatch(player: 1 | 2): SwatchKey | null {
    const checked = this.swatchOptions(player).find(
      (el) => el.attributes('aria-checked') === 'true',
    )
    return swatchKeyOf(checked?.attributes('aria-label'))
  }

  // the validation messages the setup form shows
  setupErrors() {
    return this.wrapper.findAll('form [data-field-error]').map((el) => el.text())
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
      hasRobot: fieldset.find(ROBOT).exists(),
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

  // the colors of every drawn line, as CSS rgb() strings
  lineColors() {
    return this.lineElements.map(({ element }) => element.style.backgroundColor)
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

  // the drawn lines highlighted as the computer's last line: a 4 px box-shadow halo (CM-18)
  get highlightedLineCount() {
    return this.lineElements.filter(({ element }) => !!element.style.boxShadow).length
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

  // name of the player whose turn it is, or "Your turn" on the person's turn in Versus computer mode
  turn() {
    return this.panelSection('Turn').children[1]!.textContent!.trim()
  }

  // the polite live region under the turn: "Thinking…" while the computer's move is pending, then
  // what it drew (CM-37), else ''
  thinking() {
    const region = this.panelSection('Turn').querySelector('[aria-live="polite"]')
    if (!region) throw new Error('No live region in the Turn area')
    return region.textContent!.trim()
  }

  isThinkingPulsing() {
    return !!this.panelSection('Turn').querySelector('[aria-live="polite"].animate-pulse')
  }

  // 'hidden' keeps the hint's room in the layout (CSS `invisible`), 'absent' removes it (UP-5)
  hintState(): 'shown' | 'hidden' | 'absent' {
    const hint = this.wrapper.find('p[data-hint]')
    if (!hint.exists()) return 'absent'
    return hint.classes('invisible') ? 'hidden' : 'shown'
  }

  // The text shown beside each robot icon in a part of the screen (a panel section by its label, or
  // the Stop dialog), e.g. ['Computer']; also checks every icon is decorative inline SVG.
  robotsIn(where: 'Turn' | 'Score' | 'Result' | 'dialog') {
    const scope = where === 'dialog' ? this.dialog.element : this.panelSection(where)
    return [...scope.querySelectorAll(ROBOT)].map((icon) => {
      if (icon.tagName.toLowerCase() !== 'svg' || icon.getAttribute('aria-hidden') !== 'true') {
        throw new Error('The robot icon must be an aria-hidden inline <svg>')
      }
      return icon.parentElement!.textContent!.trim()
    })
  }

  // { name: owned squares } as the Score section lists them, top to bottom
  scores() {
    return readScores(this.panelSection('Score'))
  }

  hint() {
    return this.wrapper.find('p[data-hint]').text()
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

  // the side panel's parts, top to bottom in DOM order: action buttons by label, sections by their
  // heading ('Turn', 'Score', 'Result'), and 'hint' (UP-4)
  sidePanelOrder() {
    const panel = this.wrapper.get('[data-side-panel]').element
    return [...panel.children].flatMap((part) => {
      if (part.matches('[data-panel-actions]')) return buttonLabelsIn(part)
      if (part.matches('[data-hint]') || part.querySelector('[data-hint]')) return ['hint']
      return [...part.querySelectorAll('div.text-sm.font-medium')].map((h) => h.textContent!.trim())
    })
  }

  // the labels of the buttons in the side panel's top slot, where Stop and later the result
  // buttons sit (UP-6)
  sidePanelActions() {
    const first = this.wrapper.get('[data-side-panel]').element.firstElementChild
    return first?.matches('[data-panel-actions]') ? buttonLabelsIn(first) : []
  }

  // ---- Stop dialog ----

  get dialog() {
    return this.wrapper.find('[role="dialog"]:not([data-rules-panel])')
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

  // the result card (UP-10..UP-13): its icon ('trophy', 'robot' when the computer won, null on a
  // draw), the score as shown ("5 : 3", winner first), and whether its entrance animation runs only
  // when the device allows motion ('motion-safe'), always ('always'), or not at all ('none')
  resultCard() {
    const card = this.wrapper.find('[data-result-card]')
    if (!card.exists()) throw new Error('No result card')
    const el = card.element
    const icon = el.querySelector('svg[data-icon="trophy"]')
      ? 'trophy'
      : el.querySelector(ROBOT)
        ? 'robot'
        : null
    const score = el.querySelector('[data-result-score]')!.textContent!.replace(/\s+/g, ' ').trim()
    const animations = [...el.classList].filter((c) => /(^|:)animate-/.test(c))
    const entrance =
      animations.length === 0
        ? 'none'
        : animations.every((c) => c.startsWith('motion-safe:'))
          ? 'motion-safe'
          : 'always'
    return { icon, score, entrance }
  }

  // the result panel's buttons in order, each with its label and whether the whole label is shown:
  // nothing around it cuts it off or keeps it on one line, so on a narrow phone it wraps instead
  // (END-5, MB-6). jsdom has no layout, so this reads the Tailwind classes.
  resultButtons() {
    const panel = this.wrapper.get('[data-result-panel]').element
    return [...panel.querySelectorAll('button')].map((button) => ({
      label: button.textContent!.trim(),
      shownInFull: !ancestry(button).some(clips),
    }))
  }

  // Rematch and New game settings; first = who moves first after a rematch
  async rematch(first: 1 | 2 = 1) {
    await this.withFirstPlayer(first, () => this.click('Rematch'))
  }

  async newGameSettings() {
    await this.click('New game settings')
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

// a swatch's key from its English name, or null
function swatchKeyOf(name: string | undefined): SwatchKey | null {
  const entry = Object.entries(SWATCHES).find(([, swatch]) => swatch.name === name)
  return (entry?.[0] as SwatchKey) ?? null
}

function buttonLabelsIn(el: Element) {
  return [...el.querySelectorAll('button')].map((button) => button.textContent!.trim())
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
