# Feedants — Competition Details Screen

A functional full-stack implementation of the Competition Details screen from the
Feedants technical assignment: React Native (Expo) frontend, Node.js/Express
backend, MongoDB database. Everything on the screen — prize pool, spots left,
countdown, dates, judge, previous winners, tab content, rewards — is served
dynamically from the database, and every user action (register, submit) is
enforced by real backend business rules, not client-side assumptions.

## Project structure

```
backend/    Express + Mongoose API
  src/
    models/        Competition, Registration, User (Mongoose schemas)
    services/       competitionService (read DTO), registrationService (writes)
    controllers/    Express request handlers
    routes/         /api/competitions/*
    middleware/     auth (JWT), validate (Zod), rateLimiter, errorHandler
    validators/     Zod schemas
    seed/           seedCompetition.js — populates one competition matching the design
    scripts/        mintToken.js — mint a demo JWT for local testing
mobile/     React Native (Expo) app
  src/
    screens/        CompetitionDetailsScreen.js — the actual screen
    components/     CompetitionHeader, JudgeCard, CountdownBanner, ImportantDatesGrid,
                     PreviousWinnersCarousel, InfoTabs, RewardsList, BottomActionBar
    hooks/          useCompetitionDetails, useCountdown, useRegisterCompetition
    api/            axios client + endpoint calls
    dev/            devSession.js — dev-only env-driven auth/competition-id bootstrap
    utils/          uploadMedia.js — submission file picker + upload abstraction
    i18n/           en.json / hi.json — ENG/हिंदी toggle content
    theme/          colors.js
  App.js            entry point; resolves dev session, then renders the screen
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB, running as a **replica set** (even a single-node one) — the
  registration flow uses multi-document transactions, which MongoDB only
  supports on a replica set / mongos, not a standalone `mongod`.
- Expo Go app on your phone (easiest), or an iOS/Android simulator

## 1. MongoDB setup

Pick one:

**Local, single-node replica set:**
```bash
mongod --replSet rs0 --dbpath /path/to/your/data/dir
# in another terminal, one-time:
mongosh --eval "rs.initiate()"
```

**MongoDB Atlas (free tier):** create a cluster (Atlas clusters are replica
sets by default), grab its connection string — no local setup needed.

## 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

| Variable | Meaning |
|---|---|
| `PORT` | API port (default `4000`) |
| `MONGO_URI` | Your replica-set/Atlas connection string |
| `JWT_SECRET` | Any long random string — used to sign/verify demo JWTs |
| `REGISTRATION_HOLD_TTL_SECONDS` | How long a `pending_payment` hold reserves a slot before it's released (default 600) |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | Read-endpoint rate limiting |

```bash
npm install
npm run seed        # creates one competition matching the design + one demo user
npm run dev          # http://localhost:4000
```

`npm run seed` prints two ids to the terminal — a **competition `_id`** and a
**demo user `_id`**. You'll need both in the next steps.

### Minting a demo JWT

Requests are authenticated with a JWT whose `sub` claim is a user id:

```bash
npm run mint-token -- <demo-user-id>
```

This prints a JWT to stdout. It works identically on macOS/Linux/Windows
(no shell-quoting issues, unlike a `node -e "..."` one-liner). **Never commit
this token or your `JWT_SECRET` to git.**

## 3. Mobile

```bash
cd mobile
cp .env.example .env
```

Edit `mobile/.env`:

| Variable | Meaning |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Where the backend is reachable — see table below |
| `EXPO_PUBLIC_DEMO_AUTH_TOKEN` | The JWT printed by `npm run mint-token` above |
| `EXPO_PUBLIC_DEMO_COMPETITION_ID` | The competition `_id` printed by `npm run seed` |

`EXPO_PUBLIC_*` variables are inlined by Expo automatically (SDK 49+, no
extra config) and are loaded on app start by `src/dev/devSession.js`, which
writes the token into `AsyncStorage` for you. This is a **development-only**
convenience — a real app has an actual login screen; nothing here should be
mistaken for production auth, and none of it involves committing a real
token to source control (it lives only in your local, gitignored `.env`).

`EXPO_PUBLIC_API_BASE_URL` — **`localhost` means something different
depending on where the app runs**, the most common setup snag:

| Running on | Set it to |
|---|---|
| Web, or iOS Simulator on the same machine as the backend | `http://localhost:4000/api` |
| Android emulator | `http://10.0.2.2:4000/api` |
| Expo Go on a physical phone | `http://<your-computer's-LAN-IP>:4000/api` (same Wi-Fi; find your IP with `ipconfig getifaddr en0` on Mac or `ipconfig` on Windows) |

