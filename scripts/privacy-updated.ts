/**
 * The "Updated" date on the privacy policy (AR-15). Every build prints the date of the commit it
 * builds, so each deploy from master (GitHub Pages and the Android app alike) carries the day it
 * was merged, with nothing to bump by hand. vite.config.ts puts it in VITE_PRIVACY_UPDATED, which
 * every Vite build (the app, the static privacy page, Vitest) reads through src/static/privacy.ts.
 */
import { execSync } from 'node:child_process'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function privacyUpdated({
  given,
  commitDate = () => execSync('git log -1 --format=%cs', { encoding: 'utf8', stdio: 'pipe' }),
  now = new Date(),
}: {
  /** A date set from outside (VITE_PRIVACY_UPDATED), e.g. to rebuild an older release. */
  given?: string
  /** The built commit's date, YYYY-MM-DD. */
  commitDate?: () => string
  now?: Date
} = {}): string {
  if (given && ISO_DATE.test(given)) return given
  try {
    const date = commitDate().trim()
    if (ISO_DATE.test(date)) return date
  } catch {
    // no git (a source archive): today
  }
  return now.toISOString().slice(0, 10)
}
