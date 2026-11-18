/*
 * One-off generator for the favicon and install icons (VR-40..VR-43) and the Android icon and splash
 * sources (AR-5). Run with `npm run generate-icons` after changing `src/shared/logo.ts`, then
 * `npm run android:assets`, and commit the files both write (`public/`, `assets/`, `android/`).
 * It is not part of the build.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import pngToIco from 'png-to-ico'
import sharp from 'sharp'
import { faviconSvg, LOGO_COLORS, logoSvg, type LogoOptions } from '../src/shared/logo.ts'

const publicDir = fileURLToPath(new URL('../public/', import.meta.url))
// the source images @capacitor/assets turns into the Android launcher icons and splash screens
const assetsDir = fileURLToPath(new URL('../assets/', import.meta.url))

const png = (svg: string, size: number) =>
  sharp(Buffer.from(svg), { density: (72 * size) / 100 })
    .resize(size, size)
    .png()
    .toBuffer()

// logo on the cream tile, inside the 80% safe zone (VR-42)
const tiled: LogoOptions = { tile: LOGO_COLORS.tile }
// launchers and iOS cut their own shape out of a full-bleed square; at 74% even the halo stays
// inside the maskable safe-zone circle (VR-43)
const fullBleed: LogoOptions = { ...tiled, tileRadius: 0, scale: 0.74 }

const icons: Record<string, Promise<Buffer>> = {
  'pwa-192x192.png': png(logoSvg(tiled), 192),
  'pwa-512x512.png': png(logoSvg(tiled), 512),
  'maskable-icon-512x512.png': png(logoSvg(fullBleed), 512),
  'apple-touch-icon-180x180.png': png(logoSvg(fullBleed), 180),
}

await writeFile(`${publicDir}favicon.svg`, `${faviconSvg()}\n`)
// .ico fallback for browsers without SVG favicons: transparent, cocoa dots (VR-40)
const icoSizes = [16, 32, 48]
await writeFile(
  `${publicDir}favicon.ico`,
  await pngToIco(await Promise.all(icoSizes.map((size) => png(logoSvg(), size)))),
)
for (const [name, image] of Object.entries(icons)) {
  await writeFile(`${publicDir}${name}`, await image)
}
console.log(`icons written to ${publicDir}`)

// Android (AR-5). The adaptive icon is a logo foreground on a cream background layer. @capacitor/assets
// insets both layers to the 72 dp the launcher shows, then the launcher masks that (circle, square,
// squircle), so the foreground uses the full-bleed icon's 74% scale. Older launchers get the
// full-bleed cream icon. The splash is cream in both light and dark, with a small logo.
const transparent: LogoOptions = { tile: 'none', tileRadius: 0 }
const creamSquare = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${LOGO_COLORS.tile}"/></svg>`
const splash = png(logoSvg({ ...tiled, tileRadius: 0, scale: 0.22 }), 2732)
const androidSources: Record<string, Promise<Buffer>> = {
  'icon-only.png': png(logoSvg(fullBleed), 1024),
  'icon-foreground.png': png(logoSvg({ ...transparent, scale: fullBleed.scale }), 1024),
  'icon-background.png': png(creamSquare, 1024),
  'splash.png': splash,
  'splash-dark.png': splash,
}
await mkdir(assetsDir, { recursive: true })
for (const [name, image] of Object.entries(androidSources)) {
  await writeFile(`${assetsDir}${name}`, await image)
}
console.log(`Android icon and splash sources written to ${assetsDir}`)
