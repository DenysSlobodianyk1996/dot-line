import { describe, expect, it } from 'vitest'
import { useStopDialog } from '@/shared/composables/useStopDialog'

// one Stop dialog state for the app (VC-13, AR-3): the game screen binds it with v-model, and the
// Android back button closes it
describe('useStopDialog', () => {
  it('opens and closes through its model, the way v-model:confirming sets it', () => {
    const stopDialog = useStopDialog()

    stopDialog.isOpen.value = true
    expect(useStopDialog().isOpen.value).toBe(true)

    stopDialog.isOpen.value = false
    expect(useStopDialog().isOpen.value).toBe(false)
  })

  it('closes from anywhere, as the back button does', () => {
    useStopDialog().isOpen.value = true

    useStopDialog().close()

    expect(useStopDialog().isOpen.value).toBe(false)
  })
})
