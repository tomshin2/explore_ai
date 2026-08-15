# explore_ai

A deliberately minimal, cross-platform app demonstrating the full modern stack: **one TypeScript codebase** rendering to **Android, iOS, and web**, talking to a hosted **Postgres database with built-in auth**.

The app: sign up / sign in → view and edit your profile → the row lands in a real database. That's the whole loop that every bigger app (feeds, chat, video) is built on top of.

> **Demo mode:** if no Supabase keys are configured (`.env` missing), the app runs against local storage instead — auth and profiles work, but nothing leaves the device. A yellow **DEMO MODE** badge shows when that's active.

---

## Quick start

```bash
./runme.sh            # install + typecheck + test
./runme.sh web        # start dev server at http://localhost:8081
./runme.sh stop       # stop the background server
```

On your own machine, `npx expo start` and scan the QR in **Expo Go** to run it on a real phone.

### Activating the real backend

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the contents of `supabase/schema.sql` (creates the `profiles` table with row-level security).
3. Copy the Project URL + anon key from **Settings → API** into `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart: `./runme.sh stop && ./runme.sh web`

When configured, the DEMO MODE badge disappears and data hits real Postgres.

---

## Expo SDK & Expo Go compatibility

**This project currently targets Expo SDK 54** (React Native 0.81).

Why: **Expo Go on the Apple App Store stops at SDK 54** — SDK 55 and later are not available there. The Expo team releases a new SDK roughly every 3 months, but each store build of Expo Go supports only the single SDK it was built with, and Apple's review has been lagging (as of mid-2026, SDK 55/56/57 Expo Go builds are only distributed via TestFlight or sideloading from `sign.expo.dev`). To keep the zero-setup "install Expo Go → scan QR" flow working, this project is pinned to SDK 54 — the exact version `create-expo-app` marks "compatible with Expo Go on the Play Store and App Store".

If you see **"Project is incompatible with this version of Expo Go"**:

1. Update Expo Go from the App Store / Play Store.
2. If it still fails, the project's SDK is ahead of what your store Expo Go supports — you can either downgrade the project (below) or install a newer Expo Go build directly from `sign.expo.dev` in Safari.

Upgrading the project to a newer SDK later (once store Expo Go supports it, or via a development build):

```bash
npx expo install expo@~56.0.0   # or the latest supported
npx expo install --fix          # realigns react, react-native, etc.
```

> Note: Expo Go is a *learning/sandbox* environment — real apps ship with **development builds** (a native binary built via EAS), which don't have this version juggling.

---

## Development builds vs Expo Go

**Expo Go** is Expo's generic sandbox app: it runs any JS-only Expo project you point at it (scan a QR / open a URL), but it only contains the native code Expo chose to ship. **Development builds** are real native binaries built *from your own project* — your app name, icon, bundle id, plus whatever native modules you add. A development build keeps the dev menu and live reload, so the workflow feels like Expo Go, just with full native power.

| | Expo Go (now) | Development build (EAS) | Production build |
| --- | --- | --- | --- |
| What it is | Expo's sandbox app | Your app, compiled to a native binary | Same, release-mode, store-ready |
| Native modules | Only what Expo ships | Anything you install | Same |
| Deep links | Tunnel URL — changes every restart | Stable `exploreai://` | Same |
| SDK version | Pinned to the store's Expo Go (SDK 54) | Per-project — no juggling | Same |
| Dev loop | Scan QR → run | Same: connect to Metro, live reload | N/A (no dev menu) |

Why it matters for this project:
- **Stable deep links** — fixes the OAuth / email-confirmation redirect problems (see below).
- **Native APIs** — native Apple/Google sign-in buttons, push notifications, on-device AI (iOS `FoundationModels`, Android Gemini Nano/ML Kit) — none of which Expo Go can reach.
- **SDK upgrades** stop being blocked by Expo Go's store availability.

