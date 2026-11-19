import { describe, expect, it } from 'vitest'
import { fillPrivacyPage, formatPrivacyDate, privacyUpdated } from '../privacy-updated'

describe('privacyUpdated: the privacy policy date a build prints (AR-15)', () => {
  const today = new Date('2026-11-20T23:30:00Z')

  it('is the date of the commit being built, so every deploy from master gets its own date', () => {
    expect(privacyUpdated({ commitDate: () => '2026-11-19\n', now: today })).toBe('2026-11-19')
  })

  it('takes a date given in VITE_PRIVACY_UPDATED first', () => {
    expect(
      privacyUpdated({ given: '2026-01-02', commitDate: () => '2026-11-19', now: today }),
    ).toBe('2026-01-02')
  })

  it('falls back to today (UTC) without git or with something that is not a date', () => {
    const noGit = () => {
      throw new Error('not a git repository')
    }
    expect(privacyUpdated({ commitDate: noGit, now: today })).toBe('2026-11-20')
    expect(privacyUpdated({ given: 'soon', commitDate: () => 'oops', now: today })).toBe(
      '2026-11-20',
    )
  })
})

describe('the privacy page with its date filled in', () => {
  it('prints the date in English and in Ukrainian', () => {
    expect(formatPrivacyDate('2026-11-19', 'en')).toBe('19 November 2026')
    expect(formatPrivacyDate('2026-11-19', 'uk')).toBe('19 листопада 2026 року')
    expect(formatPrivacyDate('2027-01-05', 'uk')).toBe('5 січня 2027 року')
  })

  it('fills every placeholder', () => {
    const page = fillPrivacyPage(
      '<time datetime="%PRIVACY_UPDATED%">%PRIVACY_UPDATED_EN%</time>' +
        '<time datetime="%PRIVACY_UPDATED%">%PRIVACY_UPDATED_UK%</time>',
      '2026-11-19',
    )
    expect(page).toBe(
      '<time datetime="2026-11-19">19 November 2026</time>' +
        '<time datetime="2026-11-19">19 листопада 2026 року</time>',
    )
  })
})
