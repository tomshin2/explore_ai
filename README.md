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

## Technologies used

### Language

- **TypeScript** — a typed superset of JavaScript. Every line of this project is TypeScript; the compiler (`tsc`) catches whole classes of bugs before the app ever runs.

### Frontend — one codebase, three clients

- **React** — the UI library. Components are just functions that return JSX; the view re-renders when state changes.
- **React Native** — renders React components as *native* iOS/Android UI, not a web view. This is why the app feels like a real app on phones.
- **Expo SDK 57** — the framework on top of React Native that makes development pleasant: one command dev server, QR-code preview on your phone, and later one-command builds for the app stores. It also pins the exact React Native version (0.86) for you.
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
