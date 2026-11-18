import { describe, expect, it } from 'vitest'
import { openGamePage } from '@/test/game-page'

// The size field: 4 by default, with a "From 2 to 10" hint under it that stays when an error
// shows (GS-2)
describe('Setup size', () => {
  it('opens with size 4 and starts a 4×4 game when left untouched (GS-2)', async () => {
    const page = await openGamePage()
    await page.chooseMode('computer')

    expect(page.input('size').element.value).toBe('4')

    await page.input('player1.name').setValue('Anna')
    await page.submitSetupForm()

    expect(page.isSetupShown).toBe(false)
    expect(page.dotCount).toBe(25)
  })

  it('shows the "From 2 to 10" hint under the size, tied to the input (GS-2)', async () => {
    const page = await openGamePage()

    expect(page.sizeHint()).toBe('From 2 to 10')
    await page.chooseMode('twoPlayers')
    expect(page.sizeHint()).toBe('From 2 to 10')
  })

  it('shows the size hint in the chosen language (GS-2)', async () => {
    const page = await openGamePage()

    await page.switchLanguage('uk')

    expect(page.sizeHint()).toBe('Від 2 до 10')
  })

  it.each(['1', '11', '2.5', ''])(
    'shows the error for size "%s" under the hint, and keeps the hint (GS-2)',
    async (size) => {
      const page = await openGamePage()
      await page.input('player1.name').setValue('Anna')
      await page.input('size').setValue(size)

      await page.submitSetupForm()

      expect(page.isSetupShown).toBe(true)
      const messages = page.sizeMessages()
      expect(messages).toHaveLength(2)
      expect(messages[0]).toBe('From 2 to 10')
      expect(messages[1]).not.toBe('')
    },
  )
})
