<template>
  <!-- the rules steps already say all of this, so screen readers skip the pictures (RL-7) -->
  <section data-rules-storyboard class="flex flex-col gap-2 pt-2" aria-hidden="true">
    <h3 class="text-sm font-semibold text-ink-soft">{{ t('rules.storyboard.title') }}</h3>
    <ol class="grid grid-cols-2 gap-3">
      <li
        v-for="(frame, index) in FRAMES"
        :key="index"
        data-storyboard-frame
        class="flex min-w-0 flex-col items-center gap-1"
      >
        <!-- drawn like the game board, in theme tokens so it follows light and dark live (TH, GS-4) -->
        <svg :viewBox="`0 0 ${BOX} ${BOX}`" class="block h-auto w-full" focusable="false">
          <rect
            x="0.5"
            y="0.5"
            :width="BOX - 1"
            :height="BOX - 1"
            rx="8"
            fill="var(--color-surface)"
            stroke="var(--color-border)"
          />
          <g
            v-for="square in frame.squares"
            :key="`s${square.row},${square.col}`"
            :data-square="`${square.row},${square.col}`"
            :fill="colorOf(square.ownerName)"
          >
            <rect
              :x="PAD + square.col * CELL"
              :y="PAD + square.row * CELL"
              :width="CELL"
              :height="CELL"
              fill-opacity="0.3"
            />
            <text
              :x="PAD + square.col * CELL + CELL / 2"
              :y="PAD + square.row * CELL + CELL / 2"
              text-anchor="middle"
              dominant-baseline="central"
              font-size="16"
              font-weight="700"
            >
              {{ letterOf(square.ownerName) }}
            </text>
          </g>
          <line
            v-for="line in frame.lines"
            :key="line.key"
            :data-line="line.key"
            :x1="at(line.from.col)"
            :y1="at(line.from.row)"
            :x2="at(line.to.col)"
            :y2="at(line.to.row)"
            :stroke="colorOf(line.ownerName)"
            stroke-width="4"
            stroke-linecap="round"
          />
          <template v-for="dot in DOTS" :key="dot.key">
            <template v-if="dot.equals(frame.dot1)">
              <circle
                :data-dot1="dot.key"
                :cx="at(dot.col)"
                :cy="at(dot.row)"
                r="12"
                :stroke="STORY_COLORS[frame.current]"
                :fill="STORY_COLORS[frame.current]"
                fill-opacity="0.12"
                stroke-width="2"
              />
              <circle
                :cx="at(dot.col)"
                :cy="at(dot.row)"
                r="5"
                :fill="STORY_COLORS[frame.current]"
                stroke="var(--color-surface)"
                stroke-width="2"
              />
            </template>
            <template v-else-if="frame.neighbors.some((neighbor) => neighbor.equals(dot))">
              <circle
                :data-neighbor="dot.key"
                :cx="at(dot.col)"
                :cy="at(dot.row)"
                r="10"
                :stroke="STORY_COLORS[frame.current]"
                :fill="STORY_COLORS[frame.current]"
                fill-opacity="0.12"
                stroke-width="2"
                stroke-dasharray="3 3"
              />
              <circle :cx="at(dot.col)" :cy="at(dot.row)" r="4" fill="var(--color-ink)" />
            </template>
            <circle v-else :cx="at(dot.col)" :cy="at(dot.row)" r="4" fill="var(--color-dot)" />
          </template>
        </svg>
        <span data-caption class="text-center text-xs text-ink-soft">
          {{ t(`rules.storyboard.frame${index + 1}`) }}
        </span>
      </li>
    </ol>
  </section>
</template>

<script lang="ts">
import { Dot } from '@/models'
import { STORY_COLORS, STORY_SIZE, storyFrames, type StoryPlayer } from '@/shared/rules-storyboard'
import { BOARD_MAX_CELL, BOARD_PADDING } from '@/static'

// the game board's proportions (its largest squares and padding), scaled to the frame's width
const CELL = BOARD_MAX_CELL
const PAD = BOARD_PADDING
const BOX = STORY_SIZE * CELL + PAD * 2

// the scripted game never changes, so it is played once, not each time the panel opens
const FRAMES = storyFrames()
const DOTS = Array.from(
  { length: (STORY_SIZE + 1) ** 2 },
  (_, index) =>
    new Dot({ row: Math.floor(index / (STORY_SIZE + 1)), col: index % (STORY_SIZE + 1) }),
)

const at = (index: number) => PAD + index * CELL
const colorOf = (owner: string | null) => STORY_COLORS[owner as StoryPlayer]
</script>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// the owner's initial from the color's name in the current language: C/T, К/Б
const letterOf = (owner: string | null) => t(`colors.${owner}`).charAt(0).toUpperCase()
</script>
