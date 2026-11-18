/*
 * Android version from a release tag (AR-11): versionName is the tag without `v`, and
 * versionCode = major*10000 + minor*100 + patch. android/app/build.gradle reads both from env vars.
 *
 *   node scripts/android-version.ts v1.2.3
 *   ANDROID_VERSION_NAME=1.2.3
 *   ANDROID_VERSION_CODE=10203
 *
 * The release workflow appends this output to $GITHUB_ENV. Without an argument the tag comes from
 * GITHUB_REF_NAME. A malformed tag exits with an error, so the release stops before building.
 */
import { pathToFileURL } from 'node:url'

export interface AndroidVersion {
  name: string
  code: number
}

const TAG = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
// Play's largest allowed versionCode
const MAX_CODE = 2_100_000_000

export function androidVersion(tag: string): AndroidVersion {
  const match = TAG.exec(tag)
  if (!match) {
    throw new Error(`Release tag must look like vMAJOR.MINOR.PATCH (e.g. v1.2.3), got "${tag}"`)
  }
  const [major, minor, patch] = match.slice(1).map(Number) as [number, number, number]
  if (minor > 99 || patch > 99) {
    throw new Error(`Minor and patch must be 0..99 so version codes stay unique, got "${tag}"`)
  }
  const code = major * 10000 + minor * 100 + patch
  if (code < 1) {
    throw new Error(`Play needs a versionCode of at least 1, got "${tag}"`)
  }
  if (code > MAX_CODE) {
    throw new Error(`versionCode ${code} is above Play's limit of ${MAX_CODE}`)
  }
  return { name: `${major}.${minor}.${patch}`, code }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { name, code } = androidVersion(process.argv[2] ?? process.env.GITHUB_REF_NAME ?? '')
    console.log(`ANDROID_VERSION_NAME=${name}\nANDROID_VERSION_CODE=${code}`)
  } catch (error) {
    console.error((error as Error).message)
    process.exit(1)
  }
}
