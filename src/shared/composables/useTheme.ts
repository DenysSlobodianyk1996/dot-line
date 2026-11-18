import { computed, readonly, ref, watchEffect } from 'vue'
import { StorageService } from '@/services'
import { THEME } from '@/static'

export type Theme = 'light' | 'dark'

// The device's light/dark setting, kept live (VR-11, VR-15)
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
const systemTheme = ref<Theme>(darkQuery.matches ? 'dark' : 'light')
darkQuery.addEventListener('change', (event) => {
  systemTheme.value = event.matches ? 'dark' : 'light'
})

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

// the player's choice from the theme button, saved across reloads; until then the device
// setting wins (VR-13, VR-14, VR-15)
const savedTheme = StorageService.getItem(THEME)
const override = ref<Theme | null>(isTheme(savedTheme) ? savedTheme : null)

const theme = computed<Theme>(() => override.value ?? systemTheme.value)

// the dark token set in styles.css is selected by data-theme on the root element
watchEffect(() => {
  document.documentElement.dataset.theme = theme.value
})

function toggle() {
  override.value = theme.value === 'dark' ? 'light' : 'dark'
  StorageService.setItem(THEME, override.value)
}

export function useTheme() {
  return { theme: readonly(theme), toggle }
}
