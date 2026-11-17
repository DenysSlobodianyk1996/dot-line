<template>
  <div class="flex w-full flex-col gap-4 sm:w-53 sm:shrink-0">
    <div class="flex flex-col gap-1">
      <div class="text-sm font-medium text-gray-700">{{ t('result.title') }}</div>
      <!-- the whole name, wrapping if needed (GB-5) -->
      <div v-if="winner" class="flex items-start gap-2">
        <span
          class="mt-1.5 size-4 shrink-0 rounded-full"
          :style="{ backgroundColor: winner.color }"
        ></span>
        <!-- the robot sits between the swatch and the heading (CM-13) -->
        <RobotIcon v-if="isComputerPlayer(winner.name)" :size="24" class="mt-0.5" />
        <h3 class="min-w-0 text-xl font-bold wrap-break-word text-gray-900">
          {{ winnerTitle }}
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
import { isComputerPlayer, type DotLineGame } from '@/models'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/shared/components/BaseButton.vue'
import RobotIcon from '@/shared/components/RobotIcon.vue'
import PlayerScore from './PlayerScore.vue'
import { useDisplayName } from '@/shared/composables/useDisplayName'

const props = defineProps<{
  dotLineGame: DotLineGame
}>()

const emit = defineEmits<{
  newGame: []
  rematch: []
}>()

const { t } = useI18n()
const displayName = useDisplayName()

const winner = computed(() => props.dotLineGame.winner)

// Versus computer speaks to the person; Two players names the winner (CM-27)
const winnerTitle = computed(() => {
  const name = winner.value?.name
  if (props.dotLineGame.isComputerGame) {
    return isComputerPlayer(name) ? t('result.computerWon') : t('result.youWon')
  }
  return t('result.wins', { name: displayName(name ?? '') })
})

const reason = computed(() =>
  props.dotLineGame.finishReason === 'stopped' ? t('result.stopped') : t('result.completed'),
)

// winner first; a draw keeps player order
const rankedPlayers = computed(() => {
  const game = props.dotLineGame
  return [...game.players].sort((a, b) => game.scoreOf(b.name) - game.scoreOf(a.name))
})
</script>
