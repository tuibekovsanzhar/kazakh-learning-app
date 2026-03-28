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
│   ├── index.jsx             ← Home screen (streak, lesson buttons, sign out)
│   ├── alphabet.tsx          ← Alphabet screen (42 letters, modal, 🔊 audio)
│   ├── greetings.tsx         ← Greetings vocabulary (20 phrases, modal)
│   ├── numbers.tsx           ← Numbers vocabulary (0–1000, modal)
│   ├── colors.tsx            ← Colors vocabulary (15 colors, swatches, modal)
│   ├── flashcards.tsx        ← Flashcard practice (flip animation, mastery, Firestore)
│   ├── quiz.tsx              ← Multiple-choice quiz (10 questions, scoring, Firestore)
│   ├── family.tsx            ← Family vocabulary (19 words, modal)
│   ├── food.tsx              ← Food vocabulary (modal)
│   ├── animals.tsx           ← Animals vocabulary (modal)
│   ├── progress.tsx          ← Progress screen (tab bar, stats, deck bars, quiz scores)
│   ├── ai-exercises.tsx      ← AI exercises screen (Coming Soon; Claude API ready)
│   ├── login.tsx             ← Login screen (Firebase Auth)
│   ├── signup.tsx            ← Signup screen (Firebase Auth)
│   └── _layout.tsx           ← Root layout (auth gate, onAuthStateChanged)
├── data/
│   ├── alphabet.js           ← 42 Kazakh letters (with noSound, note fields)
│   ├── greetings.js          ← 20 greeting phrases
│   ├── numbers.js            ← 21 numbers
│   ├── colors.js             ← 15 colors with hex codes
│   ├── family.js             ← 19 family words
│   ├── food.js               ← food words
│   └── animals.js            ← animal words
├── assets/
│   ├── sounds/               ← letter_01.mp3 … letter_42.mp3 (all 42 letters)
│   ├── icon.png
│   ├── splash-icon.png
│   ├── android-icon-foreground.png
│   ├── android-icon-background.png
│   ├── android-icon-monochrome.png
│   └── favicon.png
└── utils/
    ├── storage.js            ← AsyncStorage helpers (progress, scores, streak)
    ├── firebase.js           ← Firebase app init + auth export
    ├── firestore.js          ← Firestore helpers (saveProgress, loadProgress)
    ├── audio.js              ← expo-av playSound(filename) helper
    ├── useToast.tsx          ← Animated toast hook (used by login + signup)
    └── i18n.js               ← Translations (EN/RU), LanguageProvider, useLanguage hook
