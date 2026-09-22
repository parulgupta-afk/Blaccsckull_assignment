# Feedants — Competition Details Screen

A functional full-stack implementation of the Competition Details screen from the
technical assignment: React Native (Expo) frontend, Node.js/Express backend,
MongoDB database. Everything on the screen — prize pool, spots left, countdown,
dates, judge, previous winners, tab content, rewards — is served dynamically
from the database, and every user action (register, submit) is enforced by
real backend business rules, not client-side assumptions.

## Project structure

```
backend/    Express + Mongoose API
mobile/     React Native (Expo) app — CompetitionDetailsScreen + components
```

## Running it

### Backend

```bash
cd backend
cp .env.example .env      # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed               # creates one competition matching the provided design
npm run dev                 # http://localhost:4000
```

Requires a MongoDB **replica set** (even a single-node one) because the
registration flow uses multi-document transactions. Locally, the quickest way
is `mongod --replSet rs0` and `mongosh --eval "rs.initiate()"`, or use a free
MongoDB Atlas cluster (Atlas is a replica set by default) and put its URI in
`.env`.

The seed script prints a competition `_id` and a demo user `_id`. Requests are
authenticated with a JWT whose `sub` claim is a user id — mint one with:

```bash
npm run mint-token -- <demo-user-id>
```

(This works the same on Windows, Mac, and Linux — no shell-quoting issues,
unlike a `node -e "..."` one-liner, which PowerShell/cmd can mangle.)

### Mobile

```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```

Set `DEMO_COMPETITION_ID` in `App.js` to the id printed by the seed script.

The app reads the backend URL from `EXPO_PUBLIC_API_BASE_URL` in `mobile/.env`
(Expo inlines any `EXPO_PUBLIC_`-prefixed var automatically — no extra config
needed). **`localhost` means something different depending on where the app
runs**, which is the most common setup snag:

| Running on | Set `EXPO_PUBLIC_API_BASE_URL` to |
|---|---|
| Web, or iOS Simulator on the same Mac as the backend | `http://localhost:4000/api` |
| Android emulator | `http://10.0.2.2:4000/api` |
| Expo Go on a physical phone | `http://<your-computer's-LAN-IP>:4000/api` (phone and computer must be on the same Wi-Fi; find your IP with `ipconfig getifaddr en0` on Mac or `ipconfig` on Windows) |

