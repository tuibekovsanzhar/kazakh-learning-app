# Kazakh Learn

**An interactive mobile app for learning the Kazakh language** — built specifically for Kazakh with AI-powered personalization, inspired by the Duolingo experience.

> 🚧 **Status: Active development — MVP in progress**

---

## Overview

Kazakh Learn makes it easy to pick up the Kazakh language from scratch. The app covers the alphabet, everyday vocabulary, and common phrases, with interactive flashcards and quizzes to reinforce what you've learned. An AI-powered personalization layer (coming soon) adapts exercises to each learner's level.

Target platforms: **iOS** and **Android**

---

## Features

| Feature | Status |
|---|---|
| 🔤 Kazakh Alphabet (42 letters, Cyrillic + Latin) | ✅ Done |
| 👋 Vocabulary — Greetings (20 phrases) | ✅ Done |
| 🔢 Vocabulary — Numbers (0–1000) | ✅ Done |
| 🎨 Vocabulary — Colors (15 colors) | ✅ Done |
| 🃏 Flashcard system with mastery tracking | ✅ Done |
| 🧠 Quiz mode with multiple-choice questions | ✅ Done |
| 🔥 Streak system & progress persistence | ✅ Done |
| 👤 User authentication (Firebase) | 🔜 Planned |
| 🤖 AI-powered personalized exercises | 🔜 Planned |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 54) |
| Navigation | [Expo Router](https://expo.github.io/router/) (file-based) |
| Local storage | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) |
| Auth & database | [Firebase](https://firebase.google.com/) *(coming soon)* |
| AI personalization | [Claude API](https://www.anthropic.com/) by Anthropic *(coming soon)* |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Expo Go](https://expo.dev/go) app on your iOS or Android device
- Your phone and computer must be on the **same Wi-Fi network**

### Installation

```bash
# Clone the repository
git clone https://github.com/tuibekovsanzhar/kazakh-learning-app.git
cd kazakh-learning-app

# Install dependencies
npm install

# Start the development server
npx expo start
```

Scan the QR code with the Expo Go app to run it on your device.

---

## Project Structure

```
kazakh-learning-app/
├── app/                  # Screens (Expo Router file-based routing)
│   ├── index.jsx         # Home screen
│   ├── alphabet.tsx      # Kazakh alphabet (42 letters)
│   ├── greetings.tsx     # Greetings vocabulary
│   ├── numbers.tsx       # Numbers vocabulary
│   ├── colors.tsx        # Colors vocabulary
│   ├── flashcards.tsx    # Flashcard practice
│   └── quiz.tsx          # Multiple-choice quiz
├── data/                 # Lesson content
│   ├── alphabet.js
│   ├── greetings.js
│   ├── numbers.js
│   └── colors.js
├── utils/
│   └── storage.js        # AsyncStorage helpers (streak, scores, progress)
└── assets/               # Images, fonts, sounds
```

---

## Roadmap

- [ ] More vocabulary decks — Family, Food, Animals, Travel
- [ ] Flashcard spaced repetition algorithm
- [ ] Firebase authentication (sign up / log in)
- [ ] Cloud sync for progress across devices
- [ ] AI-powered exercises via Claude API
- [ ] Audio pronunciation for every word
- [ ] Android release (Google Play)
- [ ] iOS release (App Store)

---

## License

This project is currently private and not open for contributions. License TBD at public launch.
