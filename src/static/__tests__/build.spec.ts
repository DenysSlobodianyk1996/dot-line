import { describe, expect, it } from 'vitest'
import { NOT_THE_APP_PAGES } from '@/static/build'

// Workbox tests navigateFallbackDenylist against the path plus the query string
function servedAsApp(pathAndSearch: string) {
  return !NOT_THE_APP_PAGES.some((pattern) => pattern.test(pathAndSearch))
}

describe('offline navigation fallback (AR-15)', () => {
  it.each([
    '/dots-and-boxes-connected/privacy',
    '/dots-and-boxes-connected/privacy/',
    '/dots-and-boxes-connected/privacy/?ref=play',
    '/dots-and-boxes-connected/privacy?ref=play',
    '/dots-and-boxes-connected/privacy/index.html',
  ])('leaves the privacy policy %s to its own page', (path) => {
    expect(servedAsApp(path)).toBe(false)
  })

  it.each([
    '/dots-and-boxes-connected/',
    '/dots-and-boxes-connected/game',
    '/dots-and-boxes-connected/game?privacy=1',
    '/dots-and-boxes-connected/privacy-notes',
  ])('serves the app for %s', (path) => {
    expect(servedAsApp(path)).toBe(true)
  })
})
