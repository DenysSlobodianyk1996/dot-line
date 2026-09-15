<template>
  <fieldset class="rounded-lg border border-gray-300 p-4 flex gap-2">
    <legend class="px-2 text-sm font-semibold text-gray-700">
      {{ t('setup.player', { number }) }}
    </legend>
    <Field
      :name="`${props.parentForm}.name`"
      :label="t('setup.playerName', { number })"
      :rules="`required|differentFromAll:${otherPlayerNames}`"
      v-slot="{ field, errorMessage }"
    >
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <BaseLabel :for="field.name">{{ t('setup.name') }}</BaseLabel>
        <BaseInput v-bind="field" :id="field.name" :title="field.value" type="text" />
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
import { required } from '@vee-validate/rules'
import { useI18n } from 'vue-i18n'
import BaseLabel from '@/shared/components/BaseLabel.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseFieldError from '@/shared/components/BaseFieldError.vue'

defineRule('required', required)
// the message comes from the i18n generateMessage config (validation.differentNames)
defineRule('differentFromAll', (fieldValue: string, otherValues: string[]) => {
  return !otherValues
    ?.filter(Boolean)
    ?.map((s) => s.toLocaleLowerCase())
    ?.includes(fieldValue?.toLowerCase())
})

const props = defineProps<{
  number: 1 | 2
  parentForm: string
  otherPlayerNames: string[]
}>()

const { t } = useI18n()
</script>

<style lang="scss" scoped></style>
