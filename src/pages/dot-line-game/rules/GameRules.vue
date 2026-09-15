<template>
  <section
    :aria-labelledby="titleId"
    class="flex flex-col gap-3 rounded-lg border border-gray-300 bg-white p-4"
  >
    <h4 :id="titleId" class="text-sm font-semibold text-gray-900">How to play</h4>
    <ol class="flex flex-col gap-2">
      <li
        v-for="(rule, index) in RULES"
        :key="index"
        class="flex items-start gap-2 text-sm text-gray-700"
      >
        <span
          class="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold"
          aria-hidden="true"
        >
          {{ index + 1 }}
        </span>
        <span>{{ rule }}</span>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { useId } from 'vue'

// keep in sync with the game rules in .claude/docs/dot-line-game/requirements.md (RL-5)
const RULES = [
  'Take turns drawing a line between two neighboring dots: left, right, up or down.',
  'The first line can go anywhere. After that, start from a dot that already has a line.',
  'Draw the fourth side of a square to claim it. One line can claim two squares.',
  'After every line, the turn passes to the other player.',
  'The game ends when all squares are claimed or someone presses Stop. Most squares wins; equal scores are a draw.',
]

const titleId = useId()
</script>
