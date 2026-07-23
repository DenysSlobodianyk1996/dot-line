<template>
  <component
    :is="componentConfig.component"
    v-bind="componentConfig.props"
    v-on="componentConfig.listeners">
  </component>
</template>

<script setup lang="ts">
import { DotLineGame, type GameSetupForm } from '@/models'
import { computed, reactive } from 'vue'
import GameSetup from './game-setup/GameSetup.vue'
import Game from './Game.vue'

const dotLineGame = reactive<DotLineGame>(new DotLineGame())

const componentConfig = computed(() => {
  if (dotLineGame.isGameStarted) {
    return {
      component: Game,
      props: {
        dotLineGame,
      },
      listeners: {}
    }
  }
  return {
    component: GameSetup,
    props: {},
    listeners: {
      gameSetup
    }
  }
})

function gameSetup({ player1, player2, size }: GameSetupForm) {
  dotLineGame.setPlayer1(player1).setPlayer2(player2).setSize(size)
}
</script>

<style lang="scss" scoped></style>
