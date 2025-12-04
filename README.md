# Sahayak.ai

Voice-Primary Multilingual Loan Advisor (Educational + Agriculture first).

## Project Structure

- `client/`: React PWA (Vite + TypeScript)
- `functions/`: Firebase Cloud Functions (Node.js)
- `scraper/`: Loan scheme scraper (Node.js + Playwright)
- `shared/`: Shared TypeScript types

## Setup

### Prerequisites
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Java (for Firebase Emulators)

### Installation

1. **Install Dependencies**
   ```bash
   # Root (if any)
   
   # Client
   cd client
   npm install
   
   # Functions
   cd ../functions
   npm install
   
   # Scraper
   cd ../scraper
   npm install
   ```

2. **Environment Variables**
   Create `.env` files in `functions/` and `client/` with necessary API keys (Deepgram, Murf, Gemini, LiveKit).

### Running Locally

1. **Start Firebase Emulators**
   ```bash
   firebase emulators:start
   ```

2. **Start Client**
   ```bash
   cd client
   npm run dev
   ```

3. **Run Scraper**
   ```bash
   cd scraper
   npm start
   ```

## Features
- Voice-first interface
- Multilingual support (English, Hindi, Kannada, etc.)
- Real-time loan eligibility check
- Document verification stub

## Android Setup & Debugging

### 1. Register App in Firebase Console
- **Package Name**: `com.sahayak.ai` (This is the default ID set in `capacitor.config.ts`)
- **App Nickname**: Sahayak.ai (Optional)
- **SHA-1**: Required for Google Sign-In (Run `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android` to get it)

### 2. Add Configuration File
- Download `google-services.json` from Firebase Console.
- Place it in: `client/android/app/google-services.json`

### 3. Add Firebase SDK
Modify `client/android/app/build.gradle` (NOT the root build.gradle):
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation platform('com.google.firebase:firebase-bom:33.1.0')
    // Add other Firebase dependencies as needed
}
```

Modify `client/android/build.gradle` (Root level):
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.2'
    }
}
```

### 4. Build & Debug (ADB)

**Prerequisites**:
- Enable **USB Debugging** on your Android phone (Settings > Developer Options).
- Connect phone via USB.

**Steps**:
1. **Sync Project**:
   ```bash
   cd client
   npx cap sync
   ```

2. **Open in Android Studio** (Optional but recommended for first run):
   ```bash
   npx cap open android
   ```

3. **Run on Device via Command Line**:
   ```bash
   npx cap run android --target <device-id>
   ```
   *Run `adb devices` to see your device ID.*

4. **Build APK**:
   - Open Android Studio (`npx cap open android`).
   - Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - The APK will be generated in `client/android/app/build/outputs/apk/debug/app-debug.apk`.

5. **Install APK via ADB**:
   ```bash
   adb install client/android/app/build/outputs/apk/debug/app-debug.apk
   ```
