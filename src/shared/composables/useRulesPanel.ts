import { readonly, ref, shallowRef } from 'vue'

// One rules panel for the whole app (VR-23): the header's info button or the setup's How to play
// link (NG-6) opens it, the panel closes it, and the game screen reads whether it is open so the computer waits
// meanwhile (VR-31). Closed whenever the app loads (VR-27); the state isn't saved.
const isOpen = ref(false)
// the button that opened the panel, so focus can go back to it (UP-2). The button passes
// itself in: Safari and touch screens don't focus a clicked button, so document.activeElement
// can't tell.
const opener = shallowRef<HTMLElement | null>(null)

export function useRulesPanel() {
  return {
    isOpen: readonly(isOpen),
    // open, and opened by this button: what that button's aria-expanded reports (VR-29)
    isOpenedBy: (button: HTMLElement | null | undefined) =>
      isOpen.value && !!button && opener.value === button,
    open: (button: EventTarget | null) => {
      opener.value = button instanceof HTMLElement ? button : null
      isOpen.value = true
    },
    close: () => (isOpen.value = false),
    // after closing: focus the button that opened the panel, or `fallback` when that one is unknown
    // or gone (VR-29, UP-2), then forget it
    returnFocus: (fallback: HTMLElement | null) => {
      const target = opener.value?.isConnected ? opener.value : fallback
      opener.value = null
      target?.focus()
    },
  }
}
