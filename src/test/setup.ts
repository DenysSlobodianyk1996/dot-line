import { afterEach } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'

// jsdom has no matchMedia; the board reads it for its layout. No query matches (phone layout).
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList

// each test starts with an empty localStorage and nothing left mounted
enableAutoUnmount(afterEach)

afterEach(() => {
  localStorage.clear()
})
