<template>
  <div class="max-w-130">
    <h3 class="w-full text-center font-bold text-xl mb-4">{{ t('setup.title') }}</h3>
    <!-- keep-values: what's typed survives a game mode switch (CM-10) -->
    <Form
      :initial-values="formInitialValues"
      keep-values
      class="flex flex-col gap-2"
      @submit="submit"
      v-slot="{ values }"
    >
      <BaseSegmentedControl v-model="gameMode" :label="t('setup.mode')" :options="modeOptions" />
      <!-- #15: the difficulty switch goes here, shown only in Versus computer mode (CM-5, CM-6) -->

      <div class="flex flex-col gap-2 sm:flex-row">
        <template v-if="isComputerMode">
          <PlayerField
            :number="1"
            parent-form="player1"
            :legend="t('setup.you')"
            :other-player-names="[]"
            reject-computer-name
          />
          <ComputerOpponentField :color="computerColorFor(values.player1?.color)" />
        </template>
        <template v-else>
          <PlayerField
            :number="1"
            parent-form="player1"
            :other-player-names="[values.player2?.name]"
          />
          <PlayerField
            :number="2"
            parent-form="player2"
            :other-player-names="[values.player1?.name]"
          />
        </template>
      </div>

      <Field
        name="size"
        :label="t('setup.size')"
        :rules="`required|integer|min_value:2|max_value:10`"
        v-slot="{ field, errorMessage }"
      >
        <div class="flex flex-col gap-2">
          <BaseLabel :for="field.name">{{ t('setup.size') }}</BaseLabel>
          <BaseInput v-bind="field" :id="field.name" :title="field.value" type="number" />
          <BaseFieldError :errorMessage />
        </div>
      </Field>

      <BaseButton color="primary" type="submit">{{ t('setup.save') }}</BaseButton>
    </Form>

    <RulesToggle default-open class="mt-4" />
  </div>
</template>

<script setup lang="ts">
import { Form, Field, defineRule } from 'vee-validate'
import { required, integer, min_value, max_value } from '@vee-validate/rules'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PlayerField from './PlayerField.vue'
import ComputerOpponentField from './ComputerOpponentField.vue'
import RulesToggle from '../rules/RulesToggle.vue'
import {
  createComputerPlayer,
  type Difficulty,
  type GameMode,
  type GameSetupForm,
  type Player,
} from '@/models'

import BaseLabel from '@/shared/components/BaseLabel.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseFieldError from '@/shared/components/BaseFieldError.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseSegmentedControl from '@/shared/components/BaseSegmentedControl.vue'

import { computerColorFor, randomHexColor } from '@/utils'

defineRule('required', required)
defineRule('integer', integer)
defineRule('min_value', min_value)
defineRule('max_value', max_value)

const { t } = useI18n()

// Versus computer by default (CM-2). #15 reads the remembered mode and difficulty here (CM-3, CM-7)
// and adds the difficulty switch; until then the computer plays Easy.
const gameMode = ref<GameMode>('computer')
const difficulty = ref<Difficulty>('easy')
const isComputerMode = computed(() => gameMode.value === 'computer')

const modeOptions = computed<{ value: GameMode; label: string }[]>(() => [
  { value: 'computer', label: t('setup.modeComputer') },
  { value: 'twoPlayers', label: t('setup.modeTwoPlayers') },
])

interface SetupFormValues {
  player1: Player
  player2: Player
  size: number
}

const formInitialValues: SetupFormValues = {
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

// In Versus computer mode the second player is the computer player; values typed for a second
// person stay in the form (CM-10) but aren't used.
function submit(values: Record<string, unknown>) {
  const { player1, player2, size } = values as unknown as SetupFormValues
  emit(
    'gameSetup',
    isComputerMode.value
      ? {
          gameMode: 'computer',
          difficulty: difficulty.value,
          player1,
          player2: createComputerPlayer(player1.color),
          size,
        }
      : { gameMode: 'twoPlayers', difficulty: null, player1, player2, size },
  )
}
</script>

<style lang="scss" scoped></style>
