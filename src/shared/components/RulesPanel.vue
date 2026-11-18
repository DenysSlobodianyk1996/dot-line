<template>
  <!-- slides in from the right on wide screens, covers the screen on phones (VR-24, VR-25) -->
  <Transition
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    enter-active-class="transition-opacity duration-200 motion-reduce:transition-none"
    leave-active-class="transition-opacity duration-200 motion-reduce:transition-none"
  >
    <div
      v-if="isOpen"
      data-rules-backdrop
      class="fixed inset-0 z-20 bg-ink/40"
      aria-hidden="true"
      @click="close"
    ></div>
  </Transition>
  <Transition
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
    enter-active-class="transition-transform duration-250 ease-out motion-reduce:transition-none"
    leave-active-class="transition-transform duration-200 ease-in motion-reduce:transition-none"
  >
    <aside
      v-if="isOpen"
      ref="panel"
      data-rules-panel
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
      class="fixed inset-y-0 right-0 z-30 flex w-full flex-col gap-4 overflow-y-auto bg-surface p-safe-5 shadow-2xl outline-none sm:w-96 sm:rounded-l-3xl"
      @keydown.esc="close"
      @keydown.tab="trapFocus"
    >
      <div class="flex justify-end">
        <button
          ref="closeButton"
          type="button"
          data-rules-close
          :aria-label="t('rules.close')"
          class="flex size-11 cursor-pointer items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
          @click="close"
        >
          <CloseIcon />
        </button>
      </div>
      <GameRules :title-id="titleId" />
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { nextTick, useId, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/shared/icons/CloseIcon.vue'
import { useRulesPanel } from '@/shared/composables/useRulesPanel'
import GameRules from './GameRules.vue'

// where focus goes on close when the opener is unknown or gone: the header's info button (VR-29, UP-2)
const props = defineProps<{ returnFocusTo: HTMLElement | null }>()

const { t } = useI18n()
const { isOpen, close, returnFocus } = useRulesPanel()
const titleId = useId()
const panel = useTemplateRef<HTMLElement>('panel')
const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')

// a modal dialog: focus moves in on open and back to the info button that opened it on close
// (VR-29, UP-2)
watch(isOpen, async (open) => {
  await nextTick()
  if (open) return closeButton.value?.focus()
  returnFocus(props.returnFocusTo)
})

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Tab and Shift+Tab cycle inside the panel instead of leaving it (VR-29)
function trapFocus(event: KeyboardEvent) {
  const focusable = [...(panel.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return
  const active = document.activeElement
  if (event.shiftKey && (active === first || active === panel.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>
