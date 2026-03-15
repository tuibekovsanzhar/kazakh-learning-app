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
**Last updated:** March 2026
**Current phase:** Setup complete — building Home screen next

**Completed:**
- Expo project initialized
- Full folder structure created
- CLAUDE.md created
- Git initialized + connected to GitHub

**To do next session:**
- Build Home screen (app/index.jsx)
- Connect screens with navigation
- Start Alphabet screen

---

## Last session summary
Session 1 — March 15, 2026

### What we completed today
- Created Expo project with `npx create-expo-app@latest`
- Set up full folder structure (app/, components/, data/, utils/, assets/)
- Created CLAUDE.md project memory file
- Initialized Git and pushed to GitHub at github.com/tuibekovsanzhar/kazakh-learning-app
- Wrote Home screen code in App.js (dark theme, streak card, lesson buttons)
- Got app running on iPhone via Expo Go ✅

### Key problem we solved
Original project was SDK 53, Expo Go on phone was SDK 54/55 — incompatible.
Fixed by copying package.json from a fresh `npx create-expo-app@latest` project.
kazakh-learning-app-2 on Desktop is a working temp project — can be deleted once real project is confirmed working.

### Current status
- Real project: ~/Desktop/kazakh-learning-app
- Temp working project: ~/Desktop/kazakh-learning-app-2
- App.js has full home screen code written and ready
- npm install may need to be re-run in real project after clean reset

### To do next session
1. Confirm real project (kazakh-learning-app) runs on phone via Expo Go
2. If still broken — copy files from kazakh-learning-app-2 and use that as real project
3. Delete kazakh-learning-app-2 once real project works
4. Push working home screen to GitHub
5. Start building the Kazakh Alphabet screen

### Important notes
- Always run `npx expo start` from ~/Desktop/kazakh-learning-app
- Phone and Mac must be on same WiFi to scan QR code
- Use iPhone Camera app to scan QR code — opens Expo Go automatically
- SDK version must match between project and Expo Go app