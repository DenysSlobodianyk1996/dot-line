# Android release on Google Play: spec

Terms follow [GLOSSARY.md](../../GLOSSARY.md). User stories carry IDs **AR-n** for commits. Builds on the PWA rules (PWA-1..PWA-6, I18N) in [requirements](../dot-line-game/requirements.md). This spec changes the shipped decision "Packaging as a native app (Capacitor, TWA) … out of scope" in the [visual refresh spec](../visual-refresh/spec.md).

**Status**: agreed in a grilling session on 2026-11-18, not started. **Blocked by** the [UI polish and rename spec](../ui-polish/spec.md), because the store listing and screenshots need the final name and result card. Issue: see the parent issue "Android release on Google Play".

## Problem Statement

The game is an installable PWA, but children and parents look for games in Google Play, not in a browser. Publishing there needs four things:
- a native Android wrapper;
- a signed App Bundle;
- store texts in English and Ukrainian, plus the Play Console form answers;
- screenshots for phone and both tablet sizes.

The developer account is a personal one, so Play requires a closed test with at least 12 testers for 14 days before production. Today none of this exists, and each manual step is easy to get wrong or forget.

## Solution

- **Wrapper**: Capacitor wraps the existing Vite build as the Android app **`app.dotsandboxes.connected`**, titled **Dots and Boxes: Connected**. The `android/` project is committed.
- **Native touches**:
  - the hardware back button closes the rules panel or a dialog before it leaves the app;
  - the status bar follows the theme;
  - a cream splash screen and an adaptive icon come from the existing logo.
- **Language**: on first launch the app follows the device language (Ukrainian on Ukrainian devices, English otherwise), on the web too.
- **Signing**: a wizard script walks the developer through the steps only a person can do: create the upload keystore, create a Play service account, and store both in GitHub secrets.
- **CI**: pushing a version tag (`v1.2.3`) builds a signed AAB and uploads it to Play's internal testing track. Promotion to closed testing and production stays manual.
- **Store package**: `docs/store/` holds everything the developer pastes into Play Console, in both languages:
  - listing texts;
  - release notes;
  - content rating, Data safety, ads, app access and target audience answers;
  - tester invitation;
  - privacy policy (hosted on GitHub Pages);
  - feature graphic;
  - screenshots made by a script for phone, 7" and 10" tablets.

## User Stories

### App

1. **AR-1**: As an Android user, I want to install "Dots and Boxes: Connected" from Google Play, so that I get it where I get every other game.
2. **AR-2**: As a player, I want the Android app to work fully offline from the first launch, so that I can play on a plane.
3. **AR-3**: As a player, I want the back button to close the rules panel or the Stop dialog first, and only then leave the app, so that I don't exit by accident.
4. **AR-4**: As a player, I want the status bar to match the light or dark theme, so that the app looks native.
5. **AR-5**: As a player, I want a cream splash screen with the logo and an adaptive launcher icon, so that the app looks finished on my home screen.
6. **AR-6**: As a new player, I want the game in my device's language on first launch (Ukrainian on a Ukrainian device, English otherwise), so that I don't have to find the language toggle first.
7. **AR-7**: As a returning player, I want my language choice to win over the device language once I've used the toggle, so that my choice sticks.
8. **AR-8**: As a player, I want the app to work in portrait and landscape on phones and tablets, so that I can hold the device any way.

### Release pipeline

9. **AR-9**: As the developer, I want a wizard that walks me through creating the upload keystore and the Play service account and saves them as GitHub secrets, so that I do the one-time setup correctly once.
10. **AR-10**: As the developer, I want a version tag to build a signed AAB and upload it to the internal testing track, so that releasing is one `git tag` + `git push`.
11. **AR-11**: As the developer, I want `versionName` and `versionCode` derived from the tag, so that I never edit Gradle files to release.
12. **AR-12**: As the developer, I want `npm run android:build` and `npm run android:open` locally, so that I can build and debug without CI.

