import { afterEach, vi } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'

// jsdom has no matchMedia; the board reads it to size itself and the theme reads the device's
// light/dark setting, so every query answers "no match" (phone layout, light device).
// A plain function, so stubSystemTheme()'s spy is fully undone by vi.restoreAllMocks().
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

// each test starts with an empty localStorage and nothing left mounted
enableAutoUnmount(afterEach)

afterEach(() => {
  localStorage.clear()
  // undo stubSystemTheme() and forget the theme the last page drew in
  vi.restoreAllMocks()
  delete document.documentElement.dataset.theme
})
