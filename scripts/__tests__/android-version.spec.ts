import { describe, expect, it } from 'vitest'
import { androidVersion } from '../android-version.ts'

// AR-11: versionName is the tag without `v`, versionCode = major*10000 + minor*100 + patch
describe('androidVersion', () => {
  it('derives the version name and code from a release tag', () => {
    expect(androidVersion('v1.2.3')).toEqual({ name: '1.2.3', code: 10203 })
    expect(androidVersion('v0.1.0')).toEqual({ name: '0.1.0', code: 100 })
    expect(androidVersion('v12.34.56')).toEqual({ name: '12.34.56', code: 123456 })
  })

  it.each([
    ['1.2.3', 'no v prefix'],
    ['v1.2', 'two parts'],
    ['v1.2.3.4', 'four parts'],
    ['v1.2.3-beta', 'a pre-release suffix'],
    ['v1.x.3', 'a non-number'],
    ['v01.2.3', 'a leading zero'],
    ['', 'an empty tag'],
  ])('rejects %j (%s)', (tag) => {
    expect(() => androidVersion(tag)).toThrow(/tag/i)
  })

  it('rejects minor or patch above 99, which would collide with another version', () => {
    expect(() => androidVersion('v1.100.0')).toThrow(/99/)
    expect(() => androidVersion('v1.0.100')).toThrow(/99/)
  })

  it('rejects v0.0.0, since Play needs a versionCode of at least 1', () => {
    expect(() => androidVersion('v0.0.0')).toThrow(/at least 1/)
  })
})
