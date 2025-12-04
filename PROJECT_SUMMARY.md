# Sahayak.ai - Project Summary

## Problem Statement
Accessing formal credit in India is challenging for millions due to low financial literacy, language barriers, and complex documentation processes. Existing digital solutions are often text-heavy, English-centric, and intimidating. **Sahayak.ai** bridges this gap by providing a **multilingual, voice-first AI loan advisor** that guides users through loan discovery, eligibility checks, and application processes in their native language, acting as a helpful human-like assistant ("Sahayak").

## GitHub Repository URL
https://github.com/shivarajm8234/Sahayak.ai

## Key Features of Your Solution
*   **Voice-First Interface**: Complete hands-free navigation and interaction using natural speech.
*   **Multilingual Support**: Real-time translation and interaction in **English, Hindi, Kannada, Tamil, Telugu, and Bengali**.
*   **"VaaniLoan" AI Agent**: An empathetic, context-aware AI agent (powered by Gemini) that simplifies financial jargon and guides users step-by-step.
*   **Simplified Onboarding**: Phone/Email login and intuitive language selection with TTS previews.
*   **Smart Eligibility Check**: personalized loan recommendations based on user profile and voice inputs.
*   **Hyper-Local Context**: tailored loan schemes for education, agriculture, and personal needs relevant to the Indian context.

## Tech Stack You Are Using
*   **Frontend**: React (TypeScript), Vite, Tailwind CSS
*   **Mobile**: Capacitor (Android)
*   **Authentication**: Firebase Auth (Email, Phone)
*   **Database**: Firebase Firestore
*   **AI & Voice Pipeline**:
    *   **STT (Speech-to-Text)**: Deepgram (Nova-2 model)
    *   **LLM (Intelligence)**: Google Gemini 1.5 Flash
    *   **TTS (Text-to-Speech)**: Murf.ai
*   **State Management**: Zustand

## Target for the Next Checkpoint (5:00 AM)
*   **Refine Voice Agent Latency**: Optimize the STT -> LLM -> TTS pipeline for faster response times.
*   **Expand Loan Database**: Scrape and populate real loan schemes for Education and Agriculture sectors.
*   **Implement "Apply via Voice"**: Enable the agent to fill out a basic loan application form based on user's spoken answers.
*   **UI Polish**: Enhance the `VoiceOverlay` with dynamic animations and better error handling states.
