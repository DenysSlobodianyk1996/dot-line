<template>
  <fieldset class="flex min-w-0 flex-1 flex-col gap-3 rounded-lg border border-border p-4">
    <legend class="px-2 text-sm font-semibold text-ink-soft">
      {{ legend ?? t('setup.player', { number }) }}
    </legend>
    <Field
      :name="`${props.parentForm}.name`"
      :label="legend ? t('setup.name') : t('setup.playerName', { number })"
      :rules="nameRules"
      v-slot="{ field, errorMessage }"
    >
      <div class="flex min-w-0 flex-col gap-2">
        <BaseLabel :for="field.name" required>{{ t('setup.name') }}</BaseLabel>
        <!-- names are at most 15 characters: the field doesn't accept more, and a longer value fails `max` (GS-1) -->
        <BaseInput
          v-bind="field"
          :id="field.name"
          :title="field.value"
          type="text"
          aria-required="true"
          :maxlength="MAX_NAME_LENGTH"
        />
        <BaseFieldError :errorMessage />
      </div>
    </Field>
    <!-- the color is one of the swatches, kept as its hex (VR-32..VR-34, VR-39) -->
    <Field
      :name="`${props.parentForm}.color`"
      :label="t('setup.color')"
      :rules="colorRules"
      v-slot="{ value, handleChange, errorMessage }"
    >
      <div class="flex flex-col gap-2">
        <div aria-hidden="true" class="block text-sm font-medium text-ink-soft">
          {{ t('setup.color') }}
        </div>
        <!-- a radio group: one Tab stop (the picked swatch), arrow keys move and pick (VR-34);
             each button is a 44 px tap target below sm around a smaller dot (VR-9) -->
        <div
          role="radiogroup"
          :aria-label="t('setup.color')"
          class="grid grid-cols-4 gap-1 sm:gap-2 sm:p-1"
          @keydown="onSwatchKeydown($event, value, handleChange)"
        >
          <button
            v-for="(swatch, index) in SWATCHES"
            :key="swatch.key"
            type="button"
            role="radio"
            :aria-checked="value === swatch.hex"
            :aria-label="t(`colors.${swatch.key}`)"
            :title="t(`colors.${swatch.key}`)"
            :tabindex="isTabStop(index, value) ? 0 : -1"
            class="group flex size-11 cursor-pointer items-center justify-center justify-self-center rounded-full focus-visible:outline-2 focus-visible:outline-accent sm:size-10"
            @click="handleChange(swatch.hex)"
          >
            <span
              aria-hidden="true"
              class="size-8 rounded-full ring-offset-2 ring-offset-paper transition-transform group-hover:[transform:scale(1.1)]"
              :class="value === swatch.hex ? '[transform:scale(1.1)] ring-3 ring-ink' : ''"
              :style="{ backgroundColor: swatch.hex }"
            ></span>
          </button>
        </div>
        <BaseFieldError :errorMessage />
      </div>
    </Field>
  </fieldset>
</template>

<script setup lang="ts">
import { Field, defineRule } from 'vee-validate'
import { required, max } from '@vee-validate/rules'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { i18n, SUPPORTED_LOCALES } from '@/i18n'
import BaseLabel from '@/shared/components/BaseLabel.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseFieldError from '@/shared/components/BaseFieldError.vue'
import { SWATCHES } from '@/utils'

defineRule('required', required)
defineRule('max', max)

const MAX_NAME_LENGTH = 15
// the message comes from the i18n generateMessage config (validation.differentNames)
defineRule('differentFromAll', (fieldValue: string, otherValues: string[]) => {
  return !otherValues
    ?.filter(Boolean)
    ?.map((s) => s.toLocaleLowerCase())
    ?.includes(fieldValue?.toLowerCase())
})

// the message comes from the i18n generateMessage config (colors.taken)
defineRule('differentColor', (fieldValue: string, [otherColor]: string[]) => {
  return !otherColor || fieldValue?.toLowerCase() !== otherColor.toLowerCase()
})

// apostrophe variants count as the same letter: Комп’ютер = Комп'ютер = Компʼютер
function normalizeName(name: string) {
  return name.trim().replace(/['ʼ’]/g, '’').toLocaleLowerCase()
}

// a person can't take the computer's display name in any language (CM-8);
// the message comes from the i18n generateMessage config (validation.computerName)
defineRule('notComputerName', (fieldValue: string) => {
  const computerNames = SUPPORTED_LOCALES.map((locale) =>
    normalizeName(i18n.global.getLocaleMessage(locale).players.computer),
  )
  return !computerNames.includes(normalizeName(fieldValue ?? ''))
})

const props = defineProps<{
  number: 1 | 2
  parentForm: string
  otherPlayerNames: string[]
  // replaces "Player N", e.g. "You" in Versus computer mode
  legend?: string
  // Versus computer mode: reject the computer's name (CM-8)
  rejectComputerName?: boolean
  // Two players mode: the other player's color, which this player can't take (VR-36)
  otherPlayerColor?: string
}>()

const { t } = useI18n()

const nameRules = computed(() => {
  const rules = `required|max:${MAX_NAME_LENGTH}|differentFromAll:${props.otherPlayerNames}`
  return props.rejectComputerName ? `${rules}|notComputerName` : rules
})

// the picked swatch is the group's Tab stop; with none picked, the first one is (VR-34)
function isTabStop(index: number, value: unknown) {
  const picked = SWATCHES.findIndex((swatch) => swatch.hex === value)
  return index === (picked === -1 ? 0 : picked)
}

const STEP: Partial<Record<string, 1 | -1>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
}

// arrow keys move to the next or previous swatch, wrapping around, and pick it (VR-34)
function onSwatchKeydown(event: KeyboardEvent, value: unknown, pick: (hex: string) => void) {
  const step = STEP[event.key]
  if (!step) return
  event.preventDefault()
  const picked = SWATCHES.findIndex((swatch) => swatch.hex === value)
  const next = (Math.max(picked, 0) + step + SWATCHES.length) % SWATCHES.length
  const swatch = SWATCHES[next]
  if (!swatch) return
  pick(swatch.hex)
  const group = event.currentTarget as HTMLElement
  group.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus()
}

const colorRules = computed(() =>
  props.otherPlayerColor ? `differentColor:${props.otherPlayerColor}` : '',
)
</script>

<style lang="scss" scoped></style>
