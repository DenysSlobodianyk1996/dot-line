/*
 * One-off generator for the favicon and install icons (VR-40..VR-43). Run with
 * `npm run generate-icons` after changing `src/shared/logo.ts`, then commit the files it writes
 * to `public/`. It is not part of the build.
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import pngToIco from 'png-to-ico'
import sharp from 'sharp'
import { faviconSvg, LOGO_COLORS, logoSvg, type LogoOptions } from '../src/shared/logo.ts'

const publicDir = fileURLToPath(new URL('../public/', import.meta.url))

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
