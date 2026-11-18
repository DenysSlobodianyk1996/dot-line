<template>
  <div data-side-panel class="flex w-full flex-col gap-4 sm:w-53 sm:shrink-0">
    <!-- Stop sits on top so the changing text below never moves it (UP-4) -->
    <div data-panel-actions class="flex">
      <BaseButton
        color="secondary"
        class="min-h-11 w-full gap-2 sm:min-h-0 sm:w-auto"
        @click="isConfirmOpen = true"
      >
        <!-- icon before the label for children who can't read yet (UP-9) -->
        <StopHandIcon :size="20" class="shrink-0" />
        {{ t('status.stop') }}
      </BaseButton>
    </div>

    <!-- phones: Turn and Score side by side (MB-2) -->
    <div class="grid grid-cols-2 gap-4 sm:flex sm:flex-col">
      <div class="flex min-w-0 flex-col gap-1">
        <div class="text-sm font-medium text-ink-soft">{{ t('status.turn') }}</div>
        <!-- the whole name, wrapping if needed (GB-5) -->
        <div class="flex items-start gap-2 leading-6 font-semibold text-ink">
          <span
            class="mt-1.5 size-3 shrink-0 rounded-full"
            :style="{ backgroundColor: dotsAndBoxesGame.currentPlayer?.color }"
          ></span>
          <!-- Versus computer: the person's own turn reads "Your turn" (CM-19) -->
          <span v-if="isPersonTurn" class="min-w-0 wrap-break-word">{{
            t('status.yourTurn')
          }}</span>
          <PlayerName
            v-else
            class="min-w-0 wrap-break-word"
            :name="dotsAndBoxesGame.currentPlayer?.name"
            :icon-size="20"
          />
        </div>
        <!-- always rendered, so screen readers announce "Thinking…" and then the computer's line
             (CM-14, CM-37); keeps one line even when empty (UP-5) -->
        <p
          aria-live="polite"
          class="min-h-[1lh] text-sm text-muted"
          :class="{ 'animate-pulse': thinking }"
        >
          {{ announcement }}
        </p>
      </div>

      <div class="flex min-w-0 flex-col gap-1">
        <div class="text-sm font-medium text-ink-soft">{{ t('status.score') }}</div>
        <PlayerScore
          v-for="player in dotsAndBoxesGame.players"
          :key="player.name"
          :player
          :score="dotsAndBoxesGame.scoreOf(player.name)"
        />
      </div>
    </div>

    <!-- "Thinking…" replaces the hint on the computer's turn (CM-14). The hint is only hidden, and
         the area is as tall as the longest hint in this language (invisible copies share its grid
         cell), so nothing jumps (UP-5) -->
    <div class="grid text-sm text-muted">
      <span
        v-for="key in HINT_KEYS"
        :key
        aria-hidden="true"
        class="invisible col-start-1 row-start-1"
        >{{ t(key) }}</span
      >
      <p data-hint class="col-start-1 row-start-1" :class="{ invisible: thinking }">
        {{ hint }}
      </p>
    </div>

    <div
      v-if="isConfirmOpen"
      class="fixed inset-0 z-10 flex items-center justify-center bg-ink/40 p-4"
      @click.self="isConfirmOpen = false"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stop-game-title"
        class="flex w-full max-w-75 flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-lg"
      >
        <h3 id="stop-game-title" class="text-xl font-bold text-ink">
          {{ t('status.stopTitle') }}
        </h3>
        <p class="text-sm text-ink-soft">{{ t('status.stopText') }}</p>
        <div class="flex flex-col">
          <PlayerScore
            v-for="player in dotsAndBoxesGame.players"
            :key="player.name"
            :player
            :score="dotsAndBoxesGame.scoreOf(player.name)"
          />
        </div>
        <div class="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <BaseButton color="secondary" class="min-h-11 sm:min-h-0" @click="isConfirmOpen = false">
            {{ t('status.cancel') }}
          </BaseButton>
          <BaseButton color="primary" class="min-h-11 sm:min-h-0" @click="confirmStop">
            {{ t('status.stopGame') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isComputerPlayer, type DotsAndBoxesGame } from '@/models'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/shared/components/BaseButton.vue'
import PlayerName from '@/shared/components/PlayerName.vue'
import PlayerScore from './PlayerScore.vue'
import StopHandIcon from '@/shared/icons/StopHandIcon.vue'

const props = defineProps<{
  dotsAndBoxesGame: DotsAndBoxesGame
  hint: string
  // the computer's move is pending (CM-14)
  thinking?: boolean
}>()

const isPersonTurn = computed(
  () => props.dotsAndBoxesGame.isComputerGame && !props.dotsAndBoxesGame.isComputerTurn,
)

const { t } = useI18n()

// every hint Game can show; the hint area reserves the tallest (UP-5)
const HINT_KEYS = ['game.hintFirstLine', 'game.hintStart', 'game.hintSelected'] as const

// what the live region says: "Thinking…" while the computer's move is pending, then what its line
// did until the next line is drawn (CM-37)
const announcement = computed(() => {
  if (props.thinking) return t('status.thinking')
  const { lines } = props.dotsAndBoxesGame
  const newest = lines[lines.length - 1]
  if (!newest || !isComputerPlayer(newest.ownerName)) return ''
  // an owned square next to the newest line was closed by it
  const claimed = props.dotsAndBoxesGame
    .squaresNextTo(newest)
    .filter(({ row, col }) => props.dotsAndBoxesGame.getSquare(row, col)).length
  if (claimed === 2) return t('status.computerClaimedTwo')
  if (claimed === 1) return t('status.computerClaimedOne')
  return t('status.computerDrew')
})

const emit = defineEmits<{
  stop: []
}>()

// the Stop dialog is open; Game pauses the computer's move meanwhile (VC-13)
const isConfirmOpen = defineModel<boolean>('confirming', { default: false })

function confirmStop() {
  isConfirmOpen.value = false
  emit('stop')
}
</script>