How to get one: `npx expo run:ios` / `npx expo run:android` on a Mac / Android Studio, or cloud-build with EAS (`eas build --profile development`). A **production build** is the same project compiled in release mode — that's what gets submitted to the App Store / Play Store.

### What counts as a build

A **build** = one cloud (or local Xcode) compilation of the project into a native binary. **Every edit we've made so far has been 0 builds** — pure JS changes stream to a running app via Metro hot reload, no native compilation involved. Builds are only needed when the *native layer* changes:

| Change | Rebuild? |
| --- | --- |
| Edit TS/JS, reload on the phone | No — hot reload via Metro |
| Add a pure-JS package (axios, date-fns) | No |
| Add a native package **already in the binary** (expo-blur, expo-linking…) | No |
| Add a native package **not yet in the binary** (expo-apple-authentication, react-native-ml-kit…) | **Yes** — `npx expo install` warns when this is required |
| Change icon / splash / scheme in `app.json` | **Yes** |

So a dev build is a *thin client*: install it once, and day-to-day code changes reload over Metro with zero builds — you only rebuild when adding native code.

### Cost & billing

| Item | Cost | Notes |
| --- | --- | --- |
| **EAS Build, Free plan** | $0/month | 15 iOS + 15 Android builds/month, resets monthly; low-priority queue (can wait 90+ min at peak); 45-min build timeout — plenty for a solo project |
| **Apple Developer Program** | $99/year | The only unavoidable cost — required to install your own app on a **physical iPhone** (free Apple IDs only sign for 7 days, which doesn't work with cloud builds) |
| **Local Xcode build** | $0 | Same $99 Apple fee for physical-device installs; the only way to skip the $99 entirely is the **iOS Simulator** |
| **Supabase** | $0 | Free tier covers a learning app |
| **AI APIs** | $0 | Not wired up yet |

There is **no "clean Mac + $0" option**: either pay $99/year to run on your real iPhone from the container, or install Xcode (~30 GB) and use the **free iOS Simulator**, which needs no Apple account at all. The simulator tests most native APIs fine; only hardware-dependent features (real Face ID, on-device Apple Intelligence models) require a physical device.

### The Mac option (local Xcode build)

To compile and run on the Mac itself you'd install the standard iOS toolchain — the "pollution" a container setup avoids:

| Tool | Why |
| --- | --- |
| **Xcode** (App Store, ~30 GB) | The compiler + iOS SDK + simulators. Then `xcode-select --install`; open Xcode once to accept the license |
| **Node.js 22** | This project runs on Node 22 (Expo 54 / RN 0.81) — `brew install node@22` or nvm |
| **CocoaPods** | iOS dependency manager React Native uses for native packages — `brew install cocoapods` |
| **Homebrew** | Installs the above |
| **Watchman** (recommended) | Fast, reliable Metro file watching — `brew install watchman` |
| **Expo CLI** | Runs the build — `npx expo run:ios` (no global install) |
| **Apple ID** | Simulator: not needed. Physical iPhone: free (7-day signing) or $99/yr |

Then: `cd explore_ai && npm install && npx expo run:ios` (add `--device` for a physical iPhone).

### EAS cloud vs local Mac — not decided yet

| | EAS cloud | Local Mac (Xcode) |
| --- | --- | --- |
| Money | $0 (free tier) | $0 (plus the same $99 for device installs) |
| Mac pollution | None — container-only | Xcode + CocoaPods + Node + Watchman (~30 GB) |
| Build wait | Cloud queue — up to 90+ min at peak on the Free tier | Minutes, no queue |
| Where code lives | In the container, as now | Pulled/edited on the Mac |

The choice is between a **clean Mac + patient cloud waits** (EAS) and a **polluted Mac + instant local builds** (local Xcode). Both cost the same; the deciding factor is how much the low-priority cloud queue bothers us versus how strongly we want to keep the Mac clean. **Currently leaning toward the Mac + iOS Simulator path** (no Apple fee, no queue), but not finalized — revisit when we actually need the first native build.

---

## Social sign-in (Google / Apple) — status & decision

**How it works:** with Supabase, social login is OAuth handled server-side. User taps **"Continue with Google"** → the app opens the provider's browser flow → on approval the provider redirects back to the app with a token → Supabase exchanges it and creates/links an account + session (the same `useAuth()` session as email login).

**Credentials required (set up once, in the provider + Supabase dashboards):**

| Provider | Setup | Cost |
| --- | --- | --- |
| Google | Google Cloud Console → OAuth client (client ID + secret) → Supabase provider | Free |
| Apple | Apple Developer Program + "Sign in with Apple" (Service ID + key) → Supabase provider | $99/year |
| GitHub / others | Create an OAuth app → paste credentials into Supabase | Free |

**Gotchas we learned:**
1. **App Store rule 4.8:** if the app offers *any* third-party login (e.g. Google), Apple **requires** Sign in with Apple too — so Google + Apple are effectively a package once you ship.
2. **Redirect URLs are the hard part:** OAuth needs a fixed URL that the provider sends the token back to. In Expo Go that URL is the *tunnel URL, which changes on every server restart* — so social login would keep breaking until we move to a development build with the stable `exploreai://` scheme.
3. **Native Apple button:** `expo-apple-authentication` provides a true native "Sign in with Apple" button (no Supabase provider setup needed), but it requires a development build.
4. **App-side code (when we add it):** `expo-auth-session` + `expo-web-browser` for the OAuth flow, Google/Apple buttons on the sign-in screen, and a callback route (e.g. `auth/callback`) that receives the redirect and completes the login.

**Decision:** held off for now. Email/password + iOS Keychain autofill (via the `textContentType`/`autoComplete` attributes on the sign-in inputs) already covers the learning use case, and OAuth would be flaky inside Expo Go anyway. Plan: add Google/Apple when we move to a development build, ahead of shipping.

---

## Technologies used

### Language

- **TypeScript** — a typed superset of JavaScript. Every line of this project is TypeScript; the compiler (`tsc`) catches whole classes of bugs before the app ever runs.

### Frontend — one codebase, three clients

- **React** — the UI library. Components are just functions that return JSX; the view re-renders when state changes.
- **React Native** — renders React components as *native* iOS/Android UI, not a web view. This is why the app feels like a real app on phones.
- **Expo SDK 54** — the framework on top of React Native that makes development pleasant: one command dev server, QR-code preview on your phone, and later one-command builds for the app stores. It also pins the exact React Native version (0.81) for you.
- **react-native-web + react-dom** — the magic that lets the *same* React Native components render as a website, so Android + iOS + web all come from this one codebase.
- **Theme system** — `lib/theme.ts` holds light + dark palettes (iOS system colors) selected by `useColorScheme()`, so the app matches the OS setting. All screens read semantic tokens (`colors.bg`, `colors.card`, `colors.accent`…) via a `ThemeContext` instead of hard-coded hex values.
- **`Pressable` + `android_ripple`** — `lib/ui.tsx` provides an `AppPressable` that gives instant ripple feedback on Android and opacity feedback on iOS, plus a shared `Avatar` component.

### Navigation

- **Expo Router** (built on React Navigation) — file-based routing: files in `app/` become routes. A `(group)` folder doesn't appear in the URL but groups screens. Dynamic routes like `member/[id].tsx` match `/member/<uuid>`. `Tabs` and `Stack` navigators are imported directly from `expo-router`. This is the same convention as Next.js's `app/` directory.
- **Native headers** — each tab is its own native `Stack`, so iOS gets large collapsing titles, the native back-swipe gesture, and the native search bar (Members tab). Push screens (member detail) get a real native back button + edge swipe.
- **expo-blur** — a `BlurView` gives the iOS tab bar its translucent frosted-glass look (`position: absolute` + `tabBarBackground`). Android uses a solid themed bar.

### Backend (Supabase, hosted)

- **Postgres** — the database. One `profiles` table holds every user's profile row.
- **Supabase Auth** — email/password sign-up and sign-in, session management, all handled server-side.
- **Row-level security** — Postgres policies in `supabase/schema.sql` ensure a user can only read/update their own row, even if someone hits the API directly. The app can't accidentally leak data because the *database itself* enforces it.

### Storage (client-side)

- **AsyncStorage** — persists the session and demo-mode data locally. On phones it uses native key-value storage; on web it uses `localStorage`. This is what keeps you logged in across app restarts.

### Testing & tooling

- **Node.js + a hand-rolled test script** — `npm test` runs the demo-mode logic (sign up → save profile → sign out) against a stubbed storage layer. No test framework needed at this size.
- **tsc** — `npm run typecheck`.
- **Metro** — Expo's JavaScript bundler + dev server; it compiles and serves the app on `localhost:8081`.

### Infrastructure

- **Rocky Linux 8.9** with `nodejs` 22, `npm` 10, and `procps-ng` (`ps`/`pkill`) installed via `dnf` — the container this project runs in.
- **runme.sh** — a small shell script that wraps the common commands (`web`, `stop`, `typecheck`, `test`) so you don't have to remember them.

---

## How it all fits together

The best way to understand these technologies is through the one journey they all serve — a tap on **Save profile** becoming a row in Postgres:

```
[Phone/Web UI]      ->  [api layer]      ->  [Supabase server]     ->  [Postgres]
React component         lib/api.ts            REST API (hosted)         profiles table
  onPress={save}        supabase-js fetch    auth check + RLS          INSERT row
```

Every technology above is a piece of that arrow.

### React — the engine of the UI

Its whole idea: *your screen is a function of state*. Keep data in variables (`const [name, setName]`), and when state changes, React re-runs the render and updates only the parts of the screen that changed. You never write "update the text label" — you write "here's the screen for this data," and React figures out the diff. That's why the profile screen just calls `setUsername()` and the text updates.

### React Native — React's renderer for phones

Regular React renders HTML (`<div>`, `<p>`). React Native instead renders *real native components* — actual Android `TextView`s and iOS `UILabel`s under the hood, not a browser window inside an app. That's why RN apps feel native (smooth scrolling, real keyboards, real gestures) while being written in the same language as the web.

### Expo — the framework around React Native

It handles everything RN leaves awkward: the dev server, QR-code preview on your phone, installing the correct native versions, and later one-command cloud builds for the app stores. Expo 54 pins React Native 0.81 + React 19.1 — you don't juggle version compatibility yourself.

### react-native-web — one codebase, all three clients

A second renderer for React: when your code runs in a browser, `<View>` becomes a `<div>`, `<Text>` becomes `<p>`. `App.tsx` never knows (or cares) which platform it's on. "Web" isn't a separate app — it's the same component tree, rendered by a different engine.

### TypeScript — the guardrail on all of it

Components receive typed props, `api.upsertProfile` has a typed signature, and `tsc` verifies everything fits together *before* any of it runs. It's the difference between catching a typo'd property at edit time vs. at runtime on a user's phone.

### Supabase — the hosted backend

No custom server code: they host the API for you. Three things bundled:
- **Postgres** — a battle-tested relational database (the same engine behind huge production apps). Your profile is a row keyed by the user's auth id.
- **Auth** — password hashing, session tokens, refresh tokens, email confirmation. Building this yourself is where apps leak credentials; Supabase gives you a hardened version out of the box.
- **REST + Realtime** — the API the app calls. `supabase-js` (the npm client) turns `api.signUp(email, password)` into an HTTPS request.

### Row-level security — why it's safe with a *public* key

The anon key ships inside the app bundle, where anyone can read it. Safety doesn't come from hiding the key — it comes from `supabase/schema.sql`, which makes the *database itself* reject any query that fails the policy (e.g. "you may only update rows where `auth.uid() = id`"). Even if someone extracts the key and writes their own SQL against your project, the database refuses. **The security lives in the database, not in your app.**

### What "no custom backend" means

With Supabase you write zero server code — no Express, no routing, no deployment. `lib/api.ts` is the thinnest possible shim that decides *which* database to talk to (real Supabase or local demo). That single file is effectively your entire backend interface.

### AsyncStorage — local persistence

Supabase hands you a session object after login; AsyncStorage keeps it on the device so you stay logged in across app restarts. On web it maps to `localStorage`; on phones it's native storage. In demo mode it's the *entire* database.

### Metro — the bundler and dev server

Your code is 200+ files of TSX; phones and browsers want one JS file. Metro resolves imports, strips types, transpiles JSX, and serves the result at `localhost:8081` with hot reload in dev.

### Why the "not used" list matters

Nothing above is a framework — no router, no state manager, no UI kit. Each "not used" item solves a scaling problem this app doesn't have yet. When a feed appears, add Expo Router. When chat appears, add a realtime subscription (Supabase `channel`) and likely Zustand. The architecture (`App.tsx → lib/api.ts → database`) is designed so those slot in as leaf additions, not rewrites.

---

## Deliberately NOT used (yet)

Each of these solves a real problem — but a good rule is to add them *in response to a pain*, not preemptively. The demo proves the whole loop works with none of them, and each slots in later without rework.

### ~~Navigation library~~ ✅ Now used — Expo Router

**What it does:** manages moving between screens — stacks, tabs, transitions, deep links.
**What we adopted:** Expo Router (file-based, built on React Navigation). The app now has a tab bar (Home / Members / Profile) plus a detail stack for viewing other members. Protected routes redirect to sign-in when no session exists, using a shared `AuthProvider` context.

### State manager (Zustand, Redux, React Context)

**What it does:** a home for app-wide data (user, cart, messages) shared across screens without prop drilling.
**Why not here:** the only shared state is the session — one `useState` + an auth-change subscription covers it.
**When to add:** when two screens must react to the same changing data (e.g. a chat list updating as messages arrive). React's built-in Context handles small cases; Zustand is the modern lightweight choice beyond that.

### UI kit (React Native Paper, Tamagui, NativeWind/Tailwind)

**What it does:** pre-built styled components (buttons, cards, inputs) plus a design system.
**Why not here:** the hand-written `StyleSheet` styles show exactly what every pixel does, with zero dependency.
**When to add:** when you want a consistent, polished look fast across many screens. NativeWind (Tailwind for RN) is the popular 2026 choice; Tamagui is strong for performance. Trade-off: a kit saves time but locks you into its look.

### Test framework (Jest + React Native Testing Library)

**What it does:** render components, simulate taps, assert behavior — automated regression tests for the UI.
**Why not here:** the highest-value tests target the pure logic layer (`lib/api.ts`), which our script already covers without a framework.
**When to add:** when the app grows past a few screens. Expo has a one-command setup (`jest-expo`); the api-layer tests stay as the foundation underneath.

---

## Project structure

```
app/
  _layout.tsx                   root: ThemeProvider + Stack + AuthProvider + demo badge
  (auth)/
    _layout.tsx                 redirect to /(app) if already signed in
    sign-in.tsx                 sign up / sign in form (themed, native inputs)
  (app)/
    _layout.tsx                 protected: redirect to /sign-in if no session
    (tabs)/
      _layout.tsx               tab bar: Home / Members / Profile (blur on iOS)
      home/
        _layout.tsx             native Stack with large title (iOS)
        index.tsx               Home — welcome card + member count + quick actions
      members/
        _layout.tsx             native Stack with large title + native search bar
        index.tsx               Members — searchable list of all profiles
      profile/
        _layout.tsx             native Stack with large title
        index.tsx               Profile — edit your own name and username
    member/
      [id].tsx                  Member detail — native back button + edge swipe
lib/
  supabase.ts                   Supabase client (null when unconfigured)
  api.ts                        data layer: real Supabase or local demo fallback
  auth-context.tsx              session provider (React Context) shared across routes
  theme.ts                      light/dark palettes + ThemeContext (system colors)
  ui.tsx                        AppPressable (ripple) + Avatar components
supabase/schema.sql             profiles table + row-level security policies
scripts/demo-test/              logic tests + Node stubs for storage
runme.sh                        dev-server / test / typecheck shortcuts
```

---

## How this measures up to web app standards

### Directory structure

Classic web standard:

```
src/
  components/  pages/  lib/
public/
package.json
```

This project maps almost one-to-one, with two React Native–specific differences:

| This project | Web equivalent | Note |
| --- | --- | --- |
| `components/`, `lib/`, `scripts/` | same | identical convention |
| `supabase/` (SQL) | `migrations/` | schema/deploy code, same idea |
| `assets/` | `public/` | static images/icons |
| `app/` directory | `src/pages/` | expo-router file-based routing — same as Next.js `app/` |
| `app.json` | webpack/vite config | Expo's project config |

The modern Expo default (expo-router) uses an `app/` directory with file-based routing — the same convention as Next.js's `app/` — so growing toward web standards is a natural step.

### Builds — `package.json` scripts *are* the makefile

For JavaScript web apps, **`npm run ...` scripts are the standardized build interface** — a Makefile is idiomatic for C/Go/Rust, not JS. This project follows the convention:

- `npm run typecheck` — static check
- `npm test` — logic tests
- `npx expo start` — dev server
- `npx expo export --platform web` — **production build** → static files in `dist/`

`runme.sh` is a convenience wrapper around those npm scripts for this container — extra, not the standard.

### Production pipeline

Standard web flow: **source → bundler → static `dist/` → host.** Ours is the same, with **Metro** in the bundler role (our webpack/Vite equivalent). The `dist/` output deploys to any static host (Netlify, Vercel, etc.).

### What becomes "more standard" as the app grows

- Add `__tests__/` folders alongside components (Jest)
- Optionally wrap everything in `src/`

---

## Backlog / next steps

- [ ] **Make the email-confirmation flow work properly.** Right now clicking the confirm link in Supabase's email fails with "missing website": the link points at the project's Site URL (a browser URL), but a mobile app has no website. To fix it properly:
      1. In Supabase dashboard → **Authentication → URL Configuration**, set the **Site URL** (and a **Redirect URL**) to the app's deep link (e.g. `exp://...` for Expo Go, or `exploreai://` for a real build).
      2. In the app, catch the confirmation token when the app opens from the link and complete verification — with expo-router this means adding a dynamic route (e.g. `auth/callback`) that calls `supabase.auth.verifyOtp({ type: 'email' })` (or the flow Supabase's `detectSessionInUrl` already wires for web).
      3. Test end-to-end with a fresh signup. Shortcut while learning: keep "Confirm email" disabled in **Authentication → Sign In / Up**.
- [x] ~~Turn the app into a real multi-screen app with expo-router (tabs + stack) once there's more than one feature.~~ — Done: Home, Members, Profile tabs + Member detail stack screen.
- [ ] Wire a UI test framework (Jest + React Native Testing Library) as screens multiply.
- [ ] Move the project to a development build (EAS): unlocks SDK upgrades without Expo Go, stable `exploreai://` deep links, native modules, and on-device AI. Details in the "Development builds vs Expo Go" section above.
- [ ] Add social sign-in (Google + Apple) once on a development build — needs Google Cloud + Apple Developer credentials (see "Social sign-in" section above).
- [ ] Optionally add AI features (e.g. chat or auto-generated bios) via a Supabase Edge Function that holds the provider API key — never ship a key inside the app bundle. On-device NLP (iOS `NaturalLanguage`/`FoundationModels`, Android ML Kit/Gemini Nano) becomes reachable after the dev build.