If `EXPO_PUBLIC_DEMO_COMPETITION_ID` isn't set, the app shows a clear
"Development setup needed" screen instead of crashing or rendering blank.

```bash
npm install
npx expo start
```
Scan the QR code with Expo Go, or press `a` / `i` for an emulator/simulator.

## Running tests

```bash
cd backend
npm test
```

Two tiers:
- **Unit tests** (`*.unit.test.js`) — pure logic, no database required:
  `Competition.computeLifecycle()`, Zod validators, JWT auth middleware.
  These run in this repo's CI/any environment with just `npm test`.
- **Integration tests** (`*.integration.test.js`) — the concurrency-critical
  registration flow (atomic slot booking, the "only one winner when 10 users
  race for the last spot" case, deadline/duplicate/window enforcement)
  against a real MongoDB replica set. They **skip automatically** (not fail)
  unless `TEST_MONGO_URI` is set:
  ```bash
  TEST_MONGO_URI=mongodb://127.0.0.1:27017/feedants_test npm run test:integration
  ```

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/competitions/:id?locale=en\|hi` | Full details, personalized if a valid JWT is sent |
| POST | `/api/competitions/:id/register` | Claim a spot (creates a `pending_payment` hold) |
| POST | `/api/competitions/:id/registrations/:registrationId/confirm-payment` | Confirm after payment gateway success |
| POST | `/api/competitions/:id/submissions` | Upload a submission during the submission window |

## Data model

- **Competition** — all display content (localized `{en, hi}` fields for the
  ENG/हिंदी toggle), dates, capacity, judge, previous winners, rewards, tab
  content. `computeLifecycle(now)` derives the current phase
  (`registration_open → registration_closed → submission_open → judging →
  completed`) and `spotsLeft` purely from dates + counters — computed
  identically on every read and write path, so the UI, the register
  endpoint, and the submit endpoint can never disagree about what state the
  competition is in.
- **Registration** — one per (user, competition), with a status machine
  (`pending_payment → confirmed → submitted`, or `expired`/`cancelled`). A
  partial unique index enforces "one active registration per user per
  competition" at the database level.
- **User** — minimal stand-in; a real Feedants backend almost certainly
  already has an auth/user service, which is out of scope here.

## Handling concurrency ("thousands of concurrent users")

- `confirmedParticipants` is denormalized on `Competition`, but never
  read-then-written from application code. Registering does a single atomic
  `findOneAndUpdate` with the capacity/deadline/publish checks *in the
  filter*, so MongoDB itself guarantees only one of many simultaneous
  requests can win the last spot — everyone else gets a clean "competition
  full" instead of a race condition. This is exercised directly by the "10
  users race for 1 spot, exactly 1 wins" integration test.
- Claiming a spot and creating the `Registration` document happen inside a
  single Mongo transaction, so the counter and the registration record can
  never drift apart.
- A user starting checkout gets a time-boxed `pending_payment` hold (counted
  against capacity immediately) rather than an instant "confirmed" —
  modeling the real gap between "claimed a slot" and "actually paid."
  Expired, unpaid holds are lazily released back into the pool the next time
  the competition is touched; production would additionally sweep them with
  a scheduled job.
- The GET details endpoint has a more generous rate limit than the write
  endpoints, since it's expected to be polled for "spots left" freshness at
  scale, while writes are the ones worth protecting from retry storms.

## Important assumptions

- Authentication/user accounts exist as a separate service in the real app;
  I modeled just enough `User` + JWT verification to make ownership and
  registration-state checks demonstrable end-to-end. The mobile app's
  env-driven demo-token bootstrap (`src/dev/devSession.js`) exists purely so
  a reviewer can run this without building a login screen — it is explicitly
  documented as dev-only and never commits a real token to git.
- Payments: the design references Razorpay. The assignment does not require
  a live payment gateway integration (it explicitly leaves architecture
  decisions to the candidate), so I modeled the realistic *shape* of a
  payment-gated registration (`pending_payment` hold → `confirm-payment`
  after gateway success) without wiring real Razorpay credentials, which
  can't safely be committed to a public repo. The register endpoint accepts
  an optional `paymentReference` so a real gateway can be dropped in without
  changing the contract.
- Submission uploads: `mobile/src/utils/uploadMedia.js` implements a real
  device file picker (`expo-document-picker`) and real client-side
  validation (file selected, size ceiling), but the actual network upload
  to object storage is a clearly-labeled stub (see comments in that file) —
  it requires storage credentials that can't be committed here. The
  backend-side validation (must be registered, must be within the
  submission window) is fully real and is what the integration tests cover.
- Secondary UI elements in the design that don't carry competition logic
  (the ad slot, "Refer & Earn", "Hear From Our Users") were left out of the
  backend data model to keep it focused on what's actually dynamic and
  gradeable business logic.

## Major technical decisions

- **Server-computed state, dumb client**: the API returns `lifecycle.phase`,
  `capacity.spotsLeft`, `viewer.registrationStatus`, and `serverTime`
  directly — the mobile app never re-derives business rules from raw dates.
- **Countdown anchored to server time**: `useCountdown` captures the offset
  between `serverTime` and the device clock once per fetch, then ticks
  locally — accurate even on a device with a wrong clock.
- **Localization as data, not client strings**: judge bio, tab content,
  disclaimer, and reward labels are stored as `{en, hi}` in MongoDB and
  resolved server-side by `?locale=`.
- **Zod for input validation, a shared `ApiError`/error-handler for output
  shape** — every failure reaches the client as `{ ok: false, code,
  message }`, so the mobile app can branch on `err.code`.

## Trade-offs I'd revisit for a larger production build

- **Polling vs. push**: 20-second polling for "spots left" is simple and
  horizontally scalable but not truly real-time; I'd move to
  WebSockets/SSE for a fast-moving competition.
- **Payment flow**: finish real Razorpay integration (order creation,
  webhook-verified confirmation — never trust a client-reported payment
  success — automatic hold expiry via a scheduled worker).
- **Reconciliation job**: add a periodic job that recomputes
  `confirmedParticipants` from actual `Registration` counts and alerts on
  drift, as a safety net beneath the atomic-update guarantee.
- **Media uploads**: replace the stub in `uploadMedia.js` with a real
  pre-signed-URL flow once object storage credentials exist.
- **Testing**: unit tests cover the pure lifecycle/validation/auth logic;
  integration tests cover the concurrency-critical registration path but
  need a real MongoDB replica set to run (not available in every CI
  environment out of the box — would wire `mongodb-memory-server` or a CI
  service container for that).
- **Admin/CMS**: competition content is currently only seedable via script;
  a real product would need an admin surface to create/edit competitions.

## Known intentional limitations

- No live payment gateway, no live object storage — both explicitly stubbed
  and documented above, not silently faked.
- No automated E2E/UI test suite (Detox, etc.) — out of scope given time,
  covered instead by backend unit + integration tests on the business logic
  that's actually evaluated.
- Dev-only auth bootstrap (`devSession.js`) is not production auth and is
  clearly commented as such.

## Demo instructions

1. Seed the backend, mint a token, set both in `mobile/.env` (steps above).
2. Start the backend (`npm run dev`) and the app (`npx expo start`).
3. On the Competition Details screen: toggle ENG/हिंदी, watch the countdown,
   tap **Register Now**, see the spots count and your registration state
   update, then (once in the submission window) tap **Upload Submission**
   and pick a video file.
4. A short screen recording of this flow is a required submission item per
   the assignment brief — record ~60–90 seconds of the above and link it
   here before submitting.
