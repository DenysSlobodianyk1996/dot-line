<template>
  <div class="flex flex-col gap-4">
    <!-- board + panel centered horizontally, top-aligned (MB-9) -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-6">
      <GameBoard
        v-model:selected-dot="selectedDot"
        :dot-line-game="dotLineGame"
        :locked="isBoardLocked"
      />
      <GameResult
        v-if="dotLineGame.isFinished"
        :dot-line-game="dotLineGame"
        @new-game-settings="newGameSettings"
        @rematch="rematch"
      />
      <GameStatus
        v-else
        :dot-line-game="dotLineGame"
        :hint="hint"
        v-model:confirming="isStopConfirmOpen"
        :thinking="isBoardLocked"
        @stop="stop"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Dot, DotLineGame } from '@/models'
import { StorageService } from '@/services'
import { CURRENT_GAME } from '@/static'
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import GameBoard from './game/GameBoard.vue'
import GameResult from './game/GameResult.vue'
import GameStatus from './game/GameStatus.vue'
import { useRulesPanel } from '@/shared/composables/useRulesPanel'
import { useComputerTurn } from './useComputerTurn'

const props = defineProps<{
  dotLineGame: DotLineGame
}>()

const selectedDot = ref<Dot | null>(null)

const { t } = useI18n()

const hint = computed(() => {
  if (selectedDot.value) {
    return t('game.hintSelected')
  }
  if (props.dotLineGame.lines.length === 0) {
    return t('game.hintFirstLine')
  }
  return t('game.hintStart')
})

// the Stop dialog is open: the computer waits for the answer (VC-13); it waits while the rules
// panel is open too (VR-31)
const rulesPanel = useRulesPanel()
const isStopConfirmOpen = ref(false)

// the computer player's turns: ~1 s pause, then its line (CM-11, CM-15, CM-31)
const computerTurn = useComputerTurn(
  () => props.dotLineGame,
  () => isStopConfirmOpen.value || rulesPanel.isOpen.value,
)

// on the computer's turn nothing can be picked and clicks are ignored (CM-16)
const isBoardLocked = computed(
  () => computerTurn.isThinking.value || props.dotLineGame.isComputerTurn,
)

watchEffect(() => {
  StorageService.setItem(CURRENT_GAME, props.dotLineGame)
})

function stop() {
  isStopConfirmOpen.value = false
  computerTurn.cancel()
  selectedDot.value = null
  props.dotLineGame.stop()
}

function rematch() {
  computerTurn.cancel()
  selectedDot.value = null
  props.dotLineGame.start()
}

function newGameSettings() {
  computerTurn.cancel()
  StorageService.removeItem(CURRENT_GAME)
  props.dotLineGame.reset()
}
</script>

<style lang="scss" scoped></style>
