import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import config from '../../capacitor.config'

const res = join(process.cwd(), 'android/app/src/main/res/')
const read = (path: string) => readFileSync(`${res}${path}`, 'utf8')

// AR-5: on Android 11 and older the launch splash is a drawable shown full screen. A full-screen
// bitmap (the splash.png files @capacitor/assets writes) is stretched to the screen's shape, which
// turned the logo's round dots into ovals on a 20:9 phone.
describe('Android launch splash', () => {
  it('draws the logo unscaled in the middle of a cream window, on any screen shape', () => {
    const xml = read('drawable/launch_splash.xml')
    expect(xml).toContain('<layer-list')
    expect(xml).toContain('android:drawable="@color/splash_background"')
    expect(xml).toMatch(
      /<bitmap[^>]*android:gravity="center"[^>]*android:src="@drawable\/splash_icon"/,
    )
  })

  it('has the logo for every density', () => {
    for (const bucket of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
      expect(existsSync(`${res}drawable-${bucket}/splash_icon.png`), bucket).toBe(true)
    }
  })

  it('is what the launch theme and the splash screen plugin show, not the stretched splash.png', () => {
    expect(read('values/styles.xml')).toMatch(/name="android:background">@drawable\/launch_splash</)
    expect(config.plugins?.SplashScreen?.androidSplashResourceName).toBe('launch_splash')
  })
})
