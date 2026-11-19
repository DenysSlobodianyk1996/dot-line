# Play Console form answers

Ready answers for every form Play Console asks for before the first release ([AR-14](../android-release/spec.md#store-package-ar-13ar-19)). Work through them in the order of the [publishing checklist](publishing-checklist.md). Form names follow Play Console's **Policy and programs → App content** page and **Grow users → Store presence**; Google renames menu items now and then, so look for the form's title if a path has moved.

> **Owner decisions** (nobody can answer these for you):
> 1. **Contact email** in Store settings: `<CONTACT_EMAIL — owner fills in>`.
> 2. **Target audience age groups** (see [Target audience](#target-audience-owner-decides)). Everything else below is a ready answer.

The facts every answer rests on:

- The app is a local game. It has no network code, no accounts, no analytics, no crash reporting, no ads and no in-app purchases (spec: Out of Scope).
- Player names, colors, the current game, game mode, difficulty, theme and language are saved only in the app's own storage on the device. Nothing leaves the device. Play's Data safety rules say data that stays on the device isn't "collected".
- The game UI has one footer on the setup screen (FT-1): Privacy opens the privacy policy page bundled with the app (no website), and Contact is a `mailto:` link that opens the device's email app with the developer's address. There are no other links to websites or other apps.

## App details (Store settings)

**Grow users → Store presence → Store settings**

| Field | Answer |
|---|---|
| App name | Dots and Boxes (from [en.md](en.md)) |
| App or game | Game |
| Category | **Board** |
| Tags (pick up to 5) | Board, Puzzle, Strategy, Family, Offline (pick whatever of these Play offers in its tag list; it changes) |
| Contact email | `<CONTACT_EMAIL — owner fills in>` (required, shown publicly) |
| Phone | leave empty |
| Website | https://denysslobodianyk1996.github.io/dots-and-boxes/ (optional) |
| External marketing | leave the default |

## Main store listing

**Grow users → Store presence → Main store listing**

- Texts: [en.md](en.md) (default language en-US) and [uk.md](uk.md) (translation, uk).
- App icon (512×512): [`icon-512.png`](icon-512.png).
- Feature graphic (1024×500): [`feature-graphic-en.png`](feature-graphic-en.png) and, in the Ukrainian translation, [`feature-graphic-uk.png`](feature-graphic-uk.png).
- Screenshots: `screenshots/<lang>/<device>/` with `<device>` = `phone`, `tablet7`, `tablet10` (made by `npm run store:screenshots`): [en phone](screenshots/en/phone/), [en 7"](screenshots/en/tablet7/), [en 10"](screenshots/en/tablet10/), [uk phone](screenshots/uk/phone/), [uk 7"](screenshots/uk/tablet7/), [uk 10"](screenshots/uk/tablet10/).
- Video: none.

## Privacy policy

**Policy and programs → App content → Privacy policy**

```text
https://denysslobodianyk1996.github.io/dots-and-boxes/privacy/
```

One page in English and Ukrainian (`public/privacy/index.html`). A privacy policy is mandatory once any under-13 age group is ticked, and Play asks for it anyway.

## App access

**App content → App access**: **All functionality in my app is available without any access restrictions.** No login, no codes.

## Ads

**App content → Ads**: **No, my app does not contain ads.**

## Content rating (IARC questionnaire)

**App content → Content rating → Start questionnaire**

- Email for the rating certificate: the contact email above.
- Category: **Game** (the questionnaire calls it "All Other App Types" vs "Game"; pick Game).

Answer **No** to every content question:

| Question group | Answer | Why |
|---|---|---|
| Violence (any kind, realistic or fantasy, blood) | No | Players draw lines on a grid. |
| Fear / horror | No | |
| Sexuality, nudity | No | |
| Language (profanity, crude humor) | No | All text is fixed UI text. |
| Controlled substances (drugs, alcohol, tobacco) | No | |
| Crude humor | No | |
| Gambling: real or simulated, with or without money | No | No chance-based betting; Easy's random line isn't gambling. |
| Users can interact or exchange content with each other online | No | Two players share one device; there's no network play or chat. |
| Shares user's current physical location with other users | No | |
| Allows users to purchase digital goods | No | No in-app purchases. |
| Unrestricted internet access / web browser | No | |
| Is the app a web browser or search engine | No | |

Expected result: **IARC 3+ / PEGI 3 / ESRB Everyone / USK 0**. Save, then **Submit** and apply the rating.

## Target audience (owner decides)

**App content → Target audience and content**

> **Decision for the owner.** The game is meant for children and their parents (spec AR-14). Ticking **any** age group under 13 puts the app under Google Play's **Families policy**, and Google reviews it against the requirements below. The app meets all of them today, so ticking the children's groups is safe; it does commit future versions to staying that way (no ads SDKs, no analytics, no external links).
>
> Suggested answer: tick **5 and under, 6–8, 9–12, 13–15, 16–17, 18 and over** (everyone). A narrower choice such as **6–8, 9–12, 13 and over** is equally valid. Tick only 13+ if you don't want the Families review; the listing then can't target children.

Follow-up questions:

| Question | Answer |
|---|---|
| Could your store listing unintentionally appeal to children? (asked only if no under-13 group is ticked) | Yes: the app is a simple, colorful board game. |
| Does the app contain ads? | No |
| Teacher Approved / "Designed for Families" opt-in | Optional; the app qualifies. |

### Families policy requirements and how the app meets them

| Requirement | How the app meets it |
|---|---|
| Content suitable for children | A turn-based board game with no violence, chat or user-generated content shared with anyone; IARC 3+. |
| Ads only from Families-certified SDKs, nothing interest-based | The app has no ads at all. |
| No collection of personal information from children without disclosure and consent; no transmission of identifiers (Advertising ID, Android ID, IMEI, location) | The app collects and sends nothing. Player names stay in on-device storage. No network requests. |
| Only Families-compliant SDKs | No third-party SDKs that touch user data: Only the Capacitor runtime and its official plugins, which work offline and collect nothing. |
| Privacy policy linked in the listing and accurate for children | [Privacy policy](https://denysslobodianyk1996.github.io/dots-and-boxes/privacy/), plain language, en and uk: "no data". |
| No links out of the app, to other apps or purchases without a parental gate | No web links. The setup screen's Contact is a `mailto:` link to the developer that opens the email app, with no parental gate, as in teach-clock. Privacy opens a page inside the app. |
| No in-app purchases (or behind a parental gate) | None. |
| Permissions kept to what the app needs; no location, contacts, camera, mic | The app requests no dangerous permissions. |
| Data safety form filled accurately | See below: no data collected or shared. |
| Accurate rating and target audience; no misleading "for kids" claims | IARC questionnaire answered as above; the listing describes the game plainly. |

## Data safety

**App content → Data safety**

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| (then) Is all of the user data collected by your app encrypted in transit? | Not asked once the answer is No. |
| Do you provide a way for users to request that their data is deleted? | Not asked once the answer is No. |

Rationale to keep on file: data that is processed only on the device and never sent off it isn't "collected" under Play's definition, which is exactly how player names and saved games work here.

Resulting label in the listing: **No data collected · No data shared with third parties**.

## Other declarations

| Form | Answer |
|---|---|
| Government apps | **No**, not developed by or on behalf of a government. |
| News apps | **No**, not a news app. |
| Financial features | **My app doesn't provide any financial features.** |
| Health apps | **My app does not have any health features.** |
| COVID-19 contact tracing and status | Not a publicly available COVID-19 contact tracing or status app. |
| Advertising ID | **No**, the app doesn't use an advertising ID (no ads or analytics SDK). |
| Photo and video permissions / other sensitive permissions | Not requested. |
