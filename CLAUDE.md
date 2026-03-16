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
- [x] Project setup + folder structure ✅ DONE
- [x] Home screen with progress overview ✅ DONE
- [x] Kazakh alphabet screen with pronunciations ✅ DONE
- [x] Vocabulary lessons by topic ✅ DONE (Greetings, Numbers, Colors)
- [x] Flashcard system ✅ DONE
- [x] Quiz / multiple choice exercises ✅ DONE
- [x] User progress tracking + streaks ✅ DONE (AsyncStorage persistence)
- [ ] User authentication (Firebase)
- [ ] AI-powered personalized exercises (Claude API)

---

## Project folder structure
```
kazakh-learning-app/
├── CLAUDE.md                 ← this file
├── README.md                 ← GitHub readme
├── App.js                    ← entry point
├── app.json                  ← Expo config
├── package.json
├── app/
│   ├── index.jsx             ← Home screen (streak, lesson buttons)
│   ├── alphabet.tsx          ← Alphabet screen (42 letters, modal)
│   ├── greetings.tsx         ← Greetings vocabulary (20 phrases, modal)
│   ├── numbers.tsx           ← Numbers vocabulary (0–1000, modal)
│   ├── colors.tsx            ← Colors vocabulary (15 colors, swatches, modal)
│   ├── flashcards.tsx        ← Flashcard practice (flip animation, mastery)
│   └── quiz.tsx              ← Multiple-choice quiz (10 questions, scoring)
├── data/
│   ├── alphabet.js           ← 42 Kazakh letters
│   ├── greetings.js          ← 20 greeting phrases
│   ├── numbers.js            ← 21 numbers
│   └── colors.js             ← 15 colors with hex codes
├── assets/
│   ├── images/
│   ├── sounds/
│   └── fonts/
└── utils/
    ├── storage.js            ← AsyncStorage helpers (progress, scores, streak)
    └── helpers.js
```

---

## Current project status

**Last updated:** March 17, 2026
**Current phase:** MVP feature-complete — polish + Firebase next

**Completed:**
- Project setup with Expo SDK 54 + React Native
- Git + GitHub (github.com/tuibekovsanzhar/kazakh-learning-app)
- Home screen (dark theme, live streak counter, scrollable lesson buttons)
- Kazakh Alphabet screen (4-column grid, 42 letters, Cyrillic + Latin, modal popup)
- Greetings screen (20 phrases, Kazakh + Latin + English, modal with "When to use")
- Numbers screen (21 numbers 0–1000, digit badge, modal)
- Colors screen (15 colors, circular swatches, modal with color-matched button)
- Flashcard screen (spring flip animation, "I know this" / "Still learning", progress bar, summary)
- Quiz screen (10 random questions, 4 choices, instant feedback, results + personal best)
- AsyncStorage persistence: flashcard mastery marks, quiz best scores, streak system
- README.md for GitHub

**In progress:**
- Nothing currently

**To do next session:**
- More vocabulary decks (Family, Food, Animals)
- Firebase authentication (sign up / log in)
- Cloud sync of progress

**Important file locations:**
- Project: ~/Desktop/kazakh-learning-app
- Main screens: app/
- Lesson data: data/
- Storage helpers: utils/storage.js

---

## Session history

### Session 4 — March 17, 2026
- Built Quiz screen (app/quiz.tsx)
  - 10 random questions per session drawn from greetings deck
  - 4 multiple-choice answers (1 correct + 3 random wrong), shuffled each time
  - Instant green/red feedback on tap; auto-advances after 1.5 s
  - Results screen with score, emoji rating, score bar, "Try Again"
  - Personal best shown on quiz screen and results screen
- Added AsyncStorage persistence via utils/storage.js
  - `saveFlashcardProgress` / `loadFlashcardProgress` — persists "I know this" / "Still learning" marks per deck
  - `saveQuizScore` / `loadQuizScores` — saves last score and best score per deck
  - `loadStreak` / `updateStreak` — streak increments on consecutive days, resets on a gap
  - Streak on home screen now reads from storage (was hardcoded 0)
  - Flashcard mastery marks survive app restarts; progress bar loads correctly
- Fixed two bugs on previous screens:
  - Home screen lesson buttons were cut off → wrapped in ScrollView
  - Flashcard flip was one-way → tap flipped card again to flip back
- Created README.md for the GitHub repository

### Session 3 — March 17, 2026
- Built Colors screen (app/colors.tsx) with circular swatches and color-matched modal button
- Built Numbers screen (app/numbers.tsx) with digit badge and modal
- Built Flashcard screen (app/flashcards.tsx) with spring flip animation,
  mastery buttons, progress bar, and session summary screen
- Added Colors, Numbers, Flashcards buttons to Home screen

### Session 2 — March 15, 2026
- Built Kazakh Alphabet screen (app/alphabet.tsx) — 42 letters, 4-column grid, modal
- Built Greetings screen (app/greetings.tsx) — 20 phrases, modal with "When to use"
- Wired up navigation: Home → Alphabet, Home → Greetings

### Important notes
- Always run `npx expo start` from ~/Desktop/kazakh-learning-app
- Phone and Mac must be on same WiFi to use Expo Go
- All screens follow the same dark theme: background #0f0f1a or #1a1a2e, accent #a78bfa