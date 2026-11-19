/*
 * Store images for Google Play (AR-16, AR-17): run with `npm run store:screenshots`, review the
 * images and commit what it writes to `docs/store/`. It is not part of the build or the tests.
 *
 * - screenshots: builds the app, serves the build with `vite preview` and captures 5 screens per
 *   language (en, uk) and device (phone, 7" and 10" tablet), seeding localStorage with fixed games
 *   so every run gives the same images; no shot waits for a computer move
 * - feature graphics (1024×500, per language): the logo and the title on cream, from an HTML template
 * - icon-512.png: the logo on the cream tile, 32-bit PNG
 */
import { mkdir, readFile, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium, type Browser, type Page } from 'playwright'
import sharp from 'sharp'
import { build, preview } from 'vite'
import { LOGO_COLORS, logoSvg } from '../src/shared/logo.ts'
import en from '../src/i18n/locales/en.ts'
import uk from '../src/i18n/locales/uk.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
const storeDir = `${root}docs/store/`

type Lang = 'en' | 'uk'
const LANGS: Lang[] = ['en', 'uk']
const MESSAGES = { en, uk }

// viewport × DPR = the store pixel size, portrait (Play: tablets ≥1080 px a side, ≤2:1)
const DEVICES = {
  phone: { width: 360, height: 640, scale: 3 }, // 1080×1920
  tablet7: { width: 600, height: 960, scale: 2 }, // 1200×1920
  tablet10: { width: 800, height: 1280, scale: 2 }, // 1600×2560
} as const
type Device = keyof typeof DEVICES

// ---- fixture games, in the shape the game saves under CURRENT_GAME ----

const PERSON = { en: 'Sofia', uk: 'Софія' }
const PERSON_COLOR = '#2a9d8f' // teal
// computerColorFor(teal); a saved game keeps whatever color it holds
const COMPUTER = { name: '__computer_player__', color: '#ee8a3c' } // tangerine

type Owner = 'P' | 'C'
interface Edge {
  from: { row: number; col: number }
  to: { row: number; col: number }
}
// a line to the right of / below the dot at (row, col)
const h = (row: number, col: number): Edge => ({ from: { row, col }, to: { row, col: col + 1 } })
const v = (row: number, col: number): Edge => ({ from: { row, col }, to: { row: row + 1, col } })
const keyOf = ({ from, to }: Edge) => `${from.row},${from.col}-${to.row},${to.col}`

/**
 * A saved game: `squares` is the board row by row (P = the person's, C = the computer's,
 * . = open); every side of an owned square is drawn in its owner's color, then `extra` lines
 * alternate between the players.
 */
function fixture(
  lang: Lang,
  {
    squares,
    extra = [],
    finished = false,
  }: { squares: string[]; extra?: Edge[]; finished?: boolean },
) {
  const person = { name: PERSON[lang], color: PERSON_COLOR }
  const nameOf = (owner: string) => (owner === 'P' ? person.name : COMPUTER.name)
  const lines = new Map<string, Edge & { ownerName: string }>()
  const dirtySquares: { row: number; col: number; ownerName: string }[] = []
  squares.forEach((cells, row) =>
    [...cells].forEach((owner, col) => {
      if (owner !== 'P' && owner !== 'C') return
      const ownerName = nameOf(owner satisfies Owner)
      dirtySquares.push({ row, col, ownerName })
      for (const edge of [h(row, col), h(row + 1, col), v(row, col), v(row, col + 1)]) {
        if (!lines.has(keyOf(edge))) lines.set(keyOf(edge), { ...edge, ownerName })
      }
    }),
  )
  extra.forEach((edge, index) =>
    lines.set(keyOf(edge), { ...edge, ownerName: nameOf(index % 2 ? 'C' : 'P') }),
  )
  return {
    player1: person,
    player2: COMPUTER,
    size: squares.length,
    lines: [...lines.values()],
    dirtySquares,
    // the person's turn, so the computer never moves while a shot is taken
    currentPlayerName: person.name,
    status: finished ? 'finished' : 'playing',
    finishReason: finished ? 'completed' : null,
    gameMode: 'computer',
    difficulty: 'normal',
  }
}

const midGame = (lang: Lang) =>
  fixture(lang, {
    squares: ['PC..', 'P...', '....', '....'],
    extra: [h(0, 2), v(0, 3), h(2, 1), v(2, 0), h(1, 3)],
  })

const wonGame = (lang: Lang) =>
  fixture(lang, { squares: ['PPCP', 'PPCC', 'CPPP', 'PCPP'], finished: true })

const darkGame = (lang: Lang) =>
  fixture(lang, {
    squares: ['PP...', 'C.C..', 'CP...', '.....', '.....'],
    extra: [h(0, 2), h(0, 3), v(0, 4), v(1, 4), h(3, 0), v(3, 1), h(4, 1), v(2, 3), h(3, 3)],
  })

// ---- screens ----

interface Screen {
  name: string
  theme: 'light' | 'dark'
  game?: (lang: Lang) => object
  // after the app has loaded: put the screen into the state to capture
  prepare?: (page: Page, lang: Lang) => Promise<void>
}

