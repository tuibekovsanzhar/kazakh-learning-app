# Kazakh Learn App — Project Memory

## Project overview
Mobile app for learning the Kazakh language interactively, similar to Duolingo but built specifically for Kazakh with AI-powered personalization.

**Target platforms:** iOS (App Store) + Android (Google Play Market)
**Goal:** Ship working MVP within 3 months
**Launch strategy:** Android first, then iOS

---

## About the developer
- **Name:** Sanzhar, startup founder based in Kazakhstan
- **Coding level:** Beginner — always explain what you do and why
- **Language:** English

---

## Tech stack
- React Native with Expo
- Firebase (authentication + database)
- Claude API (personalized exercises inside the app)
- Git + GitHub
- Editor: VS Code

---

## MVP features (in priority order)
- [ ] Project setup + folder structure ✅ DONE
- [ ] Home screen with progress overview
- [ ] Kazakh alphabet screen with pronunciations
- [ ] Vocabulary lessons by topic
- [ ] Flashcard system with spaced repetition
- [ ] Quiz / multiple choice exercises
- [ ] User progress tracking + streaks
- [ ] User authentication (Firebase)
- [ ] AI-powered personalized exercises (Claude API)

---

## Project folder structure
```
kazakh-learning-app/
├── CLAUDE.md                 ← this file
├── App.js                    ← entry point
├── app.json                  ← Expo config
├── package.json
├── app/
│   ├── index.jsx             ← Home screen
│   ├── lessons.jsx
│   ├── flashcards.jsx
│   └── progress.jsx
├── components/
│   ├── Button.jsx
│   ├── FlashCard.jsx
│   └── ProgressBar.jsx
├── data/
│   ├── alphabet.js
│   ├── vocabulary.js
│   └── lessons.js
├── assets/
│   ├── images/
│   ├── sounds/
│   └── fonts/
└── utils/
    ├── storage.js
    └── helpers.js
```

---

## Current project status

**Last updated:** March 15, 2026
**Current phase:** Building core screens

**Completed:**
- Project setup with Expo SDK 54 + React Native
- Git initialized and pushed to GitHub (github.com/tuibekovsanzhar/kazakh-learning-app)
- Home screen (dark theme, streak card, 3 lesson buttons)
- Kazakh Alphabet screen (4-column grid, 42 letters, Cyrillic + Latin)
- Letter modal popup (pronunciation, example word, meaning)
- Back button on Alphabet screen
- Navigation between Home → Alphabet working

**In progress:**
- Nothing currently

**To do next session:**
- Build Vocabulary lesson screen (Greetings first)
- Make Greetings and Numbers buttons on Home screen navigate somewhere
- Eventually: Flashcard system, Quiz, Progress tracking, Streaks

**Important file locations:**
- Real project: ~/Desktop/kazakh-learning-app
- Delete ~/Desktop/kazakh-learning-app-2 (no longer needed)
- Main screens live in app/ folder
- Alphabet data lives in data/alphabet.js

---

## Last session summary
Session 2 — March 15, 2026

### What we completed today
- Fixed home screen showing in Expo Go (was running wrong folder kazakh-learning-app-2)
- Moved home screen code from App.js → app/index.jsx (Expo Router structure)
- Built Kazakh Alphabet screen (app/alphabet.tsx)
  - 4-column grid, 42 letters, Cyrillic + Latin side by side
  - Tap any letter → modal popup with pronunciation, example word, meaning
- Created alphabet data file (data/alphabet.js) with all 42 letters
- Added back button to Alphabet screen
- Built Greetings screen (app/greetings.tsx)
  - List of 20 phrases, Kazakh + Latin + English
  - Tap any phrase → modal popup with "When to use" explanation
- Created greetings data file (data/greetings.js)
- Wired up navigation: Home → Alphabet, Home → Greetings

### Current file structure
- app/index.jsx — Home screen
- app/alphabet.tsx — Alphabet screen
- app/greetings.tsx — Greetings screen
- data/alphabet.js — 42 Kazakh letters with pronunciations
- data/greetings.js — 20 greeting phrases

### To do next session
1. Build Numbers lesson screen (same pattern as Greetings)
2. Wire up Numbers button on Home screen
3. Eventually: Flashcard system, Quiz, Progress tracking

### Important notes
- Always run `npx expo start` from ~/Desktop/kazakh-learning-app (NOT kazakh-learning-app-2)
- Delete ~/Desktop/kazakh-learning-app-2 — no longer needed
- Phone and Mac must be on same WiFi
- index.jsx uses useRouter from expo-router for navigation