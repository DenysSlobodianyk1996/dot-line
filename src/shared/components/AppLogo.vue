<template>
  <!-- decorative: the game name next to it is the accessible text (VR-18); v-html renders our own logo source -->
  <span
    data-app-logo
    aria-hidden="true"
    class="app-logo size-8 shrink-0 text-ink"
    v-html="svg"
  ></span>
</template>

<script setup lang="ts">
import { logoSvg } from '@/shared/logo'

// the dots take the text color, so they turn cream in the dark theme (VR-19)
const svg = logoSvg({ dot: 'currentColor' })
</script>

<style>
.app-logo > svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* the dashed "waiting" line creeps forward, unless the device asks for less motion (VR-19, VR-20) */
@media (prefers-reduced-motion: no-preference) {
  .app-logo .logo-wait {
    animation: logo-wait 1.2s linear infinite;
  }
}

/* one dash period (0.1 + 16), so the loop is seamless */
@keyframes logo-wait {
  to {
    stroke-dashoffset: -16.1;
  }
}
</style>
