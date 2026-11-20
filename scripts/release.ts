/*
 * `npm run release`: sends what is on master to Google Play (AR-10). It tags the current commit
 * with its own version (scripts/app-version.ts: 1.0.<merges since 1.0.0>) and pushes the tag,
 * which runs .github/workflows/android-release.yml: a signed AAB to Play's internal track. The
 * web app already shows that version since the merge was deployed (PV-5).
 *
 * The checkout must be clean and at origin/master. Nothing is typed by hand.
 */
import { execSync } from 'node:child_process'
import { currentVersion } from './app-version.ts'

const git = (args: string) => execSync(`git ${args}`, { encoding: 'utf8', stdio: 'pipe' }).trim()

function fail(message: string): never {
  console.error(`release: ${message}`)
  process.exit(1)
}

git('fetch --quiet --tags origin master')
if (git('status --porcelain')) fail('commit or stash your changes first; the tree is not clean.')
if (git('rev-parse HEAD') !== git('rev-parse origin/master')) {
  fail(
    'check out the latest master first (git switch master && git pull); a release is origin/master.',
  )
}

const version = currentVersion() ?? fail('no git history back to 1.0.0.')
const tag = `v${version.name}`
if (git(`tag --list ${tag}`)) {
  fail(`${tag} is already released: merge something to master first, then release again.`)
}

git(`tag --annotate ${tag} --message "Release ${version.name}"`)
try {
  git(`push origin ${tag}`)
} catch (error) {
  git(`tag --delete ${tag}`)
  fail(`could not push ${tag}, so the tag was removed again: ${String(error)}`)
}

console.log(`Released ${tag} (versionName ${version.name}, versionCode ${version.code}).
The "Android release" workflow builds a signed AAB and uploads it to Play's internal track.
Follow it with: gh run list --limit 3`)
