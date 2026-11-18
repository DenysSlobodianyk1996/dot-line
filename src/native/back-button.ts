import { App } from '@capacitor/app'
import { useRulesPanel } from '@/shared/composables/useRulesPanel'
import { useStopDialog } from '@/shared/composables/useStopDialog'

// The Android back button closes what is open on top first and leaves the app only when nothing is
// (AR-3): the rules panel, then the Stop dialog, then exit
export async function listenToBackButton() {
  const rulesPanel = useRulesPanel()
  const stopDialog = useStopDialog()
  await App.addListener('backButton', () => {
    if (rulesPanel.isOpen.value) return rulesPanel.close()
    if (stopDialog.isOpen.value) return stopDialog.close()
    void App.exitApp()
  })
}
