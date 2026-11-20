/**
 * The app's version (FT-5, AR-11): one number for the web app and the Android app, taken from the
 * release tags (`v1.2.3`), so nothing is bumped by hand.
 *
 * - `npm run release` (scripts/release.ts) tags the next version with nextReleaseTag().
 * - Every Vite build shows appVersion(): vite.config.ts puts it in VITE_APP_VERSION, read as
 *   APP_VERSION (src/static/app-version.ts). The Android release builds the tag it was pushed for
 *   (ANDROID_VERSION_NAME, scripts/android-version.ts); GitHub Pages builds the latest tag, and
 *   deploys again when a tag is pushed, so both show the same version.
 */
import { execSync } from 'node:child_process'

const TAG = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const NAME = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

/** 1.0.0 went to Play by hand without a tag (docs/store/publishing-checklist.md, step 4). */
export const FIRST_VERSION = '1.0.0'

type Version = [major: number, minor: number, patch: number]

function parse(tag: string): Version | null {
  const match = TAG.exec(tag.trim())
  return match ? (match.slice(1).map(Number) as Version) : null
}

function compare(a: Version, b: Version): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
}

/** The highest release tag as a version name ('1.2.3'), or null when there is none. */
export function latestVersion(tags: readonly string[]): string | null {
  const versions = tags.map(parse).filter((v): v is Version => v !== null)
  if (versions.length === 0) return null
  return versions.sort(compare).at(-1)!.join('.')
}

/**
 * The tag `npm run release` creates: the latest one with the patch raised. Minor and patch stay
 * 0..99 so Android version codes stay unique (scripts/android-version.ts), so 1.0.99 is followed by
 * 1.1.0. With no tag yet it follows FIRST_VERSION.
 */
export function nextReleaseTag(tags: readonly string[]): string {
  const [major, minor, patch] = parse(`v${latestVersion(tags) ?? FIRST_VERSION}`)!
  if (patch < 99) return `v${major}.${minor}.${patch + 1}`
  if (minor < 99) return `v${major}.${minor + 1}.0`
  return `v${major + 1}.0.0`
}

/** Every `v*.*.*` tag in this checkout. CI checks out with all tags (fetch-depth: 0). */
export function gitTags(): string[] {
  return execSync('git tag --list "v*.*.*"', { encoding: 'utf8', stdio: 'pipe' })
    .split('\n')
    .filter(Boolean)
}

/** The version a build shows: one given in VITE_APP_VERSION, the Android tag, the latest tag. */
export function appVersion({
  given,
  androidVersionName,
  tags = () => {
    try {
      return gitTags()
    } catch {
      return [] // no git (a source archive)
    }
  },
}: {
  /** VITE_APP_VERSION, e.g. to rebuild an older release. */
  given?: string
  /** ANDROID_VERSION_NAME: the Android release workflow's tag without `v`. */
  androidVersionName?: string
  tags?: () => readonly string[]
} = {}): string {
  for (const name of [given, androidVersionName]) {
    if (name && NAME.test(name)) return name
  }
  return latestVersion(tags()) ?? FIRST_VERSION
}
