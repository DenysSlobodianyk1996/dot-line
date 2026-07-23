<template>
  <fieldset class="rounded-lg border border-gray-300 p-4 flex gap-2">
    <legend class="px-2 text-sm font-semibold text-gray-700">{{ label }}</legend>
    <Field
      :name="`${props.parentForm}.name`"
      :rules="`required|differentFromAll:${otherPlayerNames}`"
      v-slot="{ field, errorMessage }"
    >
      <div class="flex flex-col gap-2">
        <BaseLabel :for="field.name">Name</BaseLabel>
        <BaseInput v-bind="field" :id="field.name" :title="field.value" type="text" />
        <BaseFieldError :errorMessage />
      </div>
    </Field>
    <Field :name="`${props.parentForm}.color`" v-slot="{ field }">
      <div class="flex flex-col gap-2">
        <BaseLabel :for="field.name">Color</BaseLabel>
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
import BaseLabel from '@/shared/components/BaseLabel.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseFieldError from '@/shared/components/BaseFieldError.vue'

defineRule('required', required)
defineRule('differentFromAll', (fieldValue: string, otherValues: string) => {
  return !otherValues.includes(fieldValue) || 'Values must be different'
})

const props = defineProps<{
  label: string
  parentForm: string
  otherPlayerNames: string[]
}>()
</script>

<style lang="scss" scoped></style>
