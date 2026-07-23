<template>
  <div class="max-w-100">
    <h3 class="w-full text-center font-bold text-xl mb-4">Game Setup</h3>
    <Form
      :initial-values="formInitialValues"
      class="flex flex-col gap-2"
      @submit="emit('gameSetup', $event as GameSetupForm)"
      v-slot="{ values }"
    >
      <div class="flex gap-2">
        <PlayerField
          label="Player 1"
          parent-form="player1"
          :other-player-names="[values.player2?.name].filter(Boolean)"
        />
        <PlayerField
          label="Player 2"
          parent-form="player2"
          :other-player-names="[values.player1?.name].filter(Boolean)"
        />
      </div>

      <Field
        name="size"
        :rules="`required|min_value:2|max_value:10`"
        v-slot="{ field, errorMessage }"
      >
        <div class="flex flex-col gap-2">
          <BaseLabel :for="field.name">Size</BaseLabel>
          <BaseInput v-bind="field" :id="field.name" :title="field.value" type="number" />
          <BaseFieldError :errorMessage />
        </div>
      </Field>

      <button
        type="submit"
        class="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save
      </button>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { Form, Field, defineRule } from 'vee-validate'
import { required, min_value, max_value } from '@vee-validate/rules'
import PlayerField from './PlayerField.vue'
import type { GameSetupForm } from '@/models'

import BaseLabel from '@/shared/components/BaseLabel.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseFieldError from '@/shared/components/BaseFieldError.vue'
import { randomHexColor } from '@/utils'

defineRule('required', required)
defineRule('min_value', min_value)
defineRule('max_value', max_value)

const formInitialValues: GameSetupForm = {
  player1: {
    name: '',
    color: randomHexColor(),
  },
  player2: {
    name: '',
    color: randomHexColor(),
  },
  size: 2,
}

const emit = defineEmits<{
  gameSetup: [GameSetupForm]
}>()
</script>

<style lang="scss" scoped></style>