### Store

13. **AR-13**: As the developer, I want the store listing (title, short description, full description, release notes) ready in English and Ukrainian, so that I can paste it into Play Console.
14. **AR-14**: As the developer, I want ready answers for content rating, Data safety, ads, app access and target audience, so that the Play Console forms take minutes.
15. **AR-15**: As a parent, I want a privacy policy that says plainly the app collects no data, so that I can trust it.
16. **AR-16**: As the developer, I want store screenshots for phone, 7" tablet and 10" tablet in both languages, generated by a script, so that I can regenerate them after UI changes.
17. **AR-17**: As the developer, I want a 1024×500 feature graphic and a 512×512 icon, so that the listing is complete.
18. **AR-18**: As the developer, I want a publishing checklist covering the first manual upload, the 12-tester and 14-day closed test, and the production access application, so that I don't miss a Play requirement.
19. **AR-19**: As the developer, I want a tester invitation text in both languages, so that I can recruit closed-test testers quickly.

## Implementation Decisions

### Capacitor (AR-1..AR-5, AR-8, AR-12)

- Use the current stable Capacitor with `@capacitor/android`, `@capacitor/app`, `@capacitor/status-bar` and `@capacitor/splash-screen`.
- `capacitor.config.ts`: `appId: 'app.dotsandboxes.connected'`, `appName: 'Dots and Boxes: Connected'`, `webDir: 'dist'`.
- The `android/` folder is committed, minus build output and secrets.
- **Native build mode**: `vite build --mode capacitor` with `BASE_PATH=/` and the PWA plugin disabled (no service worker, no manifests). Capacitor bundles the files, which covers offline play (AR-2). `npm run android:build` runs the web build, then `cap sync android`, then `gradlew bundleRelease`.
- **Back button**: one `App.addListener('backButton')` in a small native-only module (`src/native/`), loaded only when `Capacitor.isNativePlatform()`. Order of handling:
  1. close the rules panel (`useRulesPanel().close()`);
  2. otherwise close the Stop dialog;
  3. otherwise `App.exitApp()`.
- **Status bar**: `useTheme` calls a native hook that sets the status bar style and background to `--wc-paper` whenever the theme changes.
- **Icons and splash**: `@capacitor/assets` generates them from the logo source (`src/shared/logo.ts`, through `scripts/generate-icons.ts` output). That gives an adaptive icon (logo foreground on a cream background) and a splash screen on cream in both themes.
- **SDK**: targetSdk is whatever API level Play requires at release time; minSdk is Capacitor's default. Orientation is unspecified (any).
- Web deploys (GitHub Pages) don't change.

### Device language (AR-6, AR-7)

- When there is no saved `LOCALE`, `src/i18n` picks `uk` if `navigator.language` starts with `uk`, otherwise `en`. This changes the shipped I18N default (Ukrainian) on the web too. Update the I18N rule in `requirements.md`.
- A saved `LOCALE` always wins.

### Signing and CI (AR-9..AR-11)

- **Wizard**: `scripts/android-release-wizard.sh`, generated with `/wizard`. Steps:
  1. create the upload keystore with `keytool`;
  2. base64-encode it;
  3. open the Play Console and Google Cloud pages to create the service account and grant it release rights;
  4. capture the JSON key;
  5. write the GitHub secrets with `gh secret set`.
- **Secrets**: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `PLAY_SERVICE_ACCOUNT_JSON`.
- Play App Signing stays on, and the keystore is never committed (`.gitignore`).
- **Workflow**: `.github/workflows/android-release.yml` runs on tags `v*.*.*`. Steps:
  1. `npm ci`, then tests;
  2. web build in capacitor mode, then `cap sync`;
  3. JDK setup;
  4. decode the keystore;
  5. `gradlew bundleRelease`;
  6. upload to the `internal` track with a maintained Play upload action;
  7. attach the AAB as a workflow artifact.
