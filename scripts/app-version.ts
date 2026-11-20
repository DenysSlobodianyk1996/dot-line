/**
 * The app's version (PV-5, AR-11): one number per commit, the same in the web app and the Android
 * app, and one higher after every merge to master, with nothing bumped by hand.
 *
 *   versionName = MAJOR.MINOR (package.json) . merges on master since 1.0.0   e.g. 1.0.7
 *   versionCode = 10000 + those merges                                        e.g. 10007
 *
 * 1.0.0 (code 10000) is the commit that went to Google Play by hand (FIRST_RELEASE). Merges are
 * counted along master's first parents, so a merged PR adds one whatever it contains. Both counts
 * only grow, so Play always gets a higher versionCode.
 *
 * - vite.config.ts puts appVersion() in VITE_APP_VERSION for every build (APP_VERSION,
 *   src/static/app-version.ts), shown on the privacy pages under "Updated".
 * - The Android release workflow runs `node scripts/app-version.ts <tag>`: it prints
 *   ANDROID_VERSION_NAME and ANDROID_VERSION_CODE for $GITHUB_ENV and fails unless the tag is the
 *   commit's own version (`npm run release` makes that tag, scripts/release.ts).
 * - Needs the full history: CI checks out with fetch-depth: 0.
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** The commit released by hand as 1.0.0 (versionCode 10000): the merge of PR #83. */
export const FIRST_RELEASE = '39683c09fc57c4656348b6e2d95d6bc3542994e6'
/** 1.0.0's versionCode; each merge adds one. */
export const FIRST_CODE = 10000
// Play's largest allowed versionCode
const MAX_CODE = 2_100_000_000

const NAME = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

export interface AppVersion {
  name: string
  code: number
}

/** The version of a commit `merges` merges after 1.0.0, with package.json's version as the base. */
export function versionFor(packageVersion: string, merges: number): AppVersion {
  const match = NAME.exec(packageVersion)
  if (!match)
    throw new Error(`package.json's version must be MAJOR.MINOR.PATCH, got "${packageVersion}"`)
  if (!Number.isInteger(merges) || merges < 0) throw new Error(`Bad merge count: ${merges}`)
  const code = FIRST_CODE + merges
  if (code > MAX_CODE) throw new Error(`versionCode ${code} is above Play's limit of ${MAX_CODE}`)
  return { name: `${match[1]}.${match[2]}.${merges}`, code }
}

/** Merges on master's first-parent line from 1.0.0 to HEAD. Throws without git or history. */
export function mergesSinceFirstRelease(): number {
  const count = execSync(`git rev-list --count --first-parent ${FIRST_RELEASE}..HEAD`, {
    encoding: 'utf8',
    stdio: 'pipe',
  })
  return Number(count.trim())
}

// package.json in the repo root, where npm scripts, Vite and CI all run
function packageVersion(): string {
  const file = join(process.cwd(), 'package.json')
  return (JSON.parse(readFileSync(file, 'utf8')) as { version: string }).version
}

/** This checkout's version, or null without git or the history back to 1.0.0. */
export function currentVersion(): AppVersion | null {
  try {
    return versionFor(packageVersion(), mergesSinceFirstRelease())
  } catch {
    return null
  }
}

/** The version a build shows: one given in VITE_APP_VERSION, the Android build's, the commit's. */
export function appVersion({
  given,
  androidVersionName,
  current = () => currentVersion()?.name ?? null,
}: {
  /** VITE_APP_VERSION, e.g. to rebuild an older release. */
  given?: string
  /** ANDROID_VERSION_NAME, set by the Android release workflow. */
  androidVersionName?: string
  /** The checkout's own version name, or null without git history. */
  current?: () => string | null
} = {}): string {
  for (const name of [given, androidVersionName]) {
    if (name && NAME.test(name)) return name
  }
  return current() ?? '1.0.0'
}

/** Checks a release tag against the commit's version: `v` + its name. */
export function checkReleaseTag(tag: string, version: AppVersion): void {
  if (tag !== `v${version.name}`) {
    throw new Error(
      `This commit is version ${version.name}, so its release tag is v${version.name}, not "${tag}". Release with npm run release.`,
    )
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const version = currentVersion()
  if (!version) {
    console.error('No git history back to 1.0.0: check out with fetch-depth: 0.')
    process.exit(1)
  }
  const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME
  try {
    if (tag) checkReleaseTag(tag, version)
  } catch (error) {
    console.error((error as Error).message)
    process.exit(1)
  }
  console.log(`ANDROID_VERSION_NAME=${version.name}\nANDROID_VERSION_CODE=${version.code}`)
}
