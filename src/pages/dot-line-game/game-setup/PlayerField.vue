<template>
  <fieldset class="flex min-w-0 flex-1 gap-2 rounded-lg border border-gray-300 p-4">
    <legend class="px-2 text-sm font-semibold text-gray-700">
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
    <Field :name="`${props.parentForm}.color`" v-slot="{ field }">
      <div class="flex flex-col gap-2">
        <BaseLabel :for="field.name">{{ t('setup.color') }}</BaseLabel>
        <BaseInput
          v-bind="field"
          :id="field.name"
          :title="field.value"
          type="color"
          class="w-10! h-9.5! p-0!"
        />
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
}>()

const { t } = useI18n()

const nameRules = computed(() => {
  const rules = `required|max:${MAX_NAME_LENGTH}|differentFromAll:${props.otherPlayerNames}`
  return props.rejectComputerName ? `${rules}|notComputerName` : rules
})
</script>

<style lang="scss" scoped></style>
