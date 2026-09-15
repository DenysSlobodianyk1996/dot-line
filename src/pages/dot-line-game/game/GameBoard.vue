<template>
  <div
    class="relative shrink-0 rounded-lg border border-gray-300 bg-white"
    :style="{ width: `${boardSize + 2}px`, height: `${boardSize + 2}px` }"
  >
    <div
      v-for="square in dotLineGame.dirtySquares"
      :key="`square-${square.row}-${square.col}`"
      class="absolute flex items-center justify-center text-base font-bold"
      :style="squareStyle(square)"
    >
      {{ square.ownerName?.charAt(0).toUpperCase() }}
    </div>

    <div
      v-for="line in dotLineGame.lines"
      :key="line.key"
      class="absolute rounded-[2px]"
      :style="lineStyle(line)"
    ></div>

    <button
      v-for="{ dot, state } in dots"
      :key="dot.key"
      type="button"
      class="absolute flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-blue-500 enabled:cursor-pointer"
      :style="dotStyle(dot)"
      :disabled="state === 'idle'"
      :aria-label="`Dot row ${dot.row + 1}, column ${dot.col + 1}`"
      :aria-pressed="state === 'selected'"
      @click="onDotClick(dot)"
    >
      <span
        class="flex items-center justify-center rounded-full"
        :class="RING_CLASS[state]"
        :style="ringStyle(state)"
      >
        <span class="rounded-full" :class="DOT_CLASS[state]" :style="dotFillStyle(state)"></span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Dot, type DotLineGame, type Line, type Square } from '@/models'
import { computed, type CSSProperties } from 'vue'

type DotState = 'idle' | 'start' | 'selected' | 'target'

const CELL = 48
const PADDING = 16
const LINE_WIDTH = 4
const DOT_HIT_AREA = 28
const FALLBACK_COLOR = '#101828'

const RING_CLASS: Record<DotState, string> = {
  idle: '',
  start: 'size-5 border-2 border-blue-500 bg-blue-500/12',
  selected: 'size-[26px] border-2',
  target: 'size-[22px] border-2 border-dashed',
}

const DOT_CLASS: Record<DotState, string> = {
  idle: 'size-2 bg-gray-400',
  start: 'size-2 bg-gray-900',
  selected: 'size-3 border-2 border-white',
  target: 'size-2 bg-gray-900',
}

const props = defineProps<{
  dotLineGame: DotLineGame
}>()

const selectedDot = defineModel<Dot | null>('selectedDot', { default: null })

const boardSize = computed(() => (props.dotLineGame.size ?? 0) * CELL + PADDING * 2)

const currentColor = computed(() => props.dotLineGame.currentPlayer?.color ?? FALLBACK_COLOR)

const dots = computed(() => {
  const game = props.dotLineGame
  const size = game.size ?? 0
  const selected = selectedDot.value
  const targets = selected ? game.validNeighbors(selected) : []
  const result: { dot: Dot; state: DotState }[] = []

  for (let row = 0; row <= size; row++) {
    for (let col = 0; col <= size; col++) {
      const dot = new Dot({ row, col })
      let state: DotState = 'idle'
      if (dot.equals(selected)) state = 'selected'
      else if (targets.some((target) => target.equals(dot))) state = 'target'
      else if (game.isValidStartDot(dot)) state = 'start'
      result.push({ dot, state })
    }
  }
  return result
})

function toPoint({ row, col }: { row: number; col: number }) {
  return { x: PADDING + col * CELL, y: PADDING + row * CELL }
}

function colorOf(playerName: string | null): string {
  return props.dotLineGame.getPlayerByName(playerName)?.color ?? FALLBACK_COLOR
}

function squareStyle(square: Square): CSSProperties {
  const { x, y } = toPoint(square)
  const color = colorOf(square.ownerName)
  return {
    left: `${x}px`,
    top: `${y}px`,
    width: `${CELL}px`,
    height: `${CELL}px`,
    color,
    backgroundColor: `color-mix(in srgb, ${color} 30%, transparent)`,
  }
}

function lineStyle(line: Line): CSSProperties {
  const { x, y } = toPoint(line.from)
  const length = CELL + LINE_WIDTH
  return {
    left: `${x - LINE_WIDTH / 2}px`,
    top: `${y - LINE_WIDTH / 2}px`,
    width: `${line.isHorizontal ? length : LINE_WIDTH}px`,
    height: `${line.isHorizontal ? LINE_WIDTH : length}px`,
    backgroundColor: colorOf(line.ownerName),
  }
}

function dotStyle(dot: Dot): CSSProperties {
  const { x, y } = toPoint(dot)
  return {
    left: `${x - DOT_HIT_AREA / 2}px`,
    top: `${y - DOT_HIT_AREA / 2}px`,
    width: `${DOT_HIT_AREA}px`,
    height: `${DOT_HIT_AREA}px`,
  }
}

function ringStyle(state: DotState): CSSProperties {
  if (state !== 'selected' && state !== 'target') return {}
  return {
    borderColor: currentColor.value,
    backgroundColor: `color-mix(in srgb, ${currentColor.value} 12%, transparent)`,
  }
}

function dotFillStyle(state: DotState): CSSProperties {
  return state === 'selected' ? { backgroundColor: currentColor.value } : {}
}

function onDotClick(dot: Dot) {
  const game = props.dotLineGame
  const selected = selectedDot.value
  if (game.isFinished) return

  if (dot.equals(selected)) {
    selectedDot.value = null
    return
  }
  if (selected && game.canDraw(selected, dot)) {
    game.drawLine(selected, dot)
    selectedDot.value = null
    return
  }
  if (game.isValidStartDot(dot)) {
    selectedDot.value = dot
  }
}
</script>
