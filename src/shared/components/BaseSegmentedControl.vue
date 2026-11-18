<template>
  <div class="flex flex-col gap-2">
    <!-- the visible label; the group carries the same text as its accessible name -->
    <div aria-hidden="true" class="block text-sm font-medium text-ink-soft">{{ label }}</div>
    <div
      role="radiogroup"
      :aria-label="label"
      :aria-describedby="hint ? hintId : undefined"
      class="flex gap-0.5 rounded-md border border-border bg-surface p-0.5 shadow-sm"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="model === option.value"
        class="min-h-11 flex-1 cursor-pointer rounded px-3 text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent sm:min-h-8"
        :class="
          model === option.value
            ? 'bg-accent text-on-accent'
            : 'text-ink-soft hover:bg-surface-muted'
        "
        @click="model = option.value"
      >
        {{ option.label }}
      </button>
    </div>
    <BaseHint v-if="hint" :id="hintId">{{ hint }}</BaseHint>
  </div>
</template>

<script setup lang="ts" generic="T extends string">
// A labelled full-width switch between a few options, styled like the language toggle
// (design: game mode and difficulty switches; CM-1, CM-5, CM-38), with an optional muted hint
// below it that describes the group (VC-26)
import { useId } from 'vue'
import BaseHint from './BaseHint.vue'

defineProps<{
  label: string
  options: { value: T; label: string }[]
  hint?: string
}>()

const model = defineModel<T>({ required: true })
const hintId = useId()
</script>
