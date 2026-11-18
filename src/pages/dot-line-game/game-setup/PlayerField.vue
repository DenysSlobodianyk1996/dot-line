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
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <BaseLabel :for="field.name">{{ t('setup.name') }}</BaseLabel>
        <!-- names are at most 15 characters: the field doesn't accept more, and a longer value fails `max` (GS-1) -->
        <BaseInput
          v-bind="field"
          :id="field.name"
          :title="field.value"
          type="text"
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
        <div role="radiogroup" :aria-label="t('setup.color')" class="grid grid-cols-4 gap-2 p-1">
          <button
            v-for="swatch in SWATCHES"
            :key="swatch.key"
            type="button"
            role="radio"
            :aria-checked="value === swatch.hex"
            :aria-label="t(`colors.${swatch.key}`)"
            :title="t(`colors.${swatch.key}`)"
            class="size-8 cursor-pointer justify-self-center rounded-full ring-offset-2 ring-offset-paper transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            :class="value === swatch.hex ? 'scale-110 ring-3 ring-ink' : ''"
            :style="{ backgroundColor: swatch.hex }"
            @click="handleChange(swatch.hex)"
          ></button>
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

const colorRules = computed(() =>
  props.otherPlayerColor ? `differentColor:${props.otherPlayerColor}` : '',
)
</script>

<style lang="scss" scoped></style>
