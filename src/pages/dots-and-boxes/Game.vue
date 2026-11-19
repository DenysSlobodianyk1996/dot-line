<template>
  <div class="flex flex-col gap-4">
    <!-- board + panel centered horizontally, top-aligned (MB-9) -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-6">
      <GameBoard
        v-model:selected-dot="selectedDot"
        :dots-and-boxes-game="dotsAndBoxesGame"
        :locked="isBoardLocked"
      />
      <GameResult
        v-if="dotsAndBoxesGame.isFinished"
        :dots-and-boxes-game="dotsAndBoxesGame"
        @new-game-settings="newGameSettings"
        @rematch="rematch"
      />
      <GameStatus
        v-else
        :dots-and-boxes-game="dotsAndBoxesGame"
        :hint="hint"
        v-model:confirming="isStopDialogOpen"
        :thinking="isBoardLocked"
        @stop="stop"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Dot, DotsAndBoxesGame } from '@/models'
import { StorageService } from '@/services'
import { CURRENT_GAME } from '@/static'
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import GameBoard from './game/GameBoard.vue'
import GameResult from './game/GameResult.vue'
import GameStatus from './game/GameStatus.vue'
import { HINT_KEYS } from './game/hint-keys'
import { useRulesPanel } from '@/shared/composables/useRulesPanel'
import { useStopDialog } from '@/shared/composables/useStopDialog'
import { useComputerTurn } from './useComputerTurn'

const props = defineProps<{
  dotsAndBoxesGame: DotsAndBoxesGame
}>()

const selectedDot = ref<Dot | null>(null)

const { t } = useI18n()

const hint = computed(() => {
  if (selectedDot.value) {
    return t(HINT_KEYS.selected)
  }
  if (props.dotsAndBoxesGame.lines.length === 0) {
    return t(HINT_KEYS.firstLine)
  }
  return t(HINT_KEYS.start)
})

// the Stop dialog is open: the computer waits for the answer (VC-13); it waits while the rules
// panel is open too (VR-31). The Stop dialog's state is shared so the Android back button can
// close it (AR-3); it never outlives the game screen.
const rulesPanel = useRulesPanel()
const stopDialog = useStopDialog()
// a top-level ref, so the template unwraps it for v-model
const isStopDialogOpen = stopDialog.isOpen
onUnmounted(stopDialog.close)

// the computer player's turns: ~1 s pause, then its line (CM-11, CM-15, CM-31)
const computerTurn = useComputerTurn(
  () => props.dotsAndBoxesGame,
  () => stopDialog.isOpen.value || rulesPanel.isOpen.value,
)

// on the computer's turn nothing can be picked and clicks are ignored (CM-16)
const isBoardLocked = computed(
  () => computerTurn.isThinking.value || props.dotsAndBoxesGame.isComputerTurn,
)

watchEffect(() => {
  StorageService.setItem(CURRENT_GAME, props.dotsAndBoxesGame)
})

function stop() {
  stopDialog.close()
  computerTurn.cancel()
  selectedDot.value = null
  props.dotsAndBoxesGame.stop()
}

function rematch() {
  computerTurn.cancel()
  selectedDot.value = null
  props.dotsAndBoxesGame.start()
}

function newGameSettings() {
  computerTurn.cancel()
  StorageService.removeItem(CURRENT_GAME)
  props.dotsAndBoxesGame.reset()
}
</script>

<style lang="scss" scoped></style>
