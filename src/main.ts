import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import './assets/styles.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')

// back button, status bar (AR-3, AR-4): only in the Android app's build, and only on the device.
// The build folds the mode check to a constant, so the web build drops this branch with Capacitor
// and the native chunk. A failure is reported and leaves the game playable.
if (__CAPACITOR_BUILD__) {
  import('@capacitor/core')
    .then(async ({ Capacitor }) => {
      if (!Capacitor.isNativePlatform()) return
      const { startNative } = await import('./native')
      await startNative()
    })
    .catch((error: unknown) => console.warn('Native setup failed', error))
}