```

---

## Current project status

**Last updated:** March 28, 2026 (Session 13)
**Current phase:** Google Play submission ready — EAS build next step

**Completed:**
- Project setup with Expo SDK 54 + React Native
- Git + GitHub (github.com/tuibekovsanzhar/kazakh-learning-app)
- Home screen (dark theme, live streak counter, scrollable lesson buttons)
- Kazakh Alphabet screen (4-column grid, 42 letters, Cyrillic + Latin, modal popup, 🔊 audio)
- Greetings screen (20 phrases, Kazakh + Latin + English, modal with "When to use")
- Numbers screen (21 numbers 0–1000, digit badge, modal)
- Colors screen (15 colors, circular swatches, modal with color-matched button)
- Flashcard screen (dynamic — all 6 decks, spring flip animation, mastery, Firestore sync)
- Quiz screen (dynamic — all 6 decks, 10 questions, instant feedback, Firestore sync)
- AsyncStorage persistence: flashcard mastery marks, quiz best scores, streak system
- README.md for GitHub
- Family, Food, Animals vocabulary screens with back button and modal
- Firebase Authentication: login screen, signup screen, auth gate in root layout
- Sign out button at bottom of home screen
- Firestore cloud sync: streak, flashcard mastery per deck, quiz best scores per deck
- Progress screen (tab bar, stats row, deck progress bars, quiz best scores)
- Flashcards + Quiz buttons inside each vocabulary screen; back button returns to correct screen
- Latin transliteration audit + 15 fixes across greetings.js, numbers.js, colors.js
- Alphabet audio pronunciation (42 letters, letter_01.mp3 … letter_42.mp3)
- Full design audit + theme consistency across all screens
- Russian/English language support with language picker (fully complete — all screens)
- Pre-launch app.json fixes (name, slug, scheme, package, all asset paths, splash colors)
- App icon + splash screen: icon.png (eagle, 1024×1024) and splash.png (vertical eagle + QAZAQ text)

**In progress:**
- Nothing currently

**To do next session:**
1. Run `eas login` (Expo account required)
2. Run `eas build --platform android --profile production` to generate AAB
3. Upload AAB to Google Play Console → create new release → submit for review

**Important file locations:**
- Project: ~/Desktop/kazakh-learning-app
- Main screens: app/
- Lesson data: data/
- Storage helpers: utils/storage.js

---

## Session history

### Session 14 — March 28, 2026
- Fixed data/food.js: "Іші" → "Ішу", "İshi" → "Ishu" (To drink verb was incorrect)
- Fixed all 6 vocabulary screens (greetings, numbers, colors, family, food, animals): word list rows now show `word.russian` in Russian mode instead of always showing English
- Fixed all 6 vocabulary screen modals: English translation display is now language-aware (`russian ?? english` fallback)
- Fixed hardcoded modal labels: "WHEN TO USE" → `t('whenToUse')` in greetings/family; "Note" → `t('note')` in food/animals — now translate to КОГДА ИСПОЛЬЗОВАТЬ / ЗАМЕТКА in Russian mode
- Added `russian?: string` field to local `WordItem`/`NumberItem`/`ColorItem` types in each screen

### Session 13 — March 28, 2026
- Fixed BUG 1 (all quiz sections showing Animals questions): Added `useEffect([deck, language])` to quiz.tsx that resets and rebuilds questions when deck param changes — tab screens persist in memory so the `useState` initializer alone was not enough
- Fixed BUG 2 (quiz answers and flashcard back showing English in Russian mode): Added `russian` field to all 6 data files (greetings, numbers, colors, family, food, animals); updated `buildQuiz()` to accept `lang` param and use `word.russian ?? word.english` when lang is 'ru'; updated flashcard back face to show `card.russian ?? card.english` in Russian mode
- `normalizeDeck()` in both quiz.tsx and flashcards.tsx now maps the `russian` field from all 6 data sources

### Session 12 — March 28, 2026
- Fixed flashcard header not translating "Flashcards" → "Карточки": `flashcards` key was missing from i18n.js; added to both EN + RU sections
- Fixed flashcard back card context labels (NOTE, WHEN TO USE, DIGIT) not translating: changed normalizeDeck() to store i18n keys ('note', 'whenToUse', 'digit') instead of hardcoded strings; render uses t(card.contextLabel)
- Added new i18n keys: `note` (NOTE / ЗАМЕТКА), `whenToUse` (WHEN TO USE / КОГДА ИСПОЛЬЗОВАТЬ), `digit` (DIGIT / ЦИФРА)
- Quiz header "Квиз" was already working — `quiz` key existed from previous session
- Verified all vocab screens pass translated title (t('animals'), t('food'), etc.) to flashcards/quiz params

### Session 11 — March 28, 2026
- Completed Russian translations for all 9 remaining screens: progress, flashcards, quiz, greetings, numbers, colors, family, food, animals
- Added 35 new translation keys to utils/i18n.js (both EN + RU): myProgress, mastered, bestQuiz, flashcardDecks, quizBestScoresTitle, noQuizScores, deckComplete, of, cardsMastered, notMarked, iKnowThisLabel, previous, finish, nextArrow, cards, quiz, whatDoesThisMean, quizComplete, perfectScoreMsg, greatJobMsg, keepGoingMsg, personalBest, yourScore, words, takeQuiz, phrases, tapAnyToLearn, tapAnyToLearnMore
- progress.tsx: DECKS array now uses translation keys instead of hardcoded labels; all stat labels, section titles, deck names, quiz row labels translated
- flashcards.tsx: summary screen (Deck Complete, card counts, Practice Again, Back), progress label, mastery buttons, nav buttons (Previous/Next/Finish), header all translated
- quiz.tsx: header, prompt, results screen (Quiz Complete, score messages, Personal best, Try Again, Back) all translated
- greetings.tsx: header title, subtitle ("X phrases • tap any to learn"), Got it button translated
- numbers/colors.tsx: header, subtitle, Flashcards/Take Quiz buttons, Got it button translated; t('numbers')/t('colors') passed as title param to flashcards/quiz
- family/food/animals.tsx: title, word count subtitle, Flashcards/Take Quiz buttons, Got it button translated; translated title passed to flashcards/quiz params
- All vocabulary screens now pass translated deck title to flashcards/quiz so header shows correct language there too
- Russian is now fully supported across the entire app

### Session 10 — March 24, 2026
- Privacy policy screen (app/privacy-policy.tsx): 10 sections covering data collection, Firebase, no data sales, contact email
- Privacy policy accessible without login (auth guard updated in _layout.tsx)
- "By continuing you agree to our Privacy Policy" link added to login + signup screens
- app.json final release config: name → "Qazaq Tili", slug → "qazaq-tili", scheme → "qazaqtili", package → "com.qazaqapps.qazaqtili", versionCode: 1
- eas.json created: development/preview/production build profiles; production builds app-bundle (.aab)
- EAS CLI 18.4.0 installed globally

### Session 9 — March 24, 2026
- Added app icon and splash screen:
  - icon.png (eagle, 1024×1024) → used for home screen icon + adaptive icon foreground
  - splash.png (vertical eagle + QAZAQ text) → used as splash screen image
  - app.json: adaptiveIcon.foregroundImage → icon.png, backgroundColor → #0f0f1a
  - app.json: expo-splash-screen plugin image → splash.png (removed imageWidth: 200)
  - Removed separate android-icon-foreground/background/monochrome from adaptiveIcon
- Toast notification system + improved auth error handling:
  - Created utils/useToast.tsx — shared hook, Animated slide-in from top, auto-dismiss 3s, purple border
  - signup.tsx: removed red errorText box, replaced with toasts; 4 specific messages (empty fields, short password, mismatch, email-in-use)
  - login.tsx: same — 5 specific messages per Firebase error code; forgot-password modal keeps inline errors
  - Both screens: field label "Password" → "Create Password" on signup
- Home screen gradients + visual energy:
  - Screen background: LinearGradient #0f0f1a → #130f2a (subtle depth)
  - Streak card: LinearGradient #1a1a3e → #2d1b69, purple glowing border #a78bfa
  - Lesson buttons: LinearGradient #1a1a2e → #16213e, left accent border #a78bfa, emoji pill #2d1b69
  - Subtitle color: #a0a0c0 → #a78bfa; arrows: #e94560 → #a78bfa
  - Tab bar top border: #0f3460 → #a78bfa (_layout.tsx)
  - Removed leftover console.log from streak sync effect

### Session 8 — March 22, 2026
- Design audit fixes (all 8 items):
  - alphabet.tsx + greetings.tsx: updated to current theme (#0f0f1a bg, #1a1a2e cards, #2a2a4a borders, #a78bfa accent replacing all #e94560 red)
  - alphabet.tsx + greetings.tsx: replaced absolute-positioned white ← back button with standard purple "← Back" row layout
  - numbers.tsx + colors.tsx: added borderWidth: 1, borderColor: '#2a2a4a' to list rows
  - progress.tsx: empty state text color #555 → #94a3b8
  - index.jsx: "Log out" button removed from top-right, replaced with subtle "Sign out" at bottom of ScrollView
  - index.jsx: streak number color #e94560 → #a78bfa
  - flashcards.tsx + quiz.tsx: header now shows deck title ("Greetings Flashcards", "Numbers Quiz")
  - ai-exercises.tsx: added Platform import + marginTop for Android status bar
- Pre-launch app.json fixes:
  - name: "kazakh-learning-app-2" → "Kazakh Learn"
  - slug: "kazakh-learning-app-2" → "kazakh-learn"
  - scheme: "kazakhlearningapp2" → "kazakhlearn"
  - Added android.package: "com.sanzhar.kazakhlearn"
  - Fixed all 6 asset paths (were pointing to empty assets/images/ — moved to assets/ root)
  - Splash backgroundColor: "#ffffff" → "#0f0f1a" (both light + dark)
- utils/firestore.js: removed console.log from saveProgress() (not suitable for production)

### Session 7 — March 22, 2026
- Design & UX audit report (no code changes — see report in session notes)
- Added `AI_ENABLED = false` constant to app/ai-exercises.tsx; shows "Coming Soon" screen when false
- Created utils/audio.js with `playSound(filename)` using expo-av; silent no-op if file missing
- Added 🔊 speaker button to each letter card in app/alphabet.tsx (calls letter_01.mp3 … letter_42.mp3)
- Added 🔊 button to alphabet modal (PRONUNCIATION section)
- Redesigned alphabet modal: letter hero → pronunciation + 🔊 → divider → example word
- Added noSound field to Ъ and Ь in alphabet.js; modal shows info box for those letters
- Added note field display to alphabet modal (italic gray, shown only when note exists)
- Fixed alphabet data: Һ pronunciation → "he", example → айдаһар / aydahar / dragon
- Fixed alphabet data: М example → маусым / mausym / June
- Fixed alphabet data: І pronunciation → "ih"
- Fixed alphabet data: Ё example → актёр / aktyor / actor; added note field (borrowed words only)
- Fixed alphabet data: Ь example → альбом / al'bom / album
- Activated full SOUNDS map in utils/audio.js after all 42 mp3 files were added

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
- Fixed TypeScript errors in family.tsx, food.tsx, animals.tsx
- Created .vscode/settings.json — disabled cSpell spell checker for the project
- Set up Firebase Authentication
  - Created utils/firebase.js — initializes Firebase app, exports `auth`
  - Created app/login.tsx — email + password login, error handling, link to signup
  - Created app/signup.tsx — email + password + confirm, validation, link to login
- Created app/_layout.tsx — Expo Router root layout with auth gate

### Session 3 — March 17, 2026
- Built Numbers screen, Colors screen, Flashcard screen, Quiz screen
- Added full AsyncStorage persistence (utils/storage.js)
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

## UX Rules

- **Form validation errors** always appear inline below the relevant field in `#f87171` red, never as toasts. Toasts are only for system/success messages (network failures, password reset confirmation).
- Each field has its own error state; typing in a field clears that field's error automatically.
- "Please fill in all required fields" appears centered below the submit button as `generalError`.
- **All new UI strings must be added to `utils/i18n.js` in both English and Russian** before being used in any screen.

