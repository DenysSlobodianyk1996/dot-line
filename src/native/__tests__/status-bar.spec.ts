import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { App } from '@capacitor/app'
import { StatusBar } from '@capacitor/status-bar'
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

// the in-app update check (AR-20) also starts with the native touches: Play has nothing new here
vi.mock('@capawesome/capacitor-app-update', () => ({
  AppUpdate: {
    addListener: vi.fn(async () => ({ remove: async () => {} })),
    getAppUpdateInfo: vi.fn(async () => ({ updateAvailability: 1 })),
  },
  AppUpdateAvailability: { UPDATE_AVAILABLE: 2 },
  FlexibleUpdateInstallStatus: { DOWNLOADED: 11 },
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

// a plugin call that fails, the way a missing or broken plugin rejects on a device
function failsOnce(call: (...args: never[]) => Promise<unknown>) {
  vi.mocked(call).mockRejectedValueOnce(new Error('plugin failed'))
}

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

  describe('when a plugin call fails', () => {
    beforeEach(() => {
      statusBar.style = null
      statusBar.color = null
      vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('still paints the background when the icon style fails', async () => {
      failsOnce(StatusBar.setStyle)
      await openGamePage()
      await startNative()

      expect(statusBar.color).toBe(CREAM)
    })

    it('keeps the icon style when the background fails', async () => {
      failsOnce(StatusBar.setBackgroundColor)
      await openGamePage()
      await startNative()

      expect(statusBar.style).toBe('LIGHT')
    })

    it('still follows the theme when the back button listener fails', async () => {
      failsOnce(App.addListener)
      const page = await openGamePage()
      await startNative()

      await page.toggleTheme()
      await flushPromises()
      expect(statusBar).toEqual({ style: 'DARK', color: COCOA })
    })
  })
})
