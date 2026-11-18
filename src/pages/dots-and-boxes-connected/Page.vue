<template>
  <div>
    <component
      :is="componentConfig.component"
      v-bind="componentConfig.props"
      v-on="componentConfig.listeners"
    >
    </component>
  </div>
</template>

<script setup lang="ts">
import { DotsAndBoxesGame, type GameSetupForm } from '@/models'
import { computed, reactive } from 'vue'
import GameSetup from './game-setup/GameSetup.vue'
import Game from './Game.vue'
import { StorageService } from '@/services/storage.service.ts'
import { CURRENT_GAME } from '@/static/storage-keys.ts'

const dotsAndBoxesGame = reactive<DotsAndBoxesGame>(new DotsAndBoxesGame())

const savedGame: Partial<DotsAndBoxesGame> | null = StorageService.getItem(CURRENT_GAME, {
  applyParse: true,
})
dotsAndBoxesGame.reset(savedGame)

// games saved before gameplay existed have no current player yet (PS-3)
if (
  dotsAndBoxesGame.isGameStarted &&
  !dotsAndBoxesGame.isFinished &&
  !dotsAndBoxesGame.currentPlayerName
) {
  dotsAndBoxesGame.start()
}

const componentConfig = computed(() => {
  if (dotsAndBoxesGame.isGameStarted) {
    return {
      component: Game,
      props: {
        dotsAndBoxesGame,
      },
      listeners: {},
    }
  }
  return {
    component: GameSetup,
    props: {},
    listeners: {
      gameSetup,
    },
  }
})

// in Versus computer mode player2 is already the computer player (CM-9, ADR-0001)
function gameSetup({ gameMode, difficulty, player1, player2, size }: GameSetupForm) {
  dotsAndBoxesGame
    .setGameMode(gameMode, difficulty)
    .setPlayer1(player1)
    .setPlayer2(player2)
    .setSize(size)
    .start()
}
</script>

<style lang="scss" scoped></style>
