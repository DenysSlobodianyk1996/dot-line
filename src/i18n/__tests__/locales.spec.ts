import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en'
import uk from '@/i18n/locales/uk'

/** Every leaf message path, e.g. `setup.title`. */
function keysOf(messages: object, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    value && typeof value === 'object' ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  )
}

describe('locales', () => {
  it('Ukrainian and English have exactly the same message keys (I18N-1)', () => {
    expect(keysOf(uk).sort()).toEqual(keysOf(en).sort())
  })

  it('has no empty messages (I18N-1)', () => {
    for (const messages of [en, uk]) {
      const empty = keysOf(messages).filter((path) => {
        const value = path
          .split('.')
          .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], messages)
        return typeof value !== 'string' || value.trim() === ''
      })
      expect(empty).toEqual([])
    }
  })
})
