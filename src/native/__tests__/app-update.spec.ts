import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { startGame } from '@/test/game-page'

// The Capawesome AppUpdate plugin, faked at the module boundary: Play's answer is set per test, the
// download-state listener is remembered so a test can finish a download, and the calls are recorded
const play = vi.hoisted(() => ({
  info: {} as Record<string, unknown>,
  onStateChange: null as ((state: { installStatus: number }) => void) | null,
  getAppUpdateInfo: vi.fn(),
  startFlexibleUpdate: vi.fn(async () => ({ code: 0 })),
  performImmediateUpdate: vi.fn(async () => ({ code: 0 })),
  completeFlexibleUpdate: vi.fn(async () => {}),
}))

vi.mock('@capawesome/capacitor-app-update', () => ({
  AppUpdate: {
    getAppUpdateInfo: play.getAppUpdateInfo,
    startFlexibleUpdate: play.startFlexibleUpdate,
    performImmediateUpdate: play.performImmediateUpdate,
    completeFlexibleUpdate: play.completeFlexibleUpdate,
    addListener: vi.fn(async (_event: string, listener: typeof play.onStateChange) => {
      play.onStateChange = listener
      return { remove: async () => {} }
    }),
  },
  AppUpdateAvailability: { UPDATE_NOT_AVAILABLE: 1, UPDATE_AVAILABLE: 2 },
  FlexibleUpdateInstallStatus: { DOWNLOADING: 2, DOWNLOADED: 11 },
}))

const backButton = vi.hoisted(() => ({ added: false }))
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(async () => {
      backButton.added = true
      return { remove: async () => {} }
    }),
    exitApp: vi.fn(),
  },
}))

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: { setStyle: vi.fn(async () => {}), setBackgroundColor: vi.fn(async () => {}) },
  Style: { Dark: 'DARK', Light: 'LIGHT' },
}))

const UPDATE_AVAILABLE = 2
const DOWNLOADED = 11

beforeEach(() => {
  vi.clearAllMocks()
  play.onStateChange = null
  backButton.added = false
  play.getAppUpdateInfo.mockImplementation(async () => play.info)
})

// starts the native touches the way main.ts does on Android, for the app mounted last
async function startNative() {
  const { startNative } = await import('@/native')
  await startNative()
  await flushPromises()
}

describe('In-app update from Google Play (AR-20)', () => {
  it('starts a flexible update through Play when a newer version is available', async () => {
    play.info = { updateAvailability: UPDATE_AVAILABLE, flexibleUpdateAllowed: true }
    await startGame()
    await startNative()

    expect(play.startFlexibleUpdate).toHaveBeenCalledOnce()
    expect(play.performImmediateUpdate).not.toHaveBeenCalled()
  })

  it('does nothing when the app is up to date', async () => {
    play.info = { updateAvailability: 1 }
    await startNative()

    expect(play.startFlexibleUpdate).not.toHaveBeenCalled()
    expect(play.performImmediateUpdate).not.toHaveBeenCalled()
    expect(play.completeFlexibleUpdate).not.toHaveBeenCalled()
  })

  it('falls back to the immediate update when Play allows only that', async () => {
    play.info = {
      updateAvailability: UPDATE_AVAILABLE,
      flexibleUpdateAllowed: false,
      immediateUpdateAllowed: true,
    }
    await startNative()

    expect(play.performImmediateUpdate).toHaveBeenCalledOnce()
  })

  it('installs the update once the download finishes', async () => {
    play.info = { updateAvailability: UPDATE_AVAILABLE, flexibleUpdateAllowed: true }
    await startGame()
    await startNative()
    expect(play.completeFlexibleUpdate).not.toHaveBeenCalled()

    play.onStateChange?.({ installStatus: DOWNLOADED })
    await flushPromises()

    expect(play.completeFlexibleUpdate).toHaveBeenCalledOnce()
  })

  it('installs an update downloaded on an earlier launch', async () => {
    play.info = { updateAvailability: 3, installStatus: DOWNLOADED }
    await startNative()

    expect(play.completeFlexibleUpdate).toHaveBeenCalledOnce()
    expect(play.startFlexibleUpdate).not.toHaveBeenCalled()
  })

  it('keeps the other native touches when Play is unavailable', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    play.getAppUpdateInfo.mockRejectedValueOnce(new Error('Install Error(-2): no Play Store'))
    await startGame()
    await startNative()

    expect(backButton.added).toBe(true)
    expect(warn).toHaveBeenCalledWith('App update check failed', expect.any(Error))
  })
})
