import { describe, expect, it } from 'vitest'
import { tint } from '../tint'

describe('tint: a player color at some opacity, for an old WebView too (AR-21)', () => {
  it('turns a hex color into rgba()', () => {
    expect(tint('#e8735a', 0.3)).toBe('rgba(232, 115, 90, 0.3)')
    expect(tint('#2A9D8F', 0.12)).toBe('rgba(42, 157, 143, 0.12)')
  })

  it('reads the short hex form', () => {
    expect(tint('#f80', 0.4)).toBe('rgba(255, 136, 0, 0.4)')
  })

  it('leaves a value it cannot read unchanged', () => {
    expect(tint('teal', 0.3)).toBe('teal')
  })
})
