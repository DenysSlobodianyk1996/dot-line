/**
 * The privacy policy's "Updated" date, YYYY-MM-DD (AR-15): the date of the commit a build is made
 * from, which vite.config.ts puts in VITE_PRIVACY_UPDATED (scripts/privacy-updated.ts) for every
 * build, the dev server and Vitest. So each deploy carries its own date with nothing to bump.
 */
export const PRIVACY_UPDATED: string = import.meta.env.VITE_PRIVACY_UPDATED ?? '2026-11-19'

/** Where to ask questions in public, next to the email (AR-15). */
export const GITHUB_ISSUES_URL = 'https://github.com/DenysSlobodianyk1996/dots-and-boxes/issues'