If the variable isn't set, the app falls back to a best-effort per-platform
default and logs a warning — it won't fail silently.

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/competitions/:id?locale=en\|hi` | Full details, personalized if a valid JWT is sent |
| POST | `/api/competitions/:id/register` | Claim a spot (creates a `pending_payment` hold) |
| POST | `/api/competitions/:id/registrations/:registrationId/confirm-payment` | Confirm after payment gateway success |
| POST | `/api/competitions/:id/submissions` | Upload a submission during the submission window |

## Data model

- **Competition** — all display content (localized `{en, hi}` fields for the
  ENG/हिंदी toggle in the design), dates, capacity, judge, previous winners,
  rewards, tab content. A `computeLifecycle(now)` method derives the current
  phase (`registration_open → registration_closed → submission_open →
  judging → completed`) and `spotsLeft` purely from dates + counters — this
  is computed the same way on every read and write path, so the UI, the
  register endpoint, and the submit endpoint can never disagree about what
  state the competition is in.
- **Registration** — one per (user, competition), with a status machine
  (`pending_payment → confirmed → submitted`, or `expired`/`cancelled`). A
  partial unique index enforces "one active registration per user per
  competition" at the database level, not just in application code.
- **User** — minimal stand-in; a real Feedants backend almost certainly
  already has an auth/user service, which is out of scope here.

## Handling concurrency ("thousands of concurrent users")

This was the part I spent the most design effort on, since it's the one
piece of the assignment a static/hardcoded implementation cannot fake.

- `confirmedParticipants` is a denormalized counter on `Competition`, but it
  is **never** read-then-written from application code. Registering does a
  single atomic `findOneAndUpdate` with the capacity/deadline/publish checks
  *in the filter* (`confirmedParticipants: { $lt: maxParticipants }`, etc.),
  so MongoDB itself guarantees only one of many simultaneous requests can
  win the last spot — everyone else gets a clean "competition full" instead
  of a race condition.
- Claiming a spot and creating the `Registration` document happen inside a
  single Mongo transaction, so the counter and the registration record can
  never drift apart even if the request fails partway through.
- A user starting checkout gets a time-boxed `pending_payment` hold (counted
  against capacity immediately, so it can't be double-sold) rather than an
  instant "confirmed" — this models the real gap between "claimed a slot"
  and "actually paid." Expired, unpaid holds are lazily released back into
  the pool the next time the competition is touched; in production this
  would also be swept by a scheduled job so slots don't sit reserved between
  requests.
- The GET details endpoint has a much more generous rate limit than the
  write endpoints (register/submit), since it's expected to be polled
  frequently for "spots left" freshness at scale, while write endpoints are
  the ones worth protecting from retry storms.
- `Competition.computeLifecycle()` is a pure function reused by the read
  endpoint *and* the register/submit services, so "is registration open
  right now" is decided identically everywhere — no drift between what the
  screen shows and what the server enforces.

## Important assumptions

- Authentication/user accounts exist as a separate service in the real app;
  I modeled just enough `User` + JWT verification to make ownership and
  registration-state checks demonstrable end-to-end.
- Payments: the design references Razorpay. I modeled the realistic shape of
  a payment-gated registration (`pending_payment` hold → `confirm-payment`
  after gateway success) but did not wire a live Razorpay integration, since
  that requires real merchant credentials outside this assignment's scope.
  The register endpoint accepts an optional `paymentReference` so the
  contract is ready for a real gateway to be dropped in.
- Submission uploads: the screen's "Upload Submission" action calls the
  submissions endpoint with a media URL. Actual file upload (device picker →
  object storage, e.g. S3/Cloudinary → URL) is stubbed with a fixed URL in
  the mobile app; the backend-side validation (must be registered, must be
  within the submission window) is fully real.
- Client polls the details endpoint every 20s rather than using WebSockets/SSE
  for live spot updates — see trade-offs below.
- Secondary UI elements in the design that don't carry competition logic
  (the ad slot, "Refer & Earn", "Hear From Our Users") are out of scope for
  this assignment's business logic and were left out of the backend model to
  keep the data model focused on what's actually dynamic and gradeable.

## Major technical decisions

- **Server-computed state, dumb client**: the API returns `lifecycle.phase`,
  `capacity.spotsLeft`, `viewer.registrationStatus`, and `serverTime`
  directly — the mobile app never re-derives business rules from raw dates.
  This avoids device-clock skew bugs and means a rule change (e.g. adding a
  new phase) only touches the backend.
- **Countdown anchored to server time**: `useCountdown` captures the offset
  between `serverTime` and the device clock once per fetch, then ticks
  locally — accurate even on a device with a wrong clock, without a network
  call every second.
- **Localization as data, not client strings**: judge bio, tab content,
  disclaimer, and reward labels are stored as `{en, hi}` in MongoDB and
  resolved server-side by a `?locale=` query param, matching the ENG/हिंदी
  toggle actually being a content toggle, not just a label toggle.
- **Zod for input validation, a shared `ApiError`/error-handler for output
  shape** — every failure (validation, business rule, duplicate key) reaches
  the client as `{ ok: false, code, message }`, so the mobile app can branch
  on `err.code` instead of parsing messages.

## Trade-offs I'd revisit for a larger production build

- **Polling vs. push**: 20-second polling is simple and horizontally
  scalable but not truly real-time. For a competition with fast-moving
  capacity, I'd move to WebSockets or SSE for `spotsLeft`/`registered`
  updates, falling back to polling on unsupported clients.
- **Payment flow**: I'd finish the Razorpay integration for real (order
  creation, webhook-verified confirmation, automatic hold expiry via a
  scheduled worker instead of lazy release-on-read) rather than accepting a
  client-supplied `paymentReference`.
- **Reconciliation job**: `confirmedParticipants` is denormalized for fast
  reads; I'd add a periodic job that recomputes it from actual `Registration`
  counts and alerts on drift, as a safety net beneath the atomic-update
  guarantee.
- **Media uploads**: wire a real signed-upload flow (e.g. pre-signed S3 URL)
  from the mobile app instead of the stubbed URL.
- **Testing**: given the time box, I prioritized the concurrency-critical
  path (registration) and lifecycle logic being written as pure, easily
  unit-testable functions/services, but did not write the actual test suite.
  `Competition.computeLifecycle()` and `registrationService` are the two
  places I'd start.
- **Admin/CMS**: competition content is currently only seedable via script;
  a real product would need an admin surface to create/edit competitions.

## Screen recording

Not included in this submission artifact — see the assignment's submission
requirements for what a full PR/repo would additionally need (GitHub repo,
env details, short demo recording).
