<template>
  <div class="flex w-full flex-col gap-4 sm:w-50 sm:shrink-0">
    <!-- phones: Turn and Score side by side (MB-2) -->
    <div class="grid grid-cols-2 gap-4 sm:flex sm:flex-col">
      <div class="flex min-w-0 flex-col gap-1">
        <div class="text-sm font-medium text-gray-700">{{ t('status.turn') }}</div>
        <div class="flex items-center gap-2 font-semibold text-gray-900">
          <span
            class="size-3 shrink-0 rounded-full"
            :style="{ backgroundColor: dotLineGame.currentPlayer?.color }"
          ></span>
          <span class="min-w-0 truncate">{{ dotLineGame.currentPlayer?.name }}</span>
        </div>
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

    <p class="text-sm text-gray-500">{{ hint }}</p>

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
          <BaseButton
            color="secondary"
            class="min-h-11 sm:min-h-0"
            @click="isConfirmOpen = false"
          >
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
import type { DotLineGame } from '@/models'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/shared/components/BaseButton.vue'
import PlayerScore from './PlayerScore.vue'

defineProps<{
  dotLineGame: DotLineGame
  hint: string
}>()

const emit = defineEmits<{
  stop: []
}>()

const { t } = useI18n()

const isConfirmOpen = ref(false)

function confirmStop() {
  isConfirmOpen.value = false
  emit('stop')
}
</script>
