import { describe, expect, it } from 'vitest'
import { formatPrivacyDate } from '../privacy-date'

describe("the privacy policy's Updated date (AR-15)", () => {
  it('reads as a date in English and in Ukrainian', () => {
    expect(formatPrivacyDate('2026-11-19', 'en')).toBe('19 November 2026')
    expect(formatPrivacyDate('2026-11-19', 'uk')).toBe('19 листопада 2026 року')
    expect(formatPrivacyDate('2027-01-05', 'uk')).toBe('5 січня 2027 року')
  })
})
