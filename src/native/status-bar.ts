import { StatusBar, Style } from '@capacitor/status-bar'
import { watch } from 'vue'
import { useTheme, type Theme } from '@/shared/composables/useTheme'

// The status bar takes the page background (--wc-paper) and icons that read on it, and follows
// the theme live: the device's setting and the theme button (AR-4). The color comes from the
// tokens in styles.css, so there is no second copy of the palette. From Android 15 the app is
// edge-to-edge and the background call does nothing: the page itself runs under the status bar
// (viewport-fit=cover, safe-area padding in styles.css), so its --wc-paper shows there instead.
function paperColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--wc-paper').trim()
}

// a failed plugin call is reported and skipped, so the other one still runs and the status bar
// keeps following the theme
function report(call: string) {
  return (error: unknown) => console.warn(`StatusBar.${call} failed`, error)
}

function paint(theme: Theme) {
  // Style.Dark means light icons, for a dark background
  StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light }).catch(
    report('setStyle'),
  )
  const color = paperColor()
  if (color) StatusBar.setBackgroundColor({ color }).catch(report('setBackgroundColor'))
}

export function followThemeInStatusBar() {
  // after the render, when useTheme has already put the new data-theme on <html>
  watch(useTheme().theme, paint, { immediate: true, flush: 'post' })
}
