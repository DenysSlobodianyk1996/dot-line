# Publishing checklist: Google Play

Everything from "no app in Play Console" to "a release is a tag push", in order ([AR-18](../android-release/spec.md#store-package-ar-13ar-19)). Tick the boxes as you go. Package name: **`app.dotsandboxes`**. Account type: personal, so Play requires the closed test in step 5.

What you'll need, all in this folder or linked from it:

| Item | Where |
|---|---|
| Signing and Play service account wizard | [`scripts/android-release-wizard.sh`](../../scripts/android-release-wizard.sh) |
| Listing texts | [en.md](en.md), [uk.md](uk.md) |
| Form answers | [play-console.md](play-console.md) |
| Privacy policy URL | https://denysslobodianyk1996.github.io/dots-and-boxes/privacy/ (source: [`src/static/privacy.html`](../../src/static/privacy.html)) |
| App icon 512×512 | [icon-512.png](icon-512.png) |
| Feature graphic 1024×500 | [feature-graphic-en.png](feature-graphic-en.png), [feature-graphic-uk.png](feature-graphic-uk.png) |
| Screenshots (phone, 7" and 10" tablet; en and uk) | [screenshots/](screenshots/) (regenerate with `npm run store:screenshots`) |
| Tester invitation | [tester-invite.md](tester-invite.md) |

## 0. One-time setup: signing

- [ ] Run [`bash scripts/android-release-wizard.sh`](../../scripts/android-release-wizard.sh) and finish at least the keystore steps: it creates the upload keystore outside the repo (default `~/.android-keys/dots-and-boxes-upload.jks`) and saves `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` and `ANDROID_KEY_PASSWORD` as GitHub secrets. It never prints secrets and is safe to re-run: it reuses the keystore and asks before replacing a secret that already exists. Check with `gh secret list`.
- [ ] **Back up the keystore** right away; the wizard asks you to confirm it:
  - attach the `.jks` file to a password-manager entry and save its password and alias (`upload` by default) in the same entry;
  - optionally keep a second copy on an encrypted drive or in an encrypted cloud folder;
  - never commit it or send it by email or chat (`.gitignore` covers `*.jks`, `*.keystore` and `.env.android`).

  With Play App Signing on, Google holds the app signing key, so a lost upload key can be replaced, but only through a support request (Play Console → App integrity → "Request upload key reset") that takes days. The base64 copy in the GitHub secret can't be read back.
- [ ] The service account steps (`PLAY_SERVICE_ACCOUNT_JSON`) can be done now or after step 1: the Play Console part needs your developer account, and the account-level permission covers the app once it exists. Make sure the account gets release rights for `app.dotsandboxes` before step 8. Re-run the wizard to do them later.
- [ ] Optional, for local signed builds: let the wizard write the gitignored `.env.android` (`ANDROID_KEYSTORE_FILE` is the keystore path, plus the password and alias), then run `set -a; . ./.env.android; set +a; npm run android:build`.

## 1. Create the app

- [ ] Play Console → **Create app**.
- [ ] App name **Dots and Boxes**, default language **English (United States) – en-US**, **Game**, **Free**.
- [ ] Accept the Developer Program Policies and US export laws declarations.

## 2. Fill the listing

- [ ] **Store settings**: category **Board**, tags, contact email (the placeholder in [play-console.md](play-console.md#app-details-store-settings); fill in your address).
- [ ] **Main store listing** (en-US): title, short and full description from [en.md](en.md); icon; feature graphic `feature-graphic-en.png`; screenshots from `screenshots/en/` for phone, 7" tablet and 10" tablet.
- [ ] **Manage translations → Add your own translation text → Ukrainian**: texts from [uk.md](uk.md), feature graphic `feature-graphic-uk.png`, screenshots from `screenshots/uk/`.

## 3. Fill the forms

Answers: [play-console.md](play-console.md). **Policy and programs → App content**:

- [ ] Privacy policy: https://denysslobodianyk1996.github.io/dots-and-boxes/privacy/ (open it first and check it loads).
- [ ] App access: no restrictions.
- [ ] Ads: no ads.
- [ ] Content rating: IARC questionnaire, all "No", then submit.
- [ ] **Target audience: decide the age groups** ([your decision](play-console.md#target-audience-owner-decides)). Any under-13 group brings the Families policy review.
- [ ] Data safety: no data collected or shared.
- [ ] Government apps: no. News apps: no. Financial features: none. Health: none. Advertising ID: not used.

## 4. First AAB, uploaded by hand to internal testing

The Play API can't create an app's first release, so this one upload is manual.

- [ ] Build a signed AAB. Either push the first tag (`git tag v1.0.0 && git push origin v1.0.0`) and download the AAB from the **Android release** workflow run's artifacts (`app-release-1.0.0`; it is attached before the Play upload, and that upload step is expected to fail this once), or build it locally with `npm run android:build` and the keystore from step 0.
- [ ] **Test and release → Testing → Internal testing → Create new release**.
- [ ] Keep **Play App Signing** on (Google manages the app signing key; yours is the upload key).
- [ ] Upload the AAB; paste the release notes from [en.md](en.md#release-notes-245--500) and [uk.md](uk.md#release-notes-269--500).
- [ ] Add yourself (and anyone helping) to the internal testers list, roll out, install from the opt-in link and play one game on a real device.

## 5. Closed test: at least 12 testers for 14 continuous days

- [ ] **Testing → Closed testing → Create track** (or use the default "Alpha"), countries: all (or at least Ukraine and wherever your testers are).
- [ ] Promote the internal release to the closed track, or upload the same AAB again; send it for review.
- [ ] Add testers by email list or Google Group, and copy the track's opt-in link.
- [ ] Send the [tester invitation](tester-invite.md) (en or uk) to **more than 12 people** (aim for 15–20; some drop out).
- [ ] Check **Closed testing → Testers** until at least **12 have opted in**, then mark the date: the **14 days** count from when 12 testers are opted in and must be **continuous**. Keep it there: Google counts testers who stay opted in for the whole 14 days, so a drop below 12 can cost you days.
- [ ] During the test, ship at least one update (push a new tag, then promote it from internal to closed) and answer tester feedback; Google asks about both in step 6.

## 6. Apply for production access

- [ ] After 14 days with ≥12 testers: **Dashboard → Apply for production**.
- [ ] Answer the questions about the closed test (how you recruited testers, what feedback you got and what you changed, why the app is ready). Keep notes during step 5 so this is quick.
- [ ] Wait for Google's review (usually up to 7 days). If refused, follow the reasons, extend the test and apply again.

## 7. Promote the release to production

- [ ] **Production → Create new release → Add from library** (the tested AAB), or promote it from closed testing.
- [ ] Countries: all, or the list you want.
- [ ] Release notes from [en.md](en.md) and [uk.md](uk.md); start a full (100%) or staged rollout; send for review.
- [ ] Once live, open the listing on a phone in both languages and check the texts, screenshots, rating, "No data collected" label and privacy link.

## 8. Every later release is a tag push

- [ ] Bump nothing by hand: `versionName` is the tag without `v`, and `versionCode` = `major*10000 + minor*100 + patch` (spec AR-11). Minor and patch stay at 0..99, and each tag must be higher than the last one Play has seen; a malformed tag (`v1.2`, `v1.2.3-beta`) stops the workflow before it builds.
- [ ] `git tag vX.Y.Z && git push origin vX.Y.Z` runs the **Android release** workflow (`.github/workflows/android-release.yml`): tests, a signed AAB attached to the run as `app-release-X.Y.Z`, and an upload to the **internal** track (AR-10). If the upload fails (for example the service account lacks release rights), fix it and re-run the job, or upload the attached AAB by hand.
- [ ] Check it on a device from the internal track, then promote it to closed testing or production by hand in Play Console, with release notes in both languages.
