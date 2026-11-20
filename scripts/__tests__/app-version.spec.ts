import { describe, expect, it } from 'vitest'
import { appVersion, latestVersion, nextReleaseTag } from '../app-version'

describe('nextReleaseTag: the tag npm run release creates (AR-11)', () => {
  it('follows 1.0.0, which went to Play by hand without a tag', () => {
    expect(nextReleaseTag([])).toBe('v1.0.1')
  })

  it('raises the patch of the highest release tag, comparing numbers, not text', () => {
    expect(nextReleaseTag(['v1.0.1', 'v1.0.10', 'v1.0.9'])).toBe('v1.0.11')
    expect(nextReleaseTag(['v1.2.3', 'v1.10.0'])).toBe('v1.10.1')
  })

  it('ignores tags that are not releases', () => {
    expect(nextReleaseTag(['v2.0.0-beta', 'latest', 'v1.0.4'])).toBe('v1.0.5')
  })

  it('keeps minor and patch within 0..99, so Android version codes stay unique', () => {
    expect(nextReleaseTag(['v1.0.99'])).toBe('v1.1.0')
    expect(nextReleaseTag(['v1.99.99'])).toBe('v2.0.0')
  })
})

describe('appVersion: the version a build shows, the same on the web and Android (FT-5)', () => {
  const tags = () => ['v1.0.1', 'v1.0.2']

  it('is the latest release tag, so the web app shows what was last released', () => {
    expect(appVersion({ tags })).toBe('1.0.2')
    expect(latestVersion(tags())).toBe('1.0.2')
  })

  it('is the tag the Android release builds', () => {
    expect(appVersion({ androidVersionName: '1.0.3', tags })).toBe('1.0.3')
  })

  it('takes a version given in VITE_APP_VERSION first', () => {
    expect(appVersion({ given: '1.0.1', androidVersionName: '1.0.3', tags })).toBe('1.0.1')
  })

  it('is 1.0.0, the first release, with no tags or no git; ignores names that are not versions', () => {
    expect(appVersion({ tags: () => [] })).toBe('1.0.0')
    expect(appVersion({ given: 'next', androidVersionName: '', tags: () => [] })).toBe('1.0.0')
  })
})
