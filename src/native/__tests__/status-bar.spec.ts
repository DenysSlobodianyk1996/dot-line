import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { openGamePage, stubSystemTheme } from '@/test/game-page'

// The Capacitor StatusBar plugin, faked at the module boundary: it records the last style and color
const statusBar = vi.hoisted(() => ({ style: null as string | null, color: null as string | null }))

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: {
    setStyle: vi.fn(async ({ style }: { style: string }) => void (statusBar.style = style)),
    setBackgroundColor: vi.fn(
      async ({ color }: { color: string }) => void (statusBar.color = color),
    ),
  },
  // Style.Dark is light text for a dark background, Style.Light dark text for a light one
  Style: { Dark: 'DARK', Light: 'LIGHT' },
}))

vi.mock('@capacitor/app', () => ({
  App: { addListener: vi.fn(async () => ({ remove: async () => {} })), exitApp: vi.fn() },
}))

// the --wc-paper values from src/assets/styles.css, which the tests don't load
const CREAM = '#fbf5ec'
const COCOA = '#241c17'
let tokens: HTMLStyleElement
beforeEach(() => {
  tokens = document.createElement('style')
  tokens.textContent = `:root { --wc-paper: ${CREAM}; } :root[data-theme='dark'] { --wc-paper: ${COCOA}; }`
  document.head.append(tokens)
})
afterEach(() => tokens.remove())

async function startNative() {
  const { startNative } = await import('@/native')
  await startNative()
  await flushPromises()
}

describe('Android status bar (AR-4)', () => {
  it('is cream with dark icons in the light theme', async () => {
    await openGamePage()
    await startNative()

    expect(statusBar).toEqual({ style: 'LIGHT', color: CREAM })
  })

  it('is cocoa with light icons on a dark device', async () => {
    stubSystemTheme('dark')
    await openGamePage()
    await startNative()

    expect(statusBar).toEqual({ style: 'DARK', color: COCOA })
  })

  it('follows the theme button live', async () => {
    const page = await openGamePage()
    await startNative()

    await page.toggleTheme()
    await flushPromises()
    expect(statusBar).toEqual({ style: 'DARK', color: COCOA })

    await page.toggleTheme()
    await flushPromises()
    expect(statusBar).toEqual({ style: 'LIGHT', color: CREAM })
  })
})
