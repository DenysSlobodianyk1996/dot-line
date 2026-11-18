import { ref } from 'vue'

// Whether the game screen's Stop dialog is open (VC-13). One per app, like the rules panel, so the
// Android back button can close it (AR-3) without reaching into the game screen. The game screen
// binds isOpen with v-model. Closed whenever the app loads; the state isn't saved.
const isOpen = ref(false)

export function useStopDialog() {
  return {
    isOpen,
    close: () => (isOpen.value = false),
  }
}
