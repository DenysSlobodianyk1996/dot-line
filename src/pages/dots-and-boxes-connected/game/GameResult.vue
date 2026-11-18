<template>
  <div data-side-panel data-result-panel class="flex w-full flex-col gap-4 sm:w-53 sm:shrink-0">
    <!-- where Stop was (UP-6). Phones: two equal 44 px columns (MB-6, MB-8, UP-7); sm+: a full-width
         stack with Rematch on top, so nothing wraps raggedly (UP-8) -->
    <div data-panel-actions class="grid grid-cols-2 gap-2 sm:flex sm:flex-col">
      <BaseButton
        color="secondary"
        class="min-h-11 w-full gap-2 sm:min-h-0"
        @click="emit('newGameSettings')"
      >
        <SettingsIcon :size="20" class="shrink-0" />
        {{ t('result.newGameSettings') }}
      </BaseButton>
      <BaseButton
        color="primary"
        class="min-h-11 w-full gap-2 sm:order-first sm:min-h-0"
        @click="emit('rematch')"
      >
        <RefreshIcon :size="20" class="shrink-0" />
        {{ t('result.rematch') }}
      </BaseButton>
    </div>

    <div class="flex flex-col gap-1">
      <div class="text-sm font-medium text-ink-soft">{{ t('result.title') }}</div>
      <!-- the result card (UP-10..UP-14): a trophy, or the robot when the computer won (CM-13),
           none on a draw; one entrance, only when the device allows motion -->
      <div
        data-result-card
        class="flex flex-col items-center gap-2 rounded-2xl bg-accent-soft p-4 text-center motion-safe:animate-result-in"
      >
        <template v-if="winner">
          <RobotIcon v-if="isComputerPlayer(winner.name)" :size="40" class="text-ink" />
          <TrophyIcon v-else :size="40" class="text-accent" />
        </template>
        <!-- the whole name, wrapping if needed (GB-5) -->
        <h3 class="max-w-full min-w-0 text-xl font-bold wrap-break-word text-ink">
          {{ winner ? winnerTitle : t('result.draw') }}
        </h3>
        <!-- winner first; each number sits on its player's swatch chip, so it stays readable on
             any color in both themes -->
        <div
          data-result-score
          class="flex items-center gap-2 text-4xl font-bold text-ink tabular-nums"
        >
          <template v-for="(player, index) in rankedPlayers" :key="player.name">
            <!-- spaced for screen readers and copy ("5 : 3"); the gap does it on screen -->
            <span v-if="index > 0">{{ ' : ' }}</span>
            <span class="min-w-14 rounded-xl border-2 px-2.5" :style="chipStyle(player.color)">
              {{ dotsAndBoxesGame.scoreOf(player.name) }}
            </span>
          </template>
        </div>
        <p class="text-sm text-muted">{{ reason }}</p>
      </div>
    </div>

    <div class="flex flex-col gap-1">
      <div class="text-sm font-medium text-ink-soft">{{ t('result.score') }}</div>
      <PlayerScore
        v-for="player in rankedPlayers"
        :key="player.name"
        :player
        :score="dotsAndBoxesGame.scoreOf(player.name)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isComputerPlayer, type DotsAndBoxesGame } from '@/models'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/shared/components/BaseButton.vue'
import RobotIcon from '@/shared/components/RobotIcon.vue'
import TrophyIcon from '@/shared/icons/TrophyIcon.vue'
import PlayerScore from './PlayerScore.vue'
import RefreshIcon from '@/shared/icons/RefreshIcon.vue'
import SettingsIcon from '@/shared/icons/SettingsIcon.vue'
import { useDisplayName } from '@/shared/composables/useDisplayName'

const props = defineProps<{
  dotsAndBoxesGame: DotsAndBoxesGame
}>()

const emit = defineEmits<{
  newGameSettings: []
  rematch: []
}>()

const { t } = useI18n()
const displayName = useDisplayName()

const winner = computed(() => props.dotsAndBoxesGame.winner)

// Versus computer speaks to the person; Two players names the winner (CM-27)
const winnerTitle = computed(() => {
  const name = winner.value?.name
  if (props.dotsAndBoxesGame.isComputerGame) {
    return isComputerPlayer(name) ? t('result.computerWon') : t('result.youWon')
  }
  return t('result.wins', { name: displayName(name ?? '') })
})

const reason = computed(() =>
  props.dotsAndBoxesGame.finishReason === 'stopped' ? t('result.stopped') : t('result.completed'),
)

// a tint of the player's color under the ink number, edged in the full color (UP-10, VR-17)
function chipStyle(color: string) {
  return {
    borderColor: color,
    backgroundColor: `color-mix(in srgb, ${color} 30%, var(--color-surface))`,
  }
}

// winner first; a draw keeps player order
const rankedPlayers = computed(() => {
  const game = props.dotsAndBoxesGame
  return [...game.players].sort((a, b) => game.scoreOf(b.name) - game.scoreOf(a.name))
})
</script>
