import { readonly, ref } from 'vue'

// Whether the game screen's Stop dialog is open (VC-13). One per app, like the rules panel, so the
// Android back button can close it (AR-3) without reaching into the game screen. Closed whenever the
// app loads; the state isn't saved.
const isOpen = ref(false)

export function useStopDialog() {
  return {
    isOpen: readonly(isOpen),
    open: () => (isOpen.value = true),
    close: () => (isOpen.value = false),
  }
}
