<template>
  <div class="max-w-full self-center overflow-x-auto sm:self-start">
    <div
      class="relative shrink-0 overflow-hidden rounded-lg border border-gray-300 bg-white"
      :style="{ width: `${boardSize + BORDER * 2}px`, height: `${boardSize + BORDER * 2}px` }"
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
        class="absolute flex items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 enabled:cursor-pointer"
        :style="dotStyle(dot)"
        :disabled="state === 'idle'"
        :aria-label="t('game.dotLabel', { row: dot.row + 1, col: dot.col + 1 })"
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
  </div>
</template>

<script setup lang="ts">
import { Dot, type DotLineGame, type Line, type Square } from '@/models'
import { computed, onBeforeUnmount, onMounted, ref, type CSSProperties } from 'vue'
import { useI18n } from 'vue-i18n'

type DotState = 'idle' | 'start' | 'selected' | 'target'

const MAX_CELL = 48
const MIN_CELL = 24
const PADDING = 16
const BORDER = 1
const LINE_WIDTH = 4
const MAX_TAP_AREA = 44
// horizontal space taken by the app's p-2 gutters
const APP_GUTTERS = 16
// from Tailwind's sm breakpoint the widest side panel (GameResult, w-53) and gap-6 sit beside the board
const SIDE_PANEL_WITH_GAP = 212 + 24
const SIDE_BY_SIDE_QUERY = '(min-width: 40rem)'
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

const { t } = useI18n()

const sideBySideMedia = window.matchMedia(SIDE_BY_SIDE_QUERY)
// clientWidth excludes a desktop scrollbar, unlike window.innerWidth
const viewportWidth = ref(document.documentElement.clientWidth)
const isSideBySide = ref(sideBySideMedia.matches)

function updateViewport() {
  viewportWidth.value = document.documentElement.clientWidth
  isSideBySide.value = sideBySideMedia.matches
}

onMounted(() => window.addEventListener('resize', updateViewport))
onBeforeUnmount(() => window.removeEventListener('resize', updateViewport))

// squares keep 48 px while the board fits and shrink on narrow screens (MB-3)
const cell = computed(() => {
  const size = props.dotLineGame.size || 1
  const sidePanel = isSideBySide.value ? SIDE_PANEL_WITH_GAP : 0
  const available =
    viewportWidth.value - APP_GUTTERS - sidePanel - PADDING * 2 - BORDER * 2
  return Math.min(MAX_CELL, Math.max(MIN_CELL, Math.floor(available / size)))
})

// each dot is tappable across a whole square, capped at 44 px (MB-4)
const tapArea = computed(() => Math.min(cell.value, MAX_TAP_AREA))

const boardSize = computed(() => (props.dotLineGame.size ?? 0) * cell.value + PADDING * 2)

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
  return { x: PADDING + col * cell.value, y: PADDING + row * cell.value }
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
    width: `${cell.value}px`,
    height: `${cell.value}px`,
    color,
    backgroundColor: `color-mix(in srgb, ${color} 30%, transparent)`,
  }
}

function lineStyle(line: Line): CSSProperties {
  const { x, y } = toPoint(line.from)
  const length = cell.value + LINE_WIDTH
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
    left: `${x - tapArea.value / 2}px`,
    top: `${y - tapArea.value / 2}px`,
    width: `${tapArea.value}px`,
    height: `${tapArea.value}px`,
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
