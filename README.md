# GhanaAlert

GhanaAlert is a mobile-first consumer alert app for Ghana. It brings product recalls, food and health notices, scams, service disruptions, travel advisories, and consumer-rights guidance into one place so people can make safer choices.

This repository is an Expo/React Native app with a Neon Postgres + Express backend. Authentication uses Neon Auth (Managed Better Auth, email/password) with Bearer JWTs. Alerts/categories are served from the API with mock fallback; reports are posted to the protected server endpoint with local fallback.

## Features

- Onboarding and Neon Auth login/registration (email/password) with email verification (OTP code)
- Home screen with greeting, search, featured alert, and category shortcuts
- Browse all alerts with search, category filters, sorting, and pagination
- Category screens for all seven alert categories
- Alert detail with priority banner, affected products, recommended actions, source, and sharing
- Saved alerts and Read Later lists with removal and undo
- Consumer issue reports with form validation, current-location detection, and photo attachments
- Notification preferences, per-category toggles, and a local test notification
- Region selection, FAQs, help, about, and logout
- Profile editing for name, profile picture, and password (`/change-password`)
- Session persisted via SecureStore (cookie + JWT); UI state in AsyncStorage
- Light theme, custom app icon, splash screen, and notification icon

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Expo SDK 58, React Native 0.88, React 19 |
| Language | TypeScript 6 |
| Navigation | Expo Router |
| State | Zustand + AsyncStorage |
| Auth | Neon Auth (Managed Better Auth), `expo-secure-store` |
| Backend | Express 5, `pg` (Neon Lakebase Postgres), `jose` (EdDSA JWT verify) |
| Forms | React Hook Form + Zod |
| UI | Custom components, Inter font, Expo Vector Icons |
| Device APIs | Expo Notifications, Location, Image Picker, SecureStore |
| Dates | date-fns |

## Getting started

### Requirements

- Node.js 20 or newer
- npm
- Expo Go on a physical device, or a local development build
- A Neon project with Auth enabled

### 1. Neon setup (once)

