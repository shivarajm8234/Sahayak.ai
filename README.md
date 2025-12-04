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
