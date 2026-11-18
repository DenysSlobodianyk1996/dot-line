import { StatusBar, Style } from '@capacitor/status-bar'
import { watch } from 'vue'
import { useTheme, type Theme } from '@/shared/composables/useTheme'

// The status bar takes the page background (--wc-paper) and icons that read on it, and follows
// the theme live: the device's setting and the theme button (AR-4). The color comes from the
// tokens in styles.css, so there is no second copy of the palette.
function paperColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--wc-paper').trim()
}

async function paint(theme: Theme) {
  // Style.Dark means light icons, for a dark background
  await StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light })
  const color = paperColor()
  if (color) await StatusBar.setBackgroundColor({ color })
}

export function followThemeInStatusBar() {
  // after the render, when useTheme has already put the new data-theme on <html>
  watch(useTheme().theme, (theme) => void paint(theme), { immediate: true, flush: 'post' })
}
