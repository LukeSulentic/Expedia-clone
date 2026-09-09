# Expedia-Clone

A React + Redux travel booking web application supporting flight and hotel search, filtering, cart, booking, and an administrative panel. Phone-based (OTP) authentication is handled by Firebase; application data is served by a local `json-server` mock API.

This repository is maintained for **SE 3290 – Software Project Management (Fall 2026), Class Project A**. It is based on the open-source [kumkumdutta/Expedia-clone](https://github.com/kumkumdutta/Expedia-clone) project, originally built as "Chalo Ghume" by Kumkum Dutta, Ashish, Amit, Sagar Balsaraf, and Sarim. Our work covers redeployment, configuration, defect analysis, and documentation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Create React App) |
| State management | Redux, Redux Thunk |
| UI components | Chakra UI, Emotion, Framer Motion |
| Routing | React Router v6 |
| HTTP client | Axios |
| Authentication | Firebase Authentication (Phone / OTP) |
| Data layer | json-server (mock REST API over `db.json`) |

Note that Firebase is used **only** for authentication. All hotel, flight, cart, and user records are served by `json-server` from the `db.json` file at the project root. There is no production database.

---

## Prerequisites

- **Node.js 22 LTS.** Newer versions are not recommended — `react-scripts` 5.0.1 predates them and is no longer maintained. Verify with `node -v`.
- **Git**
- A **Google account** for creating a Firebase project

---

## Installation

### 1. Clone and install

```bash
git clone https://github.com/LukeSulentic/Expedia-clone.git
cd Expedia-clone
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is required. The project declares both `firebase` and a separate `@firebase/auth` package, which npm's default peer-dependency resolution rejects.

Deprecation warnings and a vulnerability count during install are expected for a project of this age. **Do not run `npm audit fix --force`** — it upgrades `react-scripts` and breaks the build.

### 2. Configure Firebase

1. Create a project at the [Firebase Console](https://console.firebase.google.com/). Google Analytics can be disabled.
2. Register a web app (the `</>` icon) and copy the generated `firebaseConfig` object.
3. Paste those values into `src/01_firebase/config_firebase.js`, replacing the existing configuration.
4. Go to **Authentication → Sign-in method**, enable the **Phone** provider, and save.
5. On the same screen, expand **Phone numbers for testing** and add a test number — for example `+91 9999999999` with code `123456`. This allows sign-in without sending a real SMS.
6. **Go to Authentication → Settings → SMS region policy and allow India (+91).** New Firebase projects restrict SMS by region to limit toll fraud. Without this, every authentication request fails with a 400 response (`OPERATION_NOT_ALLOWED: SMS unable to be sent until this region enabled by the app developer`), and the UI gives no indication of why — the sign-in button simply remains on "Please wait…" indefinitely.

The `+91` country code is hardcoded in `src/Pages/Login.jsx` and `src/Pages/Register.jsx`, which is why the region policy must permit India rather than your own country.

### 3. Run the application

The application requires **two processes running simultaneously**, so use two terminals.

Terminal 1 — mock API on port 8080:

```bash
npm run server
```

Terminal 2 — development server on port 3000:

```bash
npm start
```

Then open <http://localhost:3000>. Confirm the API is live by visiting <http://localhost:8080/hotel>, which should return JSON.

### 4. Create an account

Login requires a matching user record in `db.json`, which is checked *before* Firebase is contacted. New users must therefore **register first** at `/register`; attempting to log in with an unknown number redirects to the registration page.

Register with `9999999999` (ten digits, no country code) and enter `123456` as the OTP.

### 5. Production build

```bash
npm run build
```

Note that a deployed build will not function without a hosted replacement for `json-server`; see [Deployment](#deployment).

---

## Features and Current Status

| Feature | Status |
|---|---|
| Landing page | Working |
| Registration and login (Firebase OTP) | Working, after the configuration above |
| Flight search, sorting, filtering | Working for the routes seeded in `db.json` |
| Hotel search, sorting, filtering | Working for the localities seeded in `db.json` |
| Cart | Working |
| Booking | Working |
| Things to do | Working |
| Admin panel | Working, but see Known Issues |
| Cars | **Non-functional** — no `cars` resource exists in `db.json` |
| Holiday packages | **Non-functional** — no corresponding resource exists |
| Trains | **Non-functional** — no corresponding resource exists |

### Data that produces results

The dataset is small, so most searches return nothing. These values are known to work:

- **Flights:** `DELHI` → `MUMBAI`, `DELHI` → `BANGLURU`, `DELHI` → `PUNE`, `MUMBAI` → `BANGLURU`. No other routes exist. Note the non-standard spelling of `BANGLURU`.
- **Hotels:** the `place` field stores a *locality*, not a city — for example `Paharganj`, `Mahipalpur`, `Calangute`, `Candolim`, `Koramangala`. The dataset covers Bangalore, Delhi, and Goa.
- **Things to do:** `kolkata`, `delhi`, `rajasthan`.

### Admin panel

Reachable at `/admin`, with sub-routes at `/admin/adminflight`, `/admin/adminstay`, `/admin/products`, and `/admin/hotels`. A link is also present on the login page.

---

## Known Issues

These were identified during our assessment of the codebase and are documented rather than fixed.

**Security**

- Admin routes have no access control. Any unauthenticated visitor who navigates to `/admin` gains full access to bookings, listings, and user records.
- The `/users` endpoint exposes all user records, including passwords, without authentication.
- Passwords are stored in plaintext in `db.json`. The values in this repository have been replaced with placeholders; the upstream repository still contains what appear to be the original developers' real credentials.

**Reliability**

- `signInWithPhoneNumber` has an empty `.catch` block in both `Login.jsx` and `Register.jsx`. Authentication failures are silently discarded, leaving the button stuck on "Please wait…" with no error shown. Diagnosing any auth problem requires reading the network response in browser developer tools.
- The redirect after a failed login uses `setInterval` rather than `setTimeout`, so it fires repeatedly instead of once.

**Portability and data quality**

- The `+91` country code is hardcoded, so the application only accepts Indian phone numbers.
- The API base URL `http://localhost:8080` is hardcoded in 13 locations under `src/`, which blocks deployment without modification.
- Components manipulate the DOM directly via `document.querySelector` rather than through React state.
- Flight records are inconsistently cased (`dELHI` appears alongside `DELHI`), which breaks case-sensitive comparison.
- Hotel records contain leftover CSS class names as JSON keys (`pc__html 5`, `font16`, `latoBold 14`), and many images point at placeholder assets.
- The seed data was scraped from **MakeMyTrip**, not Expedia — all image URLs resolve to `mmtcdn.com` and all prices are in Indian rupees.

---

## Deployment

**Local deployment** is described under [Installation](#installation) and is the supported path.

Cloud deployment requires additional work beyond hosting the frontend. Because `json-server` runs locally and its address is hardcoded in 13 files, a deployed build will render but every search, booking, and admin view will fail. Deploying to a platform such as Vercel therefore also requires one of:

1. Hosting `json-server` separately and replacing the hardcoded URLs with an environment variable, or
2. Migrating `db.json` into Firebase Realtime Database and rewriting the Axios calls.

Any deployed domain must also be added under **Firebase → Authentication → Settings → Authorized domains**, or OTP will fail in production.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Credits

Original application by Kumkum Dutta (team lead), Ashish, Amit, Sagar Balsaraf, and Sarim: <https://github.com/kumkumdutta/Expedia-clone>.

Maintained for SE 3290 by Luke Sulentic, Tyler Moss, and Kasson Plummer.
