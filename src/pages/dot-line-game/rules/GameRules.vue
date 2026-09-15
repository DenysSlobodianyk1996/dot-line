<template>
  <section
    :aria-labelledby="titleId"
    class="flex flex-col gap-3 rounded-lg border border-gray-300 bg-white p-4"
  >
    <h4 :id="titleId" class="text-sm font-semibold text-gray-900">{{ t('rules.title') }}</h4>
    <ol class="flex flex-col gap-2">
      <li v-for="step in STEPS" :key="step" class="flex items-start gap-2 text-sm text-gray-700">
        <span
          class="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold"
          aria-hidden="true"
        >
          {{ step }}
        </span>
        <span>{{ t(`rules.step${step}`) }}</span>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { useI18n } from 'vue-i18n'

// rules text lives in src/i18n/locales (rules.step1–step5) and must match the spec (RL-5)
const STEPS = [1, 2, 3, 4, 5] as const

const { t } = useI18n()
const titleId = useId()
</script>