- **Versions**: `versionName` = the tag without `v`; `versionCode` = `major*10000 + minor*100 + patch`. Gradle reads both from env vars, with local defaults.
- The first AAB must be uploaded by hand in Play Console (the API can't create the app). The checklist covers it.

### Store package (AR-13..AR-19)

- **Location**: `docs/store/`. Files:
  - `en.md` and `uk.md`: listing texts;
  - `play-console.md`: form answers;
  - `publishing-checklist.md`;
  - `tester-invite.md`;
  - `screenshots/<lang>/<device>/NN-<screen>.png`;
  - `feature-graphic-<lang>.png`;
  - `icon-512.png`.
- **Listing**:
  - title "Dots and Boxes: Connected" / «Крапки й квадрати: ланцюжок» (≤30 characters);
  - short description ≤80 characters;
  - full description ≤4000 characters, covering the classic game, the connected-line rule, vs computer (Easy/Normal) and two players, offline, no ads, no data;
  - category **Board**;
  - first-release notes.
- **Form answers**:
  - Content rating (IARC questionnaire): no violence, no user interaction, no purchases.
  - Data safety: no data collected or shared. Local storage on the device isn't collection.
  - Ads: none.
  - App access: none required.
  - **Target audience**: the game is meant for children. Ticking an under-13 age group puts the app under Google Play's Families policy. The app qualifies (no ads, no data, no external links). The developer confirms the age groups when filling the form; `play-console.md` lists the Families requirements and how the app meets each.
- **Privacy policy**: `public/privacy/index.html` (en and uk on one page, linked from the store listing), served at `<pages>/dots-and-boxes-connected/privacy/`. It matches the precache patterns and isn't linked from the game UI.
- **Screenshots**: `scripts/store-screenshots.ts` (Playwright as a dev dependency, run with `npm run store:screenshots`).
  - Seeds localStorage with fixture games, then captures 5 screens: setup vs computer, a mid-game vs computer, the hero result card, the rules panel, and dark-theme play.
  - Captures them for phone (1080×1920 CSS×DPR), 7" tablet (1200×1920) and 10" tablet (1600×2560), in en and uk. That's 30 PNGs, within Play's limit of 8 per device type.
  - **Feature graphic**: rendered by the same script from an HTML template with the logo and the title on cream (1024×500, en and uk).
- **Publishing checklist**:
  1. create the app in Play Console;
  2. fill the listing;
  3. fill the forms;
  4. first manual AAB upload to internal testing;
  5. a closed test track with ≥12 opted-in testers for 14 continuous days;
  6. apply for production access;
  7. promote the release.

## Testing Decisions

- **Unit tests** (Vitest):
  - device-language default: `uk-UA` → uk, `en-US` and `de` → en, a saved `LOCALE` wins;
  - back-button order, with the Capacitor `App` plugin faked at the module boundary: rules panel open → closes it; Stop dialog open → closes it; neither → exit;
  - the version-code formula.
- **Build checks**:
  - `npm run android:build` produces an AAB locally;
  - the capacitor-mode `dist/` has no `sw.js` or manifest;
  - the Pages build still has them.
- **Device QA** on one phone and one tablet (or emulators): install from internal testing, check offline, the back button, the status bar in both themes, the splash, the icon, rotation, and the language on first launch.
- The screenshot script is checked by running it and reviewing the images, not by tests.

## Out of Scope

- iOS / App Store.
- In-app purchases, ads, analytics and crash reporting (Data safety stays "no data").
- A PR-time Android debug build in CI (only tag-triggered release builds for now).
- Automated promotion beyond the internal track.
- Store localisations other than en and uk.

## Further Notes

- Work on `feat/android-release` from `master` after the UI polish parent has merged.
- After release, fold AR-n into `requirements.md` (new APP/PWA/I18N rules or a new `AND` section) and mark this spec as shipped in `docs/README.md`.
