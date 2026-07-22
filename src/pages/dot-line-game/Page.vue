<template>
  <!-- <div>
    Test
  </div> -->
  <div>
    Game
    {{ initialGame }}
  </div>
</template>

<script setup lang="ts">
  import { DotLineGame } from '@/models';
  import { onMounted, reactive } from 'vue';

  const initialGame = reactive<DotLineGame>(new DotLineGame())

  onMounted(() => {
    console.log('onMounted', initialGame);
    
    setTimeout(() => {
    initialGame.addPlayer1({
      'name': 'test',
      color: '232323'
    })
    console.log('onMounted', initialGame);
    }, 3000)

  })

</script>

<style lang="scss" scoped>

</style>