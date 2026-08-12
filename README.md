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

## Technologies used

### Language

- **TypeScript** — a typed superset of JavaScript. Every line of this project is TypeScript; the compiler (`tsc`) catches whole classes of bugs before the app ever runs.

### Frontend — one codebase, three clients

- **React** — the UI library. Components are just functions that return JSX; the view re-renders when state changes.
- **React Native** — renders React components as *native* iOS/Android UI, not a web view. This is why the app feels like a real app on phones.
- **Expo SDK 54** — the framework on top of React Native that makes development pleasant: one command dev server, QR-code preview on your phone, and later one-command builds for the app stores. It also pins the exact React Native version (0.81) for you.
- **react-native-web + react-dom** — the magic that lets the *same* React Native components render as a website, so Android + iOS + web all come from this one codebase.

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

### Navigation library (React Navigation / Expo Router)

**What it does:** manages moving between screens — stacks, tabs, transitions, deep links. Whole UX patterns are built on it.
**Why not here:** the app has two screens chosen by one `if` statement in `App.tsx`. A library would be pure overhead.
**When to add:** the moment there's a real hierarchy — a feed that pushes to a detail screen, a tab bar, etc. Expo's default template ships with Expo Router (file-based routing) for exactly this.

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
App.tsx                        session gate: AuthScreen vs ProfileScreen
components/AuthScreen.tsx      sign up / sign in form
components/ProfileScreen.tsx   read + edit the user's profile row
lib/supabase.ts                Supabase client (null when unconfigured)
lib/api.ts                     data layer: real Supabase or local demo fallback
supabase/schema.sql            profiles table + row-level security policies
scripts/demo-test/             logic tests + Node stubs for storage
runme.sh                       dev-server / test / typecheck shortcuts
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
| `App.tsx` + `index.ts` at root | `src/` entry files | Expo's toolchain expects root entry; moving to `src/` is optional |
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

- Adopt expo-router (`app/` dir, file-based routing) — aligns with Next.js
- Add `__tests__/` folders alongside components (Jest)
- Optionally wrap everything in `src/`

---

## Backlog / next steps

- [ ] **Make the email-confirmation flow work properly.** Right now clicking the confirm link in Supabase's email fails with "missing website": the link points at the project's Site URL (a browser URL), but a mobile app has no website. To fix it properly:
      1. In Supabase dashboard → **Authentication → URL Configuration**, set the **Site URL** (and a **Redirect URL**) to the app's deep link (e.g. `exp://...` for Expo Go, or `exploreai://` for a real build).
      2. In the app, catch the confirmation token when the app opens from the link and complete verification — with expo-router this means adding a dynamic route (e.g. `auth/callback`) that calls `supabase.auth.verifyOtp({ type: 'email' })` (or the flow Supabase's `detectSessionInUrl` already wires for web).
      3. Test end-to-end with a fresh signup. Shortcut while learning: keep "Confirm email" disabled in **Authentication → Sign In / Up**.
- [ ] Turn the app into a real multi-screen app with expo-router (tabs + stack) once there's more than one feature.
- [ ] Wire a UI test framework (Jest + React Native Testing Library) as screens multiply.
- [ ] Move the project to a development build (EAS) so SDK upgrades stop being blocked by Expo Go's store availability.

