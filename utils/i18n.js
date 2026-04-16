import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LANGUAGE_KEY = 'appLanguage';
export const HAS_CHOSEN_LANGUAGE_KEY = 'hasChosenLanguage';

// ─── Translations ──────────────────────────────────────────────────────────────

const translations = {
  en: {
    // ── App / Home ──────────────────────────────────────────────────────────
    appName:          'Qazaq Tili',
    appSubtitle:      'Қазақша үйрен',
    dayStreak:        'Day Streak',
    wordsMastered:    'words mastered',
    startLearning:    'Start Learning',
    home:             'Home',
    progress:         'Progress',
    signOut:          'Sign out',
    changeLanguage:   'Language',

    // ── Auth ────────────────────────────────────────────────────────────────
    welcomeBack:        'Welcome back',
    loginSubtitle:      'Log in to continue learning Kazakh',
    email:              'Email',
    password:           'Password',
    logIn:              'Log In',
    forgotPassword:     'Forgot password?',
    noAccount:          "Don't have an account?",
    signUpLink:         'Sign Up',
    createAccount:      'Create account',
    signupSubtitle:     'Start your Kazakh learning journey',
    createPassword:     'Create Password',
    confirmPassword:    'Confirm Password',
    createAccountBtn:   'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    logInLink:          'Log In',
    byContinuing:       'By continuing you agree to our',
    privacyPolicy:      'Privacy Policy',

    // Reset modal
    resetPassword:      'Reset Password',
    resetSubtitle:      "Enter your email and we'll send you a reset link.",
    sendResetLink:      'Send Reset Link',
    cancel:             'Cancel',
    resetSent:          'Password reset link sent to your email. Check your inbox.',
    done:               'Done',

    // ── Validation errors ───────────────────────────────────────────────────
    fillAllFields:            'Please fill in all required fields',
    passwordsNoMatch:         'Passwords do not match',
    passwordTooShort:         'Password must be at least 6 characters',
    emailAlreadyRegistered:   'This email is already registered. Try logging in.',
    noAccountFound:           'No account found with this email',
    incorrectPassword:        'Incorrect password',
    incorrectEmailOrPassword: 'Incorrect email or password',
    tooManyAttempts:          'Too many failed attempts. Please try again later',
    invalidEmail:             'Please enter a valid email address',
    signupFailed:             'Sign up failed. Please try again.',
    loginFailed:              'Login failed. Please try again.',

    // ── Lesson buttons ──────────────────────────────────────────────────────
    kazakhAlphabet: 'Kazakh Alphabet',
    greetings:      'Greetings',
    numbers:        'Numbers',
    colors:         'Colors',
    family:         'Family',
    food:           'Food',
    animals:        'Animals',
    aiExercises:    'AI Exercises',

    // ── Alphabet screen ─────────────────────────────────────────────────────
    lettersSubtitle:  '42 letters • tap any to learn',
    pronunciation:    'PRONUNCIATION',
    exampleWord:      'EXAMPLE WORD',
    gotIt:            'Got it',
    noSoundNotice:    'This letter has no standalone sound. Tap 🔊 to hear it in a word.',

    // ── Flashcards ──────────────────────────────────────────────────────────
    flashcards:    'Flashcards',
    iKnowThis:    'I know this ✓',
    stillLearning: 'Still learning',
    practiceAgain: 'Practice Again',
    note:          'NOTE',
    whenToUse:     'WHEN TO USE',
    digit:         'DIGIT',

    // ── Quiz ────────────────────────────────────────────────────────────────
    tryAgain: 'Try Again',
    next:     'Next',

    // ── Progress ────────────────────────────────────────────────────────────
    yourProgress: 'Your Progress',
    bestScore:    'Best Score',

    // ── AI / Coming Soon ────────────────────────────────────────────────────
    comingSoonTitle: 'Coming Soon',
    comingSoonText:  'AI-powered exercises are on the way.\nCheck back in the next update!',
    goBack:          '← Back',

    // ── Language picker ─────────────────────────────────────────────────────
    chooseLanguage:  'Choose your language',
    continueBtn:     'Continue',

    // ── Progress screen ──────────────────────────────────────────────────────
    myProgress:          'My Progress',
    mastered:            'Mastered',
    bestQuiz:            'Best Quiz',
    flashcardDecks:      'Flashcard Decks',
    quizBestScoresTitle: 'Quiz Best Scores',
    noQuizScores:        'Complete a quiz to see your scores here.',

    // ── Flashcards screen ────────────────────────────────────────────────────
    deckComplete:    'Deck Complete!',
    of:              'of',
    cardsMastered:   'cards mastered',
    notMarked:       'Not marked',
    iKnowThisLabel:  'I know this',
    previous:        '← Previous',
    finish:          'Finish →',
    nextArrow:       'Next →',
    cards:           'cards',

    // ── Quiz screen ──────────────────────────────────────────────────────────
    quiz:             'Quiz',
    whatDoesThisMean: 'What does this mean?',
    quizComplete:     'Quiz Complete!',
    perfectScoreMsg:  'Perfect score! Amazing!',
    greatJobMsg:      'Great job! Keep practicing.',
    keepGoingMsg:     "Keep going — you'll get there!",
    personalBest:     'Personal best:',
    yourScore:        'Your Score',

    // ── Vocabulary screens ───────────────────────────────────────────────────
    words:             'words',
    takeQuiz:          'Take Quiz',
    phrases:           'phrases',
    tapAnyToLearn:     'tap any to learn',
    tapAnyToLearnMore: 'Tap any to learn more',

    // ── Email verification ───────────────────────────────────────────────────
    verifyEmailTitle:        'Check your inbox',
    verifyEmailSubtitle:     'We sent a verification email to',
    verifyEmailInstructions: 'Click the link in the email to verify your account, then tap the button below.',
    iHaveVerified:           "I've verified my email ✓",
    resendEmail:             'Resend email',
    resendIn:                'Resend in',
    notVerifiedError:        'Not verified yet. Please click the link in your inbox first.',
    verificationSent:        'Verification email sent!',
    emailNotVerified:        'Please verify your email before logging in. Check your inbox.',
    useDifferentEmail:       'Use a different email',
    verificationCheckFailed: 'Could not check verification. Please try again.',
  },

  ru: {
    // ── App / Home ──────────────────────────────────────────────────────────
    appName:          'Qazaq Tili',
    appSubtitle:      'Қазақша үйрен',
    dayStreak:        'дней подряд',
    wordsMastered:    'слов изучено',
    startLearning:    'Начать обучение',
    home:             'Главная',
    progress:         'Прогресс',
    signOut:          'Выйти',
    changeLanguage:   'Язык',

    // ── Auth ────────────────────────────────────────────────────────────────
    welcomeBack:        'С возвращением',
    loginSubtitle:      'Войдите, чтобы продолжить',
    email:              'Эл. почта',
    password:           'Пароль',
    logIn:              'Войти',
    forgotPassword:     'Забыли пароль?',
    noAccount:          'Нет аккаунта?',
    signUpLink:         'Зарегистрироваться',
    createAccount:      'Создать аккаунт',
    signupSubtitle:     'Начните изучать казахский',
    createPassword:     'Придумайте пароль',
    confirmPassword:    'Подтвердите пароль',
    createAccountBtn:   'Создать аккаунт',
    alreadyHaveAccount: 'Уже есть аккаунт?',
    logInLink:          'Войти',
    byContinuing:       'Продолжая, вы соглашаетесь с',
    privacyPolicy:      'Политикой конфиденциальности',

    // Reset modal
    resetPassword:      'Сброс пароля',
    resetSubtitle:      'Введите email и мы отправим ссылку для сброса.',
    sendResetLink:      'Отправить ссылку',
    cancel:             'Отмена',
    resetSent:          'Ссылка для сброса пароля отправлена. Проверьте почту.',
    done:               'Готово',

    // ── Validation errors ───────────────────────────────────────────────────
    fillAllFields:            'Заполните все поля',
    passwordsNoMatch:         'Пароли не совпадают',
    passwordTooShort:         'Пароль минимум 6 символов',
    emailAlreadyRegistered:   'Этот email уже зарегистрирован',
    noAccountFound:           'Аккаунт с таким email не найден',
    incorrectPassword:        'Неверный пароль',
    incorrectEmailOrPassword: 'Неверный email или пароль',
    tooManyAttempts:          'Слишком много попыток. Попробуйте позже',
    invalidEmail:             'Введите корректный email',
    signupFailed:             'Ошибка регистрации. Попробуйте снова.',
    loginFailed:              'Ошибка входа. Попробуйте снова.',

    // ── Lesson buttons ──────────────────────────────────────────────────────
    kazakhAlphabet: 'Казахский алфавит',
    greetings:      'Приветствия',
    numbers:        'Числа',
    colors:         'Цвета',
    family:         'Семья',
    food:           'Еда',
    animals:        'Животные',
    aiExercises:    'ИИ упражнения',

    // ── Alphabet screen ─────────────────────────────────────────────────────
    lettersSubtitle:  '42 буквы • нажмите чтобы узнать',
    pronunciation:    'ПРОИЗНОШЕНИЕ',
    exampleWord:      'ПРИМЕР СЛОВА',
    gotIt:            'Понятно',
    noSoundNotice:    'У этой буквы нет отдельного звука. Нажмите 🔊 чтобы услышать в слове.',

    // ── Flashcards ──────────────────────────────────────────────────────────
    flashcards:    'Карточки',
    iKnowThis:    'Знаю ✓',
    stillLearning: 'Ещё учу',
    practiceAgain: 'Повторить',
    note:          'ЗАМЕТКА',
    whenToUse:     'КОГДА ИСПОЛЬЗОВАТЬ',
    digit:         'ЦИФРА',

    // ── Quiz ────────────────────────────────────────────────────────────────
    tryAgain: 'Попробовать снова',
    next:     'Далее',

    // ── Progress ────────────────────────────────────────────────────────────
    yourProgress: 'Ваш прогресс',
    bestScore:    'Лучший результат',

    // ── AI / Coming Soon ────────────────────────────────────────────────────
    comingSoonTitle: 'Скоро',
    comingSoonText:  'Персональные упражнения на базе ИИ появятся в следующем обновлении!',
    goBack:          '← Назад',

    // ── Language picker ─────────────────────────────────────────────────────
    chooseLanguage:  'Выберите язык',
    continueBtn:     'Продолжить',

    // ── Progress screen ──────────────────────────────────────────────────────
    myProgress:          'Мой прогресс',
    mastered:            'Изучено',
    bestQuiz:            'Лучший квиз',
    flashcardDecks:      'Наборы карточек',
    quizBestScoresTitle: 'Результаты квизов',
    noQuizScores:        'Пройдите квиз, чтобы увидеть результаты.',

    // ── Flashcards screen ────────────────────────────────────────────────────
    deckComplete:    'Набор завершён!',
    of:              'из',
    cardsMastered:   'карточек изучено',
    notMarked:       'Не отмечено',
    iKnowThisLabel:  'Знаю',
    previous:        '← Предыдущая',
    finish:          'Завершить →',
    nextArrow:       'Далее →',
    cards:           'карточек',

    // ── Quiz screen ──────────────────────────────────────────────────────────
    quiz:             'Квиз',
    whatDoesThisMean: 'Что это значит?',
    quizComplete:     'Квиз завершён!',
    perfectScoreMsg:  'Идеальный результат! Отлично!',
    greatJobMsg:      'Хорошая работа! Продолжайте.',
    keepGoingMsg:     'Продолжайте — у вас получится!',
    personalBest:     'Личный рекорд:',
    yourScore:        'Ваш результат',

    // ── Vocabulary screens ───────────────────────────────────────────────────
    words:             'слов',
    takeQuiz:          'Пройти квиз',
    phrases:           'фраз',
    tapAnyToLearn:     'нажмите чтобы узнать',
    tapAnyToLearnMore: 'Нажмите чтобы узнать больше',

    // ── Email verification ───────────────────────────────────────────────────
    verifyEmailTitle:        'Проверьте почту',
    verifyEmailSubtitle:     'Мы отправили письмо на',
    verifyEmailInstructions: 'Перейдите по ссылке в письме, затем нажмите кнопку ниже.',
    iHaveVerified:           'Я подтвердил(а) email ✓',
    resendEmail:             'Отправить повторно',
    resendIn:                'Повтор через',
    notVerifiedError:        'Email ещё не подтверждён. Нажмите ссылку в письме.',
    verificationSent:        'Письмо отправлено!',
    emailNotVerified:        'Сначала подтвердите email. Проверьте входящие.',
    useDifferentEmail:       'Использовать другой email',
    verificationCheckFailed: 'Не удалось проверить. Попробуйте снова.',
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const LanguageContext = createContext({
  language:           'en',
  setLanguage:        async (_lang) => {},
  hasChosenLanguage:  false,
  markLanguageChosen: async () => {},
  t:                  (key) => key,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Wrap the app with this provider.
 * Pass initialLanguage and initialHasChosen from _layout.tsx
 * (pre-read from AsyncStorage) to avoid any flash on first render.
 */
export function LanguageProvider({ children, initialLanguage = 'en', initialHasChosen = false }) {
  const [language, setLanguageState] = useState(
    initialLanguage === 'ru' ? 'ru' : 'en'
  );
  const [hasChosenLanguage, setHasChosenLanguage] = useState(initialHasChosen);

  const setLanguage = async (lang) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  // Call this from language-picker after the user confirms their choice.
  // Updating context state here triggers the redirect effect in _layout.tsx
  // synchronously — no AsyncStorage re-read race condition.
  const markLanguageChosen = async () => {
    setHasChosenLanguage(true);
    await AsyncStorage.setItem(HAS_CHOSEN_LANGUAGE_KEY, 'true');
  };

  const t = (key) => {
    return translations[language]?.[key] ?? translations.en[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, hasChosenLanguage, markLanguageChosen, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLanguage() {
  return useContext(LanguageContext);
}
