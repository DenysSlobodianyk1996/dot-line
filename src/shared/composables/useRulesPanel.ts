import { readonly, ref } from 'vue'

// One rules panel for the whole app (VR-23): the header's info button opens it, the panel closes
// it, and the game screen reads whether it is open so the computer waits meanwhile (VR-31).
// Closed whenever the app loads (VR-27); the state isn't saved.
const isOpen = ref(false)

export function useRulesPanel() {
  return {
    isOpen: readonly(isOpen),
    open: () => (isOpen.value = true),
    close: () => (isOpen.value = false),
  }
}
