import { vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

export interface MountGamePageOptions {
  // localStorage entries to seed before the app loads, e.g. { LOCALE: 'en', CURRENT_GAME: {...} };
  // objects are JSON-serialized, strings are stored as they are (like StorageService)
  storage?: Record<string, object | string>
}

// Mounts the whole app at /game with the real router, i18n and localStorage, the way main.ts does.
// Modules are re-imported on every call, so i18n reads the seeded locale and a second call
// in the same test simulates a page reload from whatever is saved in localStorage.
export async function mountGamePage({ storage = {} }: MountGamePageOptions = {}) {
  for (const [key, value] of Object.entries(storage)) {
    localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value)
  }

  vi.resetModules()
  window.history.replaceState({}, '', '/game')

  const [{ default: App }, { default: router }, { i18n }] = await Promise.all([
    import('@/App.vue'),
    import('@/router'),
    import('@/i18n'),
  ])

  await router.push('/game')
  await router.isReady()

  const wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [createPinia(), router, i18n] },
  })
  await flushPromises()
  return wrapper
}
