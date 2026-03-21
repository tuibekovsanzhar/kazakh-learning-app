# Kazakh Learn App — Project Memory

## Project overview
Mobile app for learning the Kazakh language interactively, similar to Duolingo but built specifically for Kazakh with AI-powered personalization.

**Target platforms:** iOS (App Store) + Android (Google Play Market)
**Goal:** Ship working MVP within 2 months
**Launch strategy:** Android first, then iOS

---

## About the developer
- **Name:** Sanzhar, startup founder based in Kazakhstan
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
- [x] User authentication (Firebase) ✅ DONE (login + signup screens, auth gate)
- [x] Cloud sync of progress (Firestore) ✅ DONE
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
│   ├── quiz.tsx              ← Multiple-choice quiz (10 questions, scoring)
│   ├── family.tsx            ← Family vocabulary (19 words, modal)
│   ├── food.tsx              ← Food vocabulary (modal)
│   ├── animals.tsx           ← Animals vocabulary (modal)
│   ├── login.tsx             ← Login screen (Firebase Auth)
│   ├── signup.tsx            ← Signup screen (Firebase Auth)
│   └── _layout.tsx           ← Root layout (auth gate, onAuthStateChanged)
├── data/
│   ├── alphabet.js           ← 42 Kazakh letters
│   ├── greetings.js          ← 20 greeting phrases
│   ├── numbers.js            ← 21 numbers
│   ├── colors.js             ← 15 colors with hex codes
│   ├── family.js             ← 19 family words
│   ├── food.js               ← food words
│   └── animals.js            ← animal words
├── assets/
│   ├── images/
│   ├── sounds/
│   └── fonts/
└── utils/
    ├── storage.js            ← AsyncStorage helpers (progress, scores, streak)
    ├── firebase.js           ← Firebase app init + auth export
    └── helpers.js
