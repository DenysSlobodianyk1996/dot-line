<template>
  <div class="flex w-full flex-col gap-4 sm:w-53 sm:shrink-0">
    <div class="flex flex-col gap-1">
      <div class="text-sm font-medium text-gray-700">{{ t('result.title') }}</div>
      <div v-if="winner" class="flex items-center gap-2">
        <span class="size-4 shrink-0 rounded-full" :style="{ backgroundColor: winner.color }"></span>
        <h3 class="min-w-0 truncate text-xl font-bold text-gray-900">
          {{ t('result.wins', { name: winner.name }) }}
        </h3>
      </div>
      <h3 v-else class="text-xl font-bold text-gray-900">{{ t('result.draw') }}</h3>
      <p class="text-sm text-gray-500">{{ reason }}</p>
    </div>

    <div class="flex flex-col gap-1">
      <div class="text-sm font-medium text-gray-700">{{ t('result.score') }}</div>
      <PlayerScore
        v-for="player in rankedPlayers"
        :key="player.name"
        :player
        :score="dotLineGame.scoreOf(player.name)"
      />
    </div>

    <!-- phones: equal-width 44 px buttons (MB-6, MB-8) -->
    <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      <BaseButton color="secondary" class="min-h-11 sm:min-h-0" @click="emit('newGame')">
        {{ t('result.newGame') }}
      </BaseButton>
      <BaseButton color="primary" class="min-h-11 sm:min-h-0" @click="emit('rematch')">
        {{ t('result.rematch') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DotLineGame } from '@/models'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/shared/components/BaseButton.vue'
import PlayerScore from './PlayerScore.vue'

const props = defineProps<{
  dotLineGame: DotLineGame
}>()

const emit = defineEmits<{
  newGame: []
  rematch: []
}>()

const { t } = useI18n()

const winner = computed(() => props.dotLineGame.winner)

const reason = computed(() =>
  props.dotLineGame.finishReason === 'stopped' ? t('result.stopped') : t('result.completed'),
)

// winner first; a draw keeps player order
const rankedPlayers = computed(() => {
  const game = props.dotLineGame
  return [...game.players].sort((a, b) => game.scoreOf(b.name) - game.scoreOf(a.name))
})
</script>