1. Open your project in the [Neon Console](https://console.neon.tech).
2. Go to **Auth > Configuration** and copy the Auth base URL. It looks like:
   `https://<host>/neondb/auth`
3. The JWKS URL is that base URL plus `/.well-known/jwks.json`:
   `https://<host>/neondb/auth/.well-known/jwks.json`
4. Enable **Sign-up with Email** and **Verify at Sign-up** (verification codes, works on shared SMTP). Verification links require a custom SMTP provider.
5. If you ever pasted a database password into chat or Git, reset it in **Connection Details > Reset password** and update `server/.env`.

### 2. Install and configure env

```bash
git clone https://github.com/hollali/ghana-alert.git
cd ghana-alert
npm install
cp .env.example .env
cp server/.env.example server/.env
```

In root `.env` set:

```bash
EXPO_PUBLIC_NEON_AUTH_URL=https://<host>/neondb/auth
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

In `server/.env` set:

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require
NEON_AUTH_BASE_URL=https://<host>/neondb/auth
NEON_AUTH_JWKS_URL=https://<host>/neondb/auth/.well-known/jwks.json
PORT=3000
```

Never commit either `.env` file (`server/.env` and root `.env` are gitignored).

### 3. Run backend + app

Expo inlines `EXPO_PUBLIC_*` at bundle time, so restart with a cleared cache after any env change:

```bash
# Terminal 1: API (from project root)
node server/index.js
# Terminal 2: app
npx expo start -c
```

Scan the QR code with Expo Go, or press `a`, `i`, or `w` for Android, iOS, or web.

> On a physical device, `localhost:3000` points to the phone itself. Set `EXPO_PUBLIC_API_BASE_URL` to your PC’s LAN IP (e.g. `http://192.168.1.20:3000`) instead.

### 4. Auth flow

- App calls `{NEON_AUTH_URL}/sign-up/email` and `/sign-in/email` (Better Auth method set).
- Neon requires an `Origin` header on POSTs; React Native does not send it by default, so `src/lib/neonAuth.ts` sends `Origin: http://localhost:8081` (or `window.location.origin` on web, override with `EXPO_PUBLIC_APP_ORIGIN`). Localhost origins are pre-trusted.
- Neon sets an HTTP-only session cookie; the app stores it plus the JWT (`set-auth-jwt` header) in SecureStore.
- API calls use `Authorization: Bearer <jwt>` via `src/lib/api.ts`.
- Express verifies the JWT against the JWKS endpoint (EdDSA, `iss`/`aud` = auth origin) in `server/services/neonAuth.js`.
- `POST /api/reports` and `GET /api/me` are protected; alert reads are public.

### 5. Email verification (OTP)

If **Verify at Sign-up** is enabled, signup does not create a session until the email is verified:

1. After signup, or after `Email is not verified` on sign-in, the app routes to `(auth)/verify`.
2. Enter the verification code from Neon’s email (codes expire after 15 min; the email may say 10 min). Tap **Resend** to mint a new code — older codes are invalidated on resend.
3. The app calls `/email-otp/verify-email` via `verifyEmailOtp` in `src/lib/neonAuth.ts`, then fetches the session. `autoSignInAfterVerification` logs you in.

App mailer: no Resend/SendGrid needed for dev. Neon Auth sends verification codes via shared SMTP (`auth@mail.myneon.app`). Verification links and production need a custom SMTP provider — see [production checklist](https://neon.com/docs/auth/production-checklist.md).

> If you enabled **Verify at Sign-up** but `Send verification email on sign-up` is off, no code is sent automatically. Tap Resend on the verify screen, or enable it in the Console.

### EAS builds

`.env` is not shipped to cloud builds. Set the public URL in Expo Services:

```bash
npx eas-cli env:set --name EXPO_PUBLIC_NEON_AUTH_URL --value https://<host>/neondb/auth --environment production --visibility plaintext
```

`eas.json` build profiles reference `environment: production|preview|development`, so EAS will inject `EXPO_PUBLIC_*` vars into the JS bundle. Server secrets (`DATABASE_URL`, `NEON_AUTH_*`) stay only in `server/.env` on the host that runs `server/index.js`.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run android` | Start Expo and open Android |
| `npm run ios` | Start Expo and open iOS |
| `npm run web` | Start Expo for web |
| `npm run lint` | Run Expo ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `node server/index.js` | Start the Express API (expects `server/.env`) |

## Project structure

```text
app/
  (onboarding)/welcome.tsx    Onboarding
  (auth)/login.tsx            Neon Auth sign-in
  (auth)/register.tsx         Neon Auth registration
  (auth)/verify.tsx           Email OTP verification + resend
  (tabs)/index.tsx            Home
  (tabs)/alerts.tsx           Alert browsing, search, filters, pagination
  (tabs)/categories.tsx       Category overview
  (tabs)/profile.tsx          Profile and settings menu
  alert/[id].tsx              Alert detail
  category/[slug].tsx         Alerts filtered by category
  saved.tsx                   Saved and Read Later lists
  report.tsx                  Consumer issue report form
  settings/                   Notifications, location, help, about, profile
src/
  components/                 Shared UI components
  config/auth.ts              EXPO_PUBLIC_NEON_AUTH_URL + API base URL
  data/                       Mock alerts, categories, user, FAQs, regions (fallback)
  hooks/useAlerts.ts          GET /api/alerts with mock fallback
  hooks/useCategories.ts      GET /api/categories with mock fallback
  lib/neonAuth.ts             Neon Auth REST client + SecureStore + Origin header
  lib/api.ts                  Public + authenticated fetch, snake_case → camelCase
  store/                      Auth, saved alerts, preferences, reports
  theme/                      Colors, spacing, typography, shadows
  utils/                      Greeting, time formatting, notifications
  strings.ts                  Centralized UI copy
server/
  index.js                    Express app, protected routes
  services/db.js              pg Pool from DATABASE_URL
  services/neonAuth.js        JWKS JWT verification (jose, EdDSA)
  services/requireAuth.js     Bearer middleware
```

## How it works

- **Alerts/categories:** The API (`GET /api/alerts`, `/api/categories`) is primary; `src/data/` is fallback when the API is unreachable. Mapping handles `published_at` → `publishedAt`, `affected_products` → `affectedProducts`, etc.
- **Persistence:** `hasSeenOnboarding` and cached user live in AsyncStorage (`ghanaalert-auth`); session cookie + JWT live in SecureStore. Saved alerts, preferences, and reports use `ghanaalert-*` keys.
- **Reports:** `reportsStore.addReport()` POSTs to `/api/reports` with the Bearer JWT, maps the returned row, and falls back to a local report. The form shows sync errors if the server is unavailable.
- **Notifications:** The app requests permission when notifications are enabled and can schedule a local test alert. Remote push notifications are not configured.
- **Location:** Current location and reverse geocoding use Expo Location. If permission is denied, the report form falls back to manual location entry.
- **Photos:** Report photos are selected from the device library, limited to 5 MB, and previewed locally.

## Design

The interface uses a navy, amber, and off-white palette:

- Primary navy: `#14306B`
- Accent amber: `#F5A623`
- Background: `#F6F8FC`
- Text: `#111827`

Typography uses Inter, and all shared design tokens live in `src/theme/tokens.ts`.

## Security

- Never commit `DATABASE_URL` or any password. `.env.example` uses placeholders only.
- `NEON_AUTH_BASE_URL` / `NEON_AUTH_JWKS_URL` are server-side only. The public `EXPO_PUBLIC_NEON_AUTH_URL` is safe to ship in the bundle.
- If a password was ever exposed, rotate it in the Neon Console and update `server/.env` immediately. Removing it from Git history alone is not enough.

## Known limitations

- Alerts are seeded from the same sample data; no admin feed yet.
- Report photos are kept in local state only until object storage is added.
- No remote push notifications, map view, or production analytics.
- Native iOS and Android folders are generated by Expo and are intentionally not committed.
- The iOS bundle identifier and Android package still use the `app.ghanaalert` placeholder and should be changed before release.
- Jest config is broken (`metro-react-native-babel-preset` missing); the current baseline is typecheck, lint, and Expo Doctor.

## Audit

A senior mobile audit and remediation roadmap is documented in [AUDIT.md](AUDIT.md). The current baseline includes typecheck, lint, Expo Doctor, and web, iOS, and Android export checks. Remaining release blockers are listed in that report.

## Verification

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

TypeScript and Expo Doctor pass. ESLint reports one non-blocking React Compiler warning in the report form because of the React Hook Form integration.

## License

MIT. See [LICENSE](LICENSE).
