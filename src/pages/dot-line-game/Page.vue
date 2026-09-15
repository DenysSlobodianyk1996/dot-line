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
import { DotLineGame, type GameSetupForm } from '@/models'
import { computed, reactive } from 'vue'
import GameSetup from './game-setup/GameSetup.vue'
import Game from './Game.vue'
import { StorageService } from '@/services/storage.service.ts'
import { CURRENT_GAME } from '@/static/storage-keys.ts'

const dotLineGame = reactive<DotLineGame>(new DotLineGame())

const savedGame: Partial<DotLineGame> | null = StorageService.getItem(CURRENT_GAME, {
  applyParse: true,
})
dotLineGame.reset(savedGame)

// games saved before gameplay existed have no current player yet (PS-3)
if (dotLineGame.isGameStarted && !dotLineGame.isFinished && !dotLineGame.currentPlayerName) {
  dotLineGame.start()
}

const componentConfig = computed(() => {
  if (dotLineGame.isGameStarted) {
    return {
      component: Game,
      props: {
        dotLineGame,
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

function gameSetup({ player1, player2, size }: GameSetupForm) {
  dotLineGame.setPlayer1(player1).setPlayer2(player2).setSize(size).start()
}
</script>

<style lang="scss" scoped></style>
