import { describe, expect, it } from 'vitest'
import { StorageService } from '@/services'

describe('StorageService', () => {
  it('round-trips an object when reading with parsing', () => {
    const game = { size: 3, lines: [{ from: { row: 0, col: 0 }, to: { row: 0, col: 1 } }] }

    StorageService.setItem('game', game)

    expect(StorageService.getItem('game', { applyParse: true })).toEqual(game)
  })

  it('returns the raw JSON text when reading without parsing', () => {
    StorageService.setItem('game', { size: 3 })

    expect(StorageService.getItem('game')).toBe('{"size":3}')
  })

  it('stores strings as they are', () => {
    StorageService.setItem('LOCALE', 'en')

    expect(localStorage.getItem('LOCALE')).toBe('en')
    expect(StorageService.getItem('LOCALE')).toBe('en')
  })

  it('returns null for a missing key, with or without parsing', () => {
    expect(StorageService.getItem('missing')).toBeNull()
    expect(StorageService.getItem('missing', { applyParse: true })).toBeNull()
  })

  it('returns null when the stored value is not valid JSON', () => {
    localStorage.setItem('game', '{broken')

    expect(StorageService.getItem('game', { applyParse: true })).toBeNull()
  })

  it('removes an item', () => {
    StorageService.setItem('game', { size: 3 })

    StorageService.removeItem('game')

    expect(StorageService.getItem('game', { applyParse: true })).toBeNull()
  })
})
