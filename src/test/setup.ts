import { afterEach, vi } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'

// jsdom has no matchMedia; the board reads it to size itself, so answer "no match" (phone layout)
if (!window.matchMedia) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }))
}

// each test starts with an empty localStorage and nothing left mounted
enableAutoUnmount(afterEach)

afterEach(() => {
  localStorage.clear()
})
