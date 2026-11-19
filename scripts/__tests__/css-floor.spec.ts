/**
 * The app's CSS works on the oldest Chrome it supports (OLDEST_CHROME): the Android app on a
 * never-updated system WebView (AR-21). On Chrome 92 the app was unstyled (Tailwind's @layer), the
 * chosen color had no ring (var(--x,)), and owned squares had no tint (color-mix()).
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { OLDEST_CHROME } from '../../src/static/oldest-chrome'
import { lowerForOldWebView, newerThanFloor } from '../css-floor'

// vitest.config.ts runs from the repo root
const root = process.cwd()

describe(`the built CSS on Chrome ${OLDEST_CHROME}`, () => {
  let outDir = ''
  let sheets: string[] = []

  beforeAll(async () => {
    outDir = mkdtempSync(join(tmpdir(), 'css-floor-'))
    // the Android app's build: what an old system WebView loads
    await build({
      root,
      mode: 'capacitor',
      logLevel: 'silent',
      build: { outDir, emptyOutDir: true },
    })
    const assets = join(outDir, 'assets')
    sheets = readdirSync(assets)
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(join(assets, f), 'utf8'))
  }, 120_000)

  afterAll(() => rmSync(outDir, { recursive: true, force: true }))

  it('has the stylesheet', () => {
    expect(sheets.join('').length).toBeGreaterThan(10_000)
  })

  it('uses nothing newer without a fallback', () => {
    expect(sheets.flatMap((css) => newerThanFloor(css, OLDEST_CHROME))).toEqual([])
  })
})

/** Every .vue and .ts file of the app, outside tests. */
function appSources(): { file: string; text: string }[] {
  const src = join(root, 'src')
  return (readdirSync(src, { recursive: true }) as string[])
    .filter((f) => /\.(vue|ts)$/.test(f) && !f.includes('__tests__') && !f.startsWith('test/'))
    .map((file) => ({ file, text: readFileSync(join(src, file), 'utf8') }))
}

describe('app code an old WebView can draw', () => {
  it('makes no color-mix() for an inline style: use tint() (src/utils/tint.ts)', () => {
    const uses = appSources().filter(({ text }) => /color-mix\(/.test(text.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')))
    expect(uses.map((u) => u.file)).toEqual([])
  })

  it('puts no opacity modifier on a theme color: its fallback is the opaque color', () => {
    const modifier = /\b(bg|text|border|ring|fill|stroke|outline|shadow|divide|decoration|placeholder)-[a-z][a-z-]*\/\d+/g
    const uses = appSources().flatMap(({ file, text }) =>
      (text.match(modifier) ?? []).map((m) => `${file}: ${m}`),
    )
    expect(uses).toEqual([])
  })
})

describe('newerThanFloor', () => {
  it('flags @layer, which an older browser drops whole', () => {
    expect(newerThanFloor('@layer base { a { color: red } }', 88)).toHaveLength(1)
    expect(newerThanFloor('@layer base { a { color: red } }', 99)).toEqual([])
  })

  it('flags an empty var() fallback', () => {
    expect(newerThanFloor('.a { --s: var(--x,) 0 0 red }', 88)).toHaveLength(1)
    expect(newerThanFloor('.a { --s: var(--x, ) 0 0 red }', 88)).toEqual([])
  })

  it('flags new properties and units unless @supports is around', () => {
    expect(newerThanFloor('.a { scale: 1.1 }', 88)).toHaveLength(1)
    expect(newerThanFloor('.a { min-height: 100dvh }', 88)).toHaveLength(1)
    expect(newerThanFloor('@supports (height: 1dvh) { .a { min-height: 100dvh } }', 88)).toEqual([])
    expect(newerThanFloor('.a { min-height: 100vh; min-height: 100dvh }', 88)).toEqual([])
  })

  it('flags color-mix() outside @supports', () => {
    expect(newerThanFloor('.a { color: color-mix(in srgb, red 30%, white) }', 88)).toHaveLength(1)
    expect(
      newerThanFloor(
        '@supports (color: color-mix(in lab, red, red)) { .a { color: color-mix(in srgb, red 30%, white) } }',
        88,
      ),
    ).toEqual([])
  })
})

describe('lowerForOldWebView', () => {
  it('flattens @layer, keeping the later layer on top', async () => {
    const css = await lowerForOldWebView(
      '@layer base, utilities; @layer utilities { .p { padding: 1px } } @layer base { a { padding: 0 } }',
    )
    expect(css).not.toContain('@layer')
    expect(newerThanFloor(css, OLDEST_CHROME)).toEqual([])
  })

  it('gives an empty var() fallback a space', async () => {
    expect(await lowerForOldWebView('.a { --s: var(--x,) 0 0 red }')).toContain('var(--x, )')
  })
})