const SCREENS: Screen[] = [
  {
    name: 'setup',
    theme: 'light',
    prepare: async (page, lang) => {
      const name = page.locator('input[name="player1.name"]')
      await name.fill(PERSON[lang])
      await name.blur()
    },
  },
  { name: 'game', theme: 'light', game: midGame },
  { name: 'result', theme: 'light', game: wonGame },
  {
    name: 'rules',
    theme: 'light',
    game: midGame,
    prepare: async (page) => {
      await page.locator('[data-rules-button]').click()
      await page.locator('[data-rules-panel]').waitFor()
      // no focus ring on the close button in the picture
      await page.locator('[data-rules-close]').blur()
    },
  },
  { name: 'dark', theme: 'dark', game: darkGame },
]

async function capture(browser: Browser, url: string, lang: Lang, device: Device) {
  const { width, height, scale } = DEVICES[device]
  const dir = `${storeDir}screenshots/${lang}/${device}/`
  await mkdir(dir, { recursive: true })
  for (const [index, screen] of SCREENS.entries()) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: scale,
      isMobile: true,
      hasTouch: true,
      locale: lang === 'uk' ? 'uk-UA' : 'en-US',
      colorScheme: screen.theme,
      reducedMotion: 'reduce', // no entrance animations half-way through
      serviceWorkers: 'block',
    })
    const storage: Record<string, string> = {
      LOCALE: lang,
      THEME: screen.theme,
      GAME_MODE: 'computer',
      DIFFICULTY: 'normal',
    }
    if (screen.game) storage.CURRENT_GAME = JSON.stringify(screen.game(lang))
    await context.addInitScript((items: Record<string, string>) => {
      // the same "random" colors on every run
      Math.random = () => 0.15
      if (sessionStorage.getItem('seeded')) return
      sessionStorage.setItem('seeded', '1')
      localStorage.clear()
      for (const [key, value] of Object.entries(items)) localStorage.setItem(key, value)
    }, storage)
    const page = await context.newPage()
    await page.goto(`${url}game`)
    await page.locator('[data-app-title]').waitFor()
    await page.evaluate(() => document.fonts.ready)
    await screen.prepare?.(page, lang)
    // let any transition (e.g. the rules panel's) settle
    await page.waitForFunction(() =>
      document.getAnimations().every(({ playState }) => playState !== 'running'),
    )
    const file = `${dir}${String(index + 1).padStart(2, '0')}-${screen.name}.png`
    await page.screenshot({ path: file })
    await context.close()
  }
}

// ---- feature graphic and icon ----

async function fontFace() {
  const files = `${root}node_modules/@fontsource-variable/nunito/files/`
  const faces = await Promise.all(
    ['latin', 'cyrillic'].map(async (subset) => {
      const font = await readFile(`${files}nunito-${subset}-wght-normal.woff2`)
      return `@font-face{font-family:Nunito;font-weight:200 1000;src:url(data:font/woff2;base64,${font.toString('base64')}) format('woff2')}`
    }),
  )
  return faces.join('')
}

async function featureGraphic(browser: Browser, lang: Lang) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 500 } })
  await page.setContent(`<!doctype html><html lang="${lang}"><head><style>
    ${await fontFace()}
    html,body{margin:0;height:100%}
    body{display:flex;align-items:center;justify-content:center;gap:56px;padding:0 72px;
      box-sizing:border-box;background:${LOGO_COLORS.tile};font-family:Nunito,sans-serif;
      color:${LOGO_COLORS.dotLight}}
    .logo{flex:none;width:260px;height:260px}
    .logo svg{width:100%;height:100%}
    h1{margin:0;font-size:64px;line-height:1.1;font-weight:900}
  </style></head><body>
    <div class="logo">${logoSvg()}</div>
    <h1>${MESSAGES[lang].app.title}</h1>
  </body></html>`)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${storeDir}feature-graphic-${lang}.png` })
  await page.close()
}

async function icon() {
  const svg = logoSvg({ tile: LOGO_COLORS.tile, tileRadius: 0 })
  await sharp(Buffer.from(svg), { density: (72 * 512) / 100 })
    .resize(512, 512)
    .ensureAlpha()
    .png()
    .toFile(`${storeDir}icon-512.png`)
}

// ---- run ----

const outDir = `${root}node_modules/.tmp/store-build`
await build({ root, logLevel: 'warn', build: { outDir, emptyOutDir: true } })
const server = await preview({ root, build: { outDir }, preview: { port: 4317, strictPort: true } })
const url = server.resolvedUrls?.local[0]
if (!url) throw new Error('vite preview has no local URL')

const browser = await chromium.launch()
try {
  await rm(`${storeDir}screenshots`, { recursive: true, force: true })
  for (const lang of LANGS) {
    for (const device of Object.keys(DEVICES) as Device[]) {
      await capture(browser, url, lang, device)
    }
    await featureGraphic(browser, lang)
  }
  await icon()
} finally {
  await browser.close()
  await server.close()
}
console.log(`store images written to ${storeDir}`)
