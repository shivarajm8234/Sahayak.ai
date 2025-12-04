# Sahayak.ai Architecture

## Overview
Sahayak.ai is a voice-first PWA designed to help low-literacy users access loan information.

## Components

### Client (React PWA)
- **Framework**: React, Vite, TypeScript
- **State**: Zustand
- **Voice**: LiveKit Client SDK
- **UI**: TailwindCSS, Lucide Icons
- **Routing**: React Router

### Backend (Firebase Cloud Functions)
- **Agent Orchestrator**: Manages LiveKit sessions, streams audio to Deepgram, sends text to Gemini, and TTS to Murf.
- **Eligibility Engine**: Python/Node.js logic to score users based on criteria.
- **Doc Verifier**: Triggered on Storage upload to verify documents.

### Data (Firestore)
- **Users**: Profile, language preference.
- **Schemes**: Scraped loan data.
- **Applications**: User loan applications.
- **Appointments**: Bank appointments.

### Scraper
- **Playwright**: Headless browser to scrape bank sites.
- **Scheduler**: Cloud Scheduler triggers the scraper periodically.

## Voice Pipeline
1. **Input**: User speaks (Client -> LiveKit).
2. **STT**: LiveKit Server -> Deepgram (Transcripts).
3. **Reasoning**: Transcripts -> Gemini 2.5 Flash (Intent + Response).
4. **TTS**: Response -> Murf (Audio).
5. **Output**: Audio -> LiveKit -> Client.
