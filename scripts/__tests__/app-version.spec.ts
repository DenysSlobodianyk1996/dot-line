import { describe, expect, it } from 'vitest'
import { appVersion, checkReleaseTag, currentVersion, versionFor } from '../app-version'

describe('versionFor: one version per commit, one higher after every merge (PV-5, AR-11)', () => {
  it('is 1.0.0 (code 10000) at the commit released by hand', () => {
    expect(versionFor('1.0.0', 0)).toEqual({ name: '1.0.0', code: 10000 })
  })

  it('counts merges since then as the patch and adds them to the code, with no 99 limit', () => {
    expect(versionFor('1.0.0', 1)).toEqual({ name: '1.0.1', code: 10001 })
    expect(versionFor('1.0.0', 250)).toEqual({ name: '1.0.250', code: 10250 })
  })

  it('takes major and minor from package.json; the code keeps growing when they change', () => {
    expect(versionFor('1.1.0', 31)).toEqual({ name: '1.1.31', code: 10031 })
    expect(versionFor('2.0.5', 40)).toEqual({ name: '2.0.40', code: 10040 })
  })

  it('rejects a package version or count that is not one', () => {
    expect(() => versionFor('1.0', 1)).toThrow(/MAJOR.MINOR.PATCH/)
    expect(() => versionFor('1.0.0', -1)).toThrow(/merge count/)
  })
})

describe('appVersion: what a build shows, the same on the web and Android (PV-5)', () => {
  const current = () => '1.0.7'

  it("is the commit's own version", () => {
    expect(appVersion({ current })).toBe('1.0.7')
  })

  it('is the version the Android release builds', () => {
    expect(appVersion({ androidVersionName: '1.0.6', current })).toBe('1.0.6')
  })

  it('takes a version given in VITE_APP_VERSION first, and ignores names that are not versions', () => {
    expect(appVersion({ given: '1.0.3', androidVersionName: '1.0.6', current })).toBe('1.0.3')
    expect(appVersion({ given: 'next', current })).toBe('1.0.7')
  })

  it('is 1.0.0 without git history', () => {
    expect(appVersion({ current: () => null })).toBe('1.0.0')
  })

  it('works out this checkout, from the history back to 1.0.0', () => {
    expect(currentVersion()?.name).toMatch(/^1\.0\.\d+$/)
  })
})

describe('checkReleaseTag: a release tag is the commit’s own version', () => {
  it('accepts v + the version and refuses any other tag', () => {
    const version = { name: '1.0.4', code: 10004 }
    expect(() => checkReleaseTag('v1.0.4', version)).not.toThrow()
    expect(() => checkReleaseTag('v1.0.5', version)).toThrow(/release tag is v1.0.4/)
  })
})