---

## Internationalization (i18n) Rules

### How the language system works
- All UI strings live in `utils/i18n.js` in both `en` and `ru` sections
- Use the `t('key')` function from `useLanguage()` hook for ALL UI text
- Never hardcode English strings directly in screen files
- User's language choice is saved to AsyncStorage and persists

### Rules for adding new features
Every time a new screen or feature is added:
1. Add ALL new UI strings to `utils/i18n.js` first — both English AND Russian
2. Use `t('key')` in the screen file, never hardcode text
3. Test both languages before committing

### Russian translation standards
- Formal "вы" style (not "ты") for all user-facing text
- "Назад" for back buttons (not "Вернуться")
- "Далее" for next buttons (not "Следующий")
- "Понятно" for "Got it" buttons
- "Квиз" for Quiz (not "Тест" or "Викторина")
- "Карточки" for Flashcards (not "Флэшкарды")
- "ЗАМЕТКА" for NOTE label on flashcard back

### Latin transliteration rules
These apply to ALL new vocabulary added to data files:
- **Ж → J** (not Zh). Examples: Jeti, Jiyrma, Jasyl
- **Ғ → ġ** (g with dot above, not ğ). Examples: Toġyz, Qyzġylt
- **Ө → Ö**. Examples: Öte, Nöl, Tört
- **Ү → Ü**. Examples: Üsh, Jüz, Tüye
- **Сау → Sau** (not Saw — "saw" reads as an English word). Examples: Sau bol, Sau bolıńyz
- Always verify latin fields don't accidentally spell offensive or jarring English words

