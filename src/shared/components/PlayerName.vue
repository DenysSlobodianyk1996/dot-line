<template>
  <!-- the displayed name; the computer player gets the robot icon in front of it (CM-12, CM-13) -->
  <span>
    <RobotIcon
      v-if="isComputerPlayer(name)"
      :size="iconSize"
      class="mr-1 inline-block align-[-0.2em]"
    />{{ displayName(name) }}
  </span>
</template>

<script setup lang="ts">
import { isComputerPlayer } from '@/models'
import { useDisplayName } from '@/shared/composables/useDisplayName'
import RobotIcon from './RobotIcon.vue'

withDefaults(
  defineProps<{
    name: string | null | undefined
    iconSize?: number
  }>(),
  { iconSize: 16 },
)

const displayName = useDisplayName()
</script>
