<template>
  <div class="flex w-full flex-col gap-4 sm:w-50 sm:shrink-0">
    <!-- phones: Turn and Score side by side (MB-2) -->
    <div class="grid grid-cols-2 gap-4 sm:flex sm:flex-col">
      <div class="flex min-w-0 flex-col gap-1">
        <div class="text-sm font-medium text-gray-700">{{ t('status.turn') }}</div>
        <!-- the whole name, wrapping if needed (GB-5) -->
        <div class="flex items-start gap-2 leading-6 font-semibold text-gray-900">
          <span
            class="mt-1.5 size-3 shrink-0 rounded-full"
            :style="{ backgroundColor: dotLineGame.currentPlayer?.color }"
          ></span>
          <!-- Versus computer: the person's own turn reads "Your turn" (CM-19) -->
          <span v-if="isPersonTurn" class="min-w-0 wrap-break-word">{{
            t('status.yourTurn')
          }}</span>
          <PlayerName
            v-else
            class="min-w-0 wrap-break-word"
            :name="dotLineGame.currentPlayer?.name"
            :icon-size="20"
          />
        </div>
        <!-- always rendered, so screen readers announce "Thinking…" and then the computer's line
             (CM-14, CM-37) -->
        <p aria-live="polite" class="text-sm text-gray-500" :class="{ 'animate-pulse': thinking }">
          {{ announcement }}
        </p>
      </div>

      <div class="flex min-w-0 flex-col gap-1">
        <div class="text-sm font-medium text-gray-700">{{ t('status.score') }}</div>
        <PlayerScore
          v-for="player in dotLineGame.players"
          :key="player.name"
          :player
          :score="dotLineGame.scoreOf(player.name)"
        />
      </div>
    </div>

    <!-- "Thinking…" takes the hint's place on the computer's turn (CM-14) -->
    <p v-if="!thinking" data-hint class="text-sm text-gray-500">{{ hint }}</p>

    <div class="flex">
      <BaseButton
        color="secondary"
        class="min-h-11 w-full sm:min-h-0 sm:w-auto"
        @click="isConfirmOpen = true"
      >
        {{ t('status.stop') }}
      </BaseButton>
    </div>

    <div
      v-if="isConfirmOpen"
      class="fixed inset-0 z-10 flex items-center justify-center bg-gray-900/40 p-4"
      @click.self="isConfirmOpen = false"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stop-game-title"
        class="flex w-full max-w-75 flex-col gap-4 rounded-lg border border-gray-300 bg-white p-6 shadow-lg"
      >
        <h3 id="stop-game-title" class="text-xl font-bold text-gray-900">
          {{ t('status.stopTitle') }}
        </h3>
        <p class="text-sm text-gray-700">{{ t('status.stopText') }}</p>
        <div class="flex flex-col">
          <PlayerScore
            v-for="player in dotLineGame.players"
            :key="player.name"
            :player
            :score="dotLineGame.scoreOf(player.name)"
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
import { isComputerPlayer, type DotLineGame } from '@/models'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/shared/components/BaseButton.vue'
import PlayerName from '@/shared/components/PlayerName.vue'
import PlayerScore from './PlayerScore.vue'

const props = defineProps<{
  dotLineGame: DotLineGame
  hint: string
  // the computer's move is pending (CM-14)
  thinking?: boolean
}>()

const isPersonTurn = computed(
  () => props.dotLineGame.isComputerGame && !props.dotLineGame.isComputerTurn,
)

const { t } = useI18n()

// what the live region says: "Thinking…" while the computer's move is pending, then what its line
// did until the next line is drawn (CM-37)
const announcement = computed(() => {
  if (props.thinking) return t('status.thinking')
  const { lines } = props.dotLineGame
  const newest = lines[lines.length - 1]
  if (!newest || !isComputerPlayer(newest.ownerName)) return ''
  // an owned square next to the newest line was closed by it
  const claimed = props.dotLineGame
    .squaresNextTo(newest)
    .filter(({ row, col }) => props.dotLineGame.getSquare(row, col)).length
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
