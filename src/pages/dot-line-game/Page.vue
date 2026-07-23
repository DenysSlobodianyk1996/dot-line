<template>
  <component
    :is="dotLineGame.isGameStarted ? Game : GameSetup"
    :dot-line-game="dotLineGame"
    @game-setup="gameSetup"
  ></component>
</template>

<script setup lang="ts">
import { DotLineGame, type GameSetupForm } from '@/models'
import { reactive } from 'vue'
import GameSetup from './game-setup/GameSetup.vue'
import Game from './Game.vue'

const dotLineGame = reactive<DotLineGame>(new DotLineGame())

function gameSetup({ player1, player2, size }: GameSetupForm) {
  dotLineGame.setPlayer1(player1).setPlayer2(player2).setSize(size)
}
</script>

<style lang="scss" scoped></style>
