import { readonly, ref, shallowRef } from 'vue'

// One rules panel for the whole app (VR-23): an info button (the header's or the setup's, UP-1)
// opens it, the panel closes it, and the game screen reads whether it is open so the computer waits
// meanwhile (VR-31). Closed whenever the app loads (VR-27); the state isn't saved.
const isOpen = ref(false)
// what had focus when the panel opened: the info button that opened it, so focus can go back (UP-2)
const opener = shallowRef<HTMLElement | null>(null)

export function useRulesPanel() {
  return {
    isOpen: readonly(isOpen),
    opener: readonly(opener),
    open: () => {
      const active = document.activeElement
      opener.value = active instanceof HTMLElement && active !== document.body ? active : null
      isOpen.value = true
    },
    close: () => (isOpen.value = false),
  }
}
