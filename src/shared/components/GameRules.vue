<template>
  <section :aria-labelledby="titleId" class="flex flex-col gap-3">
    <h2 :id="titleId" class="text-lg font-bold text-ink">{{ t('rules.title') }}</h2>
    <!-- the goal comes before the steps (NG-7) -->
    <p data-rules-goal class="text-sm text-ink"><GameGoal /></p>
    <ol data-rules-steps class="flex flex-col gap-2">
      <li v-for="step in STEPS" :key="step" class="flex items-start gap-2 text-sm text-ink-soft">
        <span
          class="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-strong text-xs font-semibold"
          aria-hidden="true"
        >
          {{ step }}
        </span>
        <span>{{ t(`rules.step${step}`) }}</span>
      </li>
    </ol>
    <RulesStoryboard />
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import GameGoal from './GameGoal.vue'
import RulesStoryboard from './RulesStoryboard.vue'

// the rules panel labels itself with this title (VR-29)
defineProps<{ titleId: string }>()

// rules text lives in src/i18n/locales (rules.goal, rules.step1–step5) and must match the spec
// (RL-5, VR-30)
const STEPS = [1, 2, 3, 4, 5] as const

const { t } = useI18n()
</script>
