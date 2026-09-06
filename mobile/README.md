# InventoryHub - React Native Android Mobile Application

A mobile application for Android devices connected to the MERN Inventory System API on Render (`https://inventory-wh75.onrender.com/api`).

---

## 📱 Features Included

- 🔑 **Authentication & Credentials Auto-Fill**:
  - Sign in as `admin` (`admin123`) or `worker` (`worker123`).
  - Quick Demo fill buttons (**Fill Admin** / **Fill Worker**).
- 📊 **Mobile Dashboard**:
  - Today, Weekly, Monthly Sales Cards (`₹`).
  - Total Stock Valuation (`₹`).
  - Stock Quantity Descending Ranking List.
- 📦 **Item Master Screen**:
  - Real-time search bar (Item Name & SKU).
  - Filter chips (`All`, `In Stock`, `Low Stock`, `Out of Stock`).
  - Quick action buttons (Sell, Add, Edit, Delete).
- 🛒 **Native Quick Modals**:
  - Clickable item search list for **Sell Stock** and **Add Stock** with custom prices.
- 📑 **Transactions Log**:
  - Filterable history list of Sell & Add transactions for the last 30 days.

---

## 🚀 How to Run the App

### Option 1: Run with Expo Go on your Physical Android Phone
1. Install **Expo Go** app from Google Play Store on your Android phone.
2. In your terminal, run:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. Scan the QR code shown in your terminal using the **Expo Go** app on your phone!

### Option 2: Run on Android Studio Emulator
1. Start your Android Emulator in Android Studio.
2. In your terminal, run:
   ```bash
   cd mobile
   npm install
   npm run android
   ```

---

## 📦 How to Build Standalone Android APK File (.apk)

To build an installable `.apk` file for Android:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to Expo:
   ```bash
   eas login
   ```
3. Build the APK preview:
   ```bash
   cd mobile
   eas build -p android --profile preview
   ```
4. Once completed, download the `.apk` link provided by EAS and install it directly on any Android phone!
