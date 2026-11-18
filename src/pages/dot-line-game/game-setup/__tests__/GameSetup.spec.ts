import { describe, expect, it } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { mountGamePage, type MountGamePageOptions } from '@/test/mount-game-page'

const TWO_PLAYERS = ['Двоє гравців', 'Two players']

// opens setup and switches to Two players: these tests cover that mode, unchanged (CM-34)
async function openTwoPlayersSetup(storage: MountGamePageOptions['storage'] = {}) {
  const page = await mountGamePage({ storage })
  const option = page.findAll('[role="radio"]').find((el) => TWO_PLAYERS.includes(el.text()))
  if (!option) throw new Error('No Two players game mode')
  await option.trigger('click')
  await flushPromises()
  return page
}

// a label's text as a screen reader reads it: the required marker `*` is hidden (GS-1, GS-2)
function accessibleText(label: Element) {
  const copy = label.cloneNode(true) as Element
  copy.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove())
  return copy.textContent?.trim() ?? ''
}

// finds an input through its label, the way a player would (label `for` → input `id`)
function inputLabelled(page: VueWrapper, fieldset: string | null, label: string) {
  const scope = fieldset
    ? page.findAll('fieldset').find((f) => f.find('legend').text() === fieldset)
    : page.find('form')
  const labelEl = scope?.findAll('label').find((l) => accessibleText(l.element) === label)
  const id = labelEl?.attributes('for')
  if (!id) throw new Error(`No label "${label}" in ${fieldset ?? 'form'}`)
  return page.get<HTMLInputElement>(`[id="${id}"]`)
}

async function fillSetup(
  page: VueWrapper,
  { name1, name2, size }: { name1: string; name2: string; size: string },
) {
  await inputLabelled(page, 'Гравець 1', 'Ім’я').setValue(name1)
  await inputLabelled(page, 'Гравець 2', 'Ім’я').setValue(name2)
  await inputLabelled(page, null, 'Розмір поля').setValue(size)
}

async function submit(page: VueWrapper) {
  await page.get('form').trigger('submit')
  await flushPromises()
}

function errors(page: VueWrapper) {
  return page.findAll('form [data-field-error]').map((e) => e.text())
}

describe('game setup', () => {
  it('starts the game with both players when the form is valid (GS-3)', async () => {
    const page = await openTwoPlayersSetup()

    await fillSetup(page, { name1: 'Alice', name2: 'Bob', size: '3' })
    await submit(page)

    expect(page.find('form').exists()).toBe(false)
    expect(page.text()).toContain('Alice')
    expect(page.text()).toContain('Bob')
    expect(page.findAll('[aria-label^="Точка"]').length).toBe(16)
  })

  it('blocks the start and names the field when a player name is empty (GS-1, I18N-1)', async () => {
    const page = await openTwoPlayersSetup()

    await fillSetup(page, { name1: '', name2: 'Bob', size: '3' })
    await submit(page)

    expect(page.find('form').exists()).toBe(true)
    expect(errors(page)).toEqual(['Поле «Ім’я гравця 1» заповнено некоректно.'])
  })

  it('does not accept a name longer than 15 characters (GS-1)', async () => {
    const page = await openTwoPlayersSetup()

    expect(inputLabelled(page, 'Гравець 1', 'Ім’я').attributes('maxlength')).toBe('15')
    expect(inputLabelled(page, 'Гравець 2', 'Ім’я').attributes('maxlength')).toBe('15')
  })

  it('blocks the start when a name that got in anyway is longer than 15 characters (GS-1)', async () => {
    const page = await openTwoPlayersSetup()

    // setValue bypasses maxlength, like a value restored into the field
    await fillSetup(page, { name1: 'Олександра-Марія', name2: 'Bob', size: '3' })
    await submit(page)

    expect(page.find('form').exists()).toBe(true)
    expect(errors(page)).toEqual(['Поле «Ім’я гравця 1» може містити не більше 15 символів.'])
  })

  it('accepts a name of exactly 15 characters (GS-1)', async () => {
    const page = await openTwoPlayersSetup()

    await fillSetup(page, { name1: 'Олександра-Марі', name2: 'Bob', size: '3' })
    await submit(page)

    expect(page.find('form').exists()).toBe(false)
  })

  it('explains the name limit in English when English is chosen (GS-1, I18N-1)', async () => {
    const page = await openTwoPlayersSetup({ LOCALE: 'en' })

    await inputLabelled(page, 'Player 2', 'Name').setValue('Bartholomew-John')
    await page.get('form').trigger('submit')
    await flushPromises()

    expect(errors(page)).toContain('Player 2 name can be at most 15 characters.')
  })

  it.each(['Alice', 'ALICE', 'alice'])(
    'shows that names must differ when player 2 is "%s" (GS-1)',
    async (name2) => {
      const page = await openTwoPlayersSetup()

      await fillSetup(page, { name1: 'Alice', name2, size: '3' })
      await submit(page)

      expect(page.find('form').exists()).toBe(true)
      expect(errors(page)).toContain('Імена гравців мають відрізнятися')
    },
  )

  it.each(['', '1', '11', '2.5'])('blocks the start when the size is "%s" (GS-2)', async (size) => {
    const page = await openTwoPlayersSetup()

    await fillSetup(page, { name1: 'Alice', name2: 'Bob', size })
    await submit(page)

    expect(page.find('form').exists()).toBe(true)
    expect(errors(page)).toEqual(['Поле «Розмір поля» заповнено некоректно.'])
  })

  it.each(['2', '10'])('accepts the size %s (GS-2)', async (size) => {
    const page = await openTwoPlayersSetup()

    await fillSetup(page, { name1: 'Alice', name2: 'Bob', size })
    await submit(page)

    expect(page.find('form').exists()).toBe(false)
  })

  it('uses English field labels in messages when English is chosen (I18N-1)', async () => {
    const page = await openTwoPlayersSetup({ LOCALE: 'en' })

    await page.get('form').trigger('submit')
    await flushPromises()

    expect(errors(page)).toContain('Player 1 name is not valid.')
    expect(errors(page)).toContain('Player 2 name is not valid.')
  })

  it('switches a shown message to the new language on the next validation (I18N-6)', async () => {
    const page = await openTwoPlayersSetup()
    await fillSetup(page, { name1: '', name2: 'Bob', size: '3' })
    await submit(page)
    expect(errors(page)).toEqual(['Поле «Ім’я гравця 1» заповнено некоректно.'])

    await page.get('button[lang="en"]').trigger('click')
    await submit(page)

    expect(errors(page)).toEqual(['Player 1 name is not valid.'])
  })
})
