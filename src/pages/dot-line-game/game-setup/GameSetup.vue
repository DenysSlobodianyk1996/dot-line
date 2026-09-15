<template>
  <div class="max-w-130">
    <h3 class="w-full text-center font-bold text-xl mb-4">Game Setup</h3>
    <Form
      :initial-values="formInitialValues"
      class="flex flex-col gap-2"
      @submit="emit('gameSetup', $event as GameSetupForm)"
      v-slot="{ values }"
    >
      <div class="flex flex-col gap-2 sm:flex-row">
        <PlayerField
          label="Player 1"
          parent-form="player1"
          :other-player-names="[values.player2?.name]"
        />
        <PlayerField
          label="Player 2"
          parent-form="player2"
          :other-player-names="[values.player1?.name]"
        />
      </div>

      <Field
        name="size"
        label="Size"
        :rules="`required|min_value:2|max_value:10`"
        v-slot="{ field, errorMessage }"
      >
        <div class="flex flex-col gap-2">
          <BaseLabel :for="field.name">Size</BaseLabel>
          <BaseInput v-bind="field" :id="field.name" :title="field.value" type="number" />
          <BaseFieldError :errorMessage />
        </div>
      </Field>

      <BaseButton color="primary" type="submit">Save</BaseButton>
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
import BaseButton from '@/shared/components/BaseButton.vue'

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
