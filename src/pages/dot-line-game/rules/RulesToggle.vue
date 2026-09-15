<template>
  <div class="flex flex-col gap-2 sm:items-start">
    <BaseButton
      color="secondary"
      class="min-h-11 w-full sm:min-h-0 sm:w-auto"
      :aria-expanded="isOpen"
      :aria-controls="rulesId"
      @click="isOpen = !isOpen"
    >
      {{ isOpen ? 'Hide rules' : 'Show rules' }}
    </BaseButton>
    <GameRules v-show="isOpen" :id="rulesId" class="sm:self-stretch" />
  </div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import GameRules from './GameRules.vue'

const props = defineProps<{
  defaultOpen?: boolean
}>()

// not saved: setup opens the rules by default, the game screen doesn't (RL-3)
const isOpen = ref(props.defaultOpen)
const rulesId = useId()
</script>
