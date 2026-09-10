# InventoryHub - React Native (Expo) Mobile App

Android/iOS mobile client for the MERN Inventory System. Uses the live Render API:
`https://inventory-wh75.onrender.com/api`

---

## Features

- Login with Admin / Worker (quick-fill demo buttons)
- Dashboard: today / weekly / monthly sales + stock valuation
- Item Master: search, filters, sell / add / edit / delete
- Sell & Add Stock modals (pre-selects item from Item Master)
- Transactions log (last 30 days)

---

## Prerequisites

- Node.js 18+
- Phone: install **Expo Go** from the Play Store / App Store  
  **or** Android Studio emulator

> Note: Expo SDK 51 needs a matching Expo Go version. If the QR scan fails with a version mismatch, update Expo Go or use `npx expo start --tunnel`.

---

## How to run

### 1) Install dependencies (first time only)

```bash
cd mobile
npm install
```

### 2) Start Expo

From the project root:

```bash
npm run mobile
```

Or from the `mobile` folder:

```bash
npm start
```

Then:

1. Open **Expo Go** on your phone (same Wi‑Fi as your computer)
2. Scan the QR code from the terminal / browser
3. If the phone cannot reach your PC, use tunnel mode:

```bash
cd mobile
npm run tunnel
```

### 3) Android emulator (optional)

1. Start an Android emulator in Android Studio
2. Run:

```bash
cd mobile
npm run android
```

---

## Login credentials

| Role   | Username | Password   |
|--------|----------|------------|
| Admin  | `admin`  | `admin123` |
| Worker | `worker` | `worker123` |

First login after the backend has been idle may take 30–60 seconds (Render free tier cold start). Wait and retry if needed.

---

## Build a standalone Android APK (optional)

```bash
npm install -g eas-cli
eas login
cd mobile
eas build -p android --profile preview
```

(Requires an Expo account and `eas.json` profile setup.)