### Vocabulary content language
- Kazakh words (Cyrillic) → always stay as Kazakh
- Latin transliterations → always stay as Latin/Kazakh
- English translations of vocabulary (Cat, Dog, etc.) → stay in English in BOTH language modes (these are what users are learning, not UI text)
- Only UI chrome (buttons, labels, titles) gets translated

### Files to update when adding new vocabulary screens
1. Create `data/newscreen.js` with kazakh/latin/english fields
2. Create `app/newscreen.tsx` using `t()` for all UI strings
3. Add screen button to `app/index.jsx` with `t()` translation
4. Add translation keys to `utils/i18n.js` (both en + ru)
5. Add deck to flashcards/quiz dynamic deck system
6. Commit with descriptive message

---

## Latin Transliteration Rules

These rules apply to ALL new vocabulary added to data files:

- **Ж → J** (not Zh). Examples: Jeti, Jiyrma, Jasyl
- **Ғ → ġ** (g with dot above, not ğ). Examples: Toġyz, Qyzġylt
- **Ө → Ö**. Examples: Öte, Nöl, Tört
- **Ү → Ü**. Examples: Üsh, Jüz, Tüye
- **Сау → Sau** (not Saw — "saw" reads as an English word). Examples: Sau bol, Sau bolıńyz
- Always verify latin fields don't accidentally spell offensive or jarring English words