```

---

## Current project status

**Last updated:** March 22, 2026
**Current phase:** MVP feature-complete — polish + AI next

**Completed:**
- Project setup with Expo SDK 54 + React Native
- Git + GitHub (github.com/tuibekovsanzhar/kazakh-learning-app)
- Home screen (dark theme, live streak counter, scrollable lesson buttons)
- Kazakh Alphabet screen (4-column grid, 42 letters, Cyrillic + Latin, modal popup)
- Greetings screen (20 phrases, Kazakh + Latin + English, modal with "When to use")
- Numbers screen (21 numbers 0–1000, digit badge, modal)
- Colors screen (15 colors, circular swatches, modal with color-matched button)
- Flashcard screen (dynamic — all 6 decks, spring flip animation, mastery, Firestore sync)
- Quiz screen (dynamic — all 6 decks, 10 questions, instant feedback, Firestore sync)
- AsyncStorage persistence: flashcard mastery marks, quiz best scores, streak system
- README.md for GitHub
- Family, Food, Animals vocabulary screens with back button and modal
- Firebase Authentication: login screen, signup screen, auth gate in root layout
- Logout button on home screen
- Firestore cloud sync: streak, flashcard mastery per deck, quiz best scores per deck
- Progress screen (tab bar, stats row, deck progress bars, quiz best scores)
- Flashcards + Quiz buttons inside each vocabulary screen; back button returns to correct screen
- Latin transliteration audit + 15 fixes across greetings.js, numbers.js, colors.js

**In progress:**
- Nothing currently

**To do next session:**
1. Submit app to Google Play Store (first launch!)

**Important file locations:**
- Project: ~/Desktop/kazakh-learning-app
- Main screens: app/
- Lesson data: data/
- Storage helpers: utils/storage.js

---

## Session history

### Session 7 — March 22, 2026
- Design & UX audit report (no code changes — see report in session notes)
- Added `AI_ENABLED = false` constant to app/ai-exercises.tsx; shows "Coming Soon" screen when false
- Created utils/audio.js with `playSound(filename)` using expo-av; silent no-op if file missing
- Added 🔊 speaker button to each letter card in app/alphabet.tsx (calls letter_01.mp3 … letter_42.mp3)
- Fixed alphabet data: Һ pronunciation → "he", example → айдаһар / aydahar / dragon
- Fixed alphabet data: М example → маусым / mausym / June
- Fixed alphabet data: І pronunciation → "e"
- Fixed alphabet data: Ё example → актёр / aktyor / actor; added note field (borrowed words only)
- Added note field display to alphabet modal (italic gray, shown only when note exists)
- Fixed alphabet data: Ь example → коньки / kon'ki / ice skates (previous session)

### Session 6 — March 20, 2026
- Fixed signup password reset bug (textContentType oneTimeCode → newPassword)
- Added Latin transliteration below Kazakh text on flashcard front face
- Applied Firestore security rules (no expiry, users can only access own data)
- Created app/ai-exercises.tsx — AI exercises screen with topic/level selectors and Claude API integration
- Added ✨ AI Exercises button to home screen
- Created .env file for API key (added to .gitignore)
- AI exercises screen is built and ready — needs $5 API credits added at console.anthropic.com to activate

### Session 5 — March 20, 2026
- Added logout button to home screen (signOut from firebase/auth)
- Set up Firestore database (europe-west3, Standard edition, test mode)
- Added Firestore cloud sync: streakCount, flashcard mastery per deck, quiz best scores per deck
- Built Progress screen (tab bar navigation, stats row, deck-by-deck progress bars, quiz best scores)
- Made flashcards dynamic — works for all 6 decks (greetings, numbers, colors, family, food, animals)
- Made quiz dynamic — works for all 6 decks
- Added Flashcards + Quiz buttons inside each vocabulary screen
- Removed standalone Flashcards/Quiz buttons from home screen
- Fixed Back button in flashcards/quiz to return to correct vocabulary screen
- Fixed latin transliteration: 15 entries fixed across greetings.js, numbers.js, colors.js
- Added latin transcription in brackets under Kazakh text in quiz questions
- Replaced "Correct answer" text with ✓/✗ icons on quiz answer buttons

### Session 4 — March 19, 2026
- Fixed home screen button styling (app/index.jsx)
  - Family, Food, Animals buttons were using missing style names (`lessonBtn`/`lessonBtnText`)
  - Corrected to `lessonButton`, `lessonEmoji`, `lessonText`, `lessonArrow` — matches all other buttons
- Edited data/family.js
  - Deleted last entry "Отбасым" (My family) — deck is now 19 words
  - Updated "Жиен": english → "Nephew / Niece (sister's children)", expanded note
- Added back button to app/family.tsx, app/food.tsx, app/animals.tsx
  - Added `useRouter` import and `router.back()` handler to all three
  - `← Back` button in purple above the title, `backBtn`/`backBtnText` styles added
- Fixed TypeScript errors in family.tsx, food.tsx, animals.tsx
  - `useState(null)` was typed as `null`-only, making all `selected?.kazakh` etc. red
  - Added `type WordItem = { kazakh: string; latin: string; english: string; note: string }`
  - Changed to `useState<WordItem | null>(null)` in all three files
- Created .vscode/settings.json — disabled cSpell spell checker for the project
- Set up Firebase Authentication
  - Ran `npx expo install firebase` (66 packages)
  - Created utils/firebase.js — initializes Firebase app, exports `auth`
  - Created app/login.tsx — email + password login, error handling, link to signup
  - Created app/signup.tsx — email + password + confirm, validation, link to login
  - Both screens use dark theme (#0f0f1a background, #a78bfa accent), spinner on submit
- Created app/_layout.tsx — Expo Router root layout with auth gate
  - `onAuthStateChanged` listener checks Firebase session on app start
  - Shows purple spinner on dark screen while checking (~200ms)
  - Redirects to /login if not logged in, to / if already logged in
  - Prevents redirect loops by checking current route with `useSegments`

### Session 3 — March 17, 2026
- Built Numbers screen (app/numbers.tsx)
  - 21 numbers from 0–1000, digit badge on each row, Cyrillic + Latin + English
  - Tap any row → modal popup
- Built Colors screen (app/colors.tsx)
  - 15 colors with circular color swatch per row
  - Modal shows a large color circle; "Got it" button tinted to match the color
- Built Flashcard screen (app/flashcards.tsx)
  - Spring-animated card flip (tap to reveal, tap again to flip back)
  - "I know this ✓" (green) and "Still learning" (amber) mastery buttons
  - Green progress bar fills as cards are mastered
  - Session summary screen at the end with counts and "Practice Again"
- Built Quiz screen (app/quiz.tsx)
  - 10 random questions per session from the Greetings deck
  - 4 multiple-choice answers (1 correct + 3 random wrong), shuffled each time
  - Instant green/red highlight feedback; auto-advances after 1.5 s
  - Results screen with big score display, emoji rating, score bar, "Try Again"
  - Personal best score shown below the progress bar and on the results screen
- Added full AsyncStorage persistence (utils/storage.js)
  - Flashcard mastery marks survive app restarts; progress bar restores on reopen
  - Quiz last score + best score saved per deck
  - Streak system: increments on consecutive days, resets after a gap
  - Home screen 🔥 streak counter now reads the real saved value
- Fixed bugs: home screen lesson list now scrollable; flashcard flip now two-way
- Added Numbers, Colors, Flashcards, and Quiz buttons to Home screen
- Created README.md for the GitHub repository

### Session 2 — March 15, 2026
- Built Kazakh Alphabet screen (app/alphabet.tsx) — 42 letters, 4-column grid, modal
- Built Greetings screen (app/greetings.tsx) — 20 phrases, modal with "When to use"
- Wired up navigation: Home → Alphabet, Home → Greetings

### Important notes
- Always run `npx expo start` from ~/Desktop/kazakh-learning-app
- Phone and Mac must be on same WiFi to use Expo Go
- All screens follow the same dark theme: background #0f0f1a or #1a1a2e, accent #a78bfa

---

## Latin Transliteration Rules

These rules apply to ALL new vocabulary added to data files:

- **Ж → J** (not Zh). Examples: Jeti, Jiyrma, Jasyl
- **Ғ → ġ** (g with dot above, not ğ). Examples: Toġyz, Qyzġylt
- **Ө → Ö**. Examples: Öte, Nöl, Tört
- **Ү → Ü**. Examples: Üsh, Jüz, Tüye
- **Сау → Sau** (not Saw — "saw" reads as an English word). Examples: Sau bol, Sau bolıńyz
- Always verify latin fields don't accidentally spell offensive or jarring English words