<template>
  <!-- centered horizontally, top-aligned (MB-9) -->
  <div class="mx-auto max-w-130">
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
      <!-- difficulty only in Versus computer mode (CM-5, CM-6) -->
      <BaseSegmentedControl
        v-if="isComputerMode"
        v-model="difficulty"
        :label="t('setup.difficulty')"
        :options="difficultyOptions"
        :hint="t(DIFFICULTY_HINT_KEYS[difficulty])"
      />

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
            :other-player-color="values.player2?.color"
          />
          <PlayerField
            :number="2"
            parent-form="player2"
            :other-player-names="[values.player1?.name]"
            :other-player-color="values.player1?.color"
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
          <BaseLabel :for="field.name" required>{{ t('setup.size') }}</BaseLabel>
          <BaseInput
            v-bind="field"
            :id="field.name"
            :title="field.value"
            type="number"
            aria-required="true"
            :aria-describedby="sizeHintId"
          />
          <!-- the hint always shows; a validation error goes below it (GS-2) -->
          <BaseHint :id="sizeHintId">{{ t('setup.sizeHint') }}</BaseHint>
          <BaseFieldError :errorMessage />
        </div>
      </Field>

      <BaseButton color="primary" type="submit">{{ t('setup.save') }}</BaseButton>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { Form, Field, defineRule } from 'vee-validate'
import { required, integer, min_value, max_value } from '@vee-validate/rules'
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import PlayerField from './PlayerField.vue'
import ComputerOpponentField from './ComputerOpponentField.vue'
import { createComputerPlayer, type Difficulty, type GameMode, type GameSetupForm } from '@/models'

import BaseLabel from '@/shared/components/BaseLabel.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseFieldError from '@/shared/components/BaseFieldError.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseSegmentedControl from '@/shared/components/BaseSegmentedControl.vue'
import BaseHint from '@/shared/components/BaseHint.vue'

import { computerColorFor, randomSwatch } from '@/utils'
import { StorageService } from '@/services'
import { DIFFICULTY, GAME_MODE } from '@/static'

defineRule('required', required)
defineRule('integer', integer)
defineRule('min_value', min_value)
defineRule('max_value', max_value)

const { t } = useI18n()
const sizeHintId = useId()

// Setup opens with the game mode and difficulty of the last game started; on a first visit,
// Versus computer and Normal (CM-2, CM-3, CM-7, CM-29)
// each value with its label's message key, listed once; the switches show them in this order
const GAME_MODE_OPTIONS: { value: GameMode; labelKey: string }[] = [
  { value: 'computer', labelKey: 'setup.modeComputer' },
  { value: 'twoPlayers', labelKey: 'setup.modeTwoPlayers' },
]
const DIFFICULTY_OPTIONS: { value: Difficulty; labelKey: string }[] = [
  { value: 'easy', labelKey: 'setup.easy' },
  { value: 'normal', labelKey: 'setup.normal' },
]
// the hint under the difficulty switch describes only the selected difficulty (VC-26)
const DIFFICULTY_HINT_KEYS: Record<Difficulty, string> = {
  easy: 'setup.easyHint',
  normal: 'setup.normalHint',
}
const GAME_MODES = GAME_MODE_OPTIONS.map(({ value }) => value)
const DIFFICULTIES = DIFFICULTY_OPTIONS.map(({ value }) => value)

function remembered<T extends string>(key: string, allowed: T[], fallback: T): T {
  const value = StorageService.getItem(key)
  return allowed.find((item) => item === value) ?? fallback
}

const gameMode = ref<GameMode>(remembered(GAME_MODE, GAME_MODES, 'computer'))
const difficulty = ref<Difficulty>(remembered(DIFFICULTY, DIFFICULTIES, 'normal'))
const isComputerMode = computed(() => gameMode.value === 'computer')

const modeOptions = computed(() =>
  GAME_MODE_OPTIONS.map(({ value, labelKey }) => ({ value, label: t(labelKey) })),
)
const difficultyOptions = computed(() =>
  DIFFICULTY_OPTIONS.map(({ value, labelKey }) => ({ value, label: t(labelKey) })),
)

// what the form fields hold; the game mode and difficulty come from the switches
type SetupFormValues = Omit<GameSetupForm, 'gameMode' | 'difficulty'>

// two different random swatches (VR-35)
const player1Color = randomSwatch()
const formInitialValues: SetupFormValues = {
  player1: { name: '', color: player1Color },
  player2: { name: '', color: randomSwatch(player1Color) },
  // 4 by default (GS-2)
  size: 4,
}

const emit = defineEmits<{
  gameSetup: [GameSetupForm]
}>()

// In Versus computer mode the second player is the computer player; values typed for a second
// person stay in the form (CM-10) but aren't used.
function submit(values: Record<string, unknown>) {
  const { player1, player2, size } = values as SetupFormValues
  // the difficulty is remembered even in Two players, for the next Versus computer game (CM-7)
  StorageService.setItem(GAME_MODE, gameMode.value)
  StorageService.setItem(DIFFICULTY, difficulty.value)
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
