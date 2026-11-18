import { createApp } from 'vue'
import { Capacitor } from '@capacitor/core'
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

// back button, status bar (AR-3, AR-4): only inside the Android app, in their own chunk, so the
// web build never loads them
if (Capacitor.isNativePlatform()) {
  void import('./native').then(({ startNative }) => startNative())
}
