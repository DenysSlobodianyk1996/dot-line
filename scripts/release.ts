/*
 * `npm run release`: tags the next version and pushes the tag (AR-10, AR-11). Pushing it runs
 * .github/workflows/android-release.yml (a signed AAB to Play's internal track) and redeploys
 * GitHub Pages, so the web app and the Android app show the same new version (FT-5).
 *
 * Releases what is on origin/master: the checkout must be clean and at origin/master. The version
 * is the latest tag with the patch raised (scripts/app-version.ts); nothing is typed by hand.
 */
import { execSync } from 'node:child_process'
import { androidVersion } from './android-version.ts'
import { gitTags, nextReleaseTag } from './app-version.ts'

const git = (args: string) => execSync(`git ${args}`, { encoding: 'utf8', stdio: 'pipe' }).trim()

function fail(message: string): never {
  console.error(`release: ${message}`)
  process.exit(1)
}

git('fetch --quiet --tags origin master')
if (git('status --porcelain')) fail('commit or stash your changes first; the tree is not clean.')
if (git('rev-parse HEAD') !== git('rev-parse origin/master')) {
  fail(
    'check out the latest master first (git switch master && git pull); a release tags origin/master.',
  )
}

const tag = nextReleaseTag(gitTags())
const { name, code } = androidVersion(tag) // the same checks the release workflow makes

git(`tag --annotate ${tag} --message "Release ${name}"`)
try {
  git(`push origin ${tag}`)
} catch (error) {
  git(`tag --delete ${tag}`)
  fail(`could not push ${tag}, so the tag was removed again: ${String(error)}`)
}

console.log(`Released ${tag} (versionName ${name}, versionCode ${code}).
- Android: the "Android release" workflow builds a signed AAB and uploads it to Play's internal track.
- Web: GitHub Pages redeploys and shows version ${name}.
Follow it with: gh run list --limit 3`)
