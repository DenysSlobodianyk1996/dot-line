import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { startGame } from '@/test/game-page'

// The Capacitor App plugin, faked at the module boundary: it remembers the back-button listener so
// a test can press the Android back button, and records exitApp()
const app = vi.hoisted(() => ({
  backButton: null as (() => void) | null,
  exitApp: vi.fn(),
}))

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(async (event: string, listener: () => void) => {
      if (event === 'backButton') app.backButton = listener
      return { remove: async () => {} }
    }),
    exitApp: app.exitApp,
  },
}))

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: { setStyle: vi.fn(async () => {}), setBackgroundColor: vi.fn(async () => {}) },
  Style: { Dark: 'DARK', Light: 'LIGHT' },
}))

// starts the native touches the way main.ts does on Android, for the app mounted last
async function startNative() {
  app.backButton = null
  app.exitApp.mockClear()
  const { startNative } = await import('@/native')
  await startNative()
}

async function pressBack() {
  if (!app.backButton) throw new Error('No back-button listener')
  app.backButton()
  await flushPromises()
}

describe('Android back button (AR-3)', () => {
  it('closes the rules panel first, and nothing else', async () => {
    const page = await startGame()
    await page.click('Stop')
    await page.openRules()
    await startNative()

    await pressBack()

    expect(page.isRulesOpen()).toBe(false)
    expect(page.dialog.exists()).toBe(true)
    expect(app.exitApp).not.toHaveBeenCalled()
  })

  it('closes the Stop dialog when the rules panel is closed, and the game goes on', async () => {
    const page = await startGame()
    await page.click('Stop')
    await startNative()

    await pressBack()

    expect(page.dialog.exists()).toBe(false)
    expect(page.isResultShown).toBe(false)
    expect(app.exitApp).not.toHaveBeenCalled()
  })

  it('leaves the app when neither is open', async () => {
    const page = await startGame()
    await startNative()

    await pressBack()

    expect(page.isRulesOpen()).toBe(false)
    expect(app.exitApp).toHaveBeenCalledOnce()
  })
})
