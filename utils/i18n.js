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
    checkSpamHint:           "Don't see the email? Check your spam or junk folder.",

    // ── Settings & notifications ─────────────────────────────────────────────
    settings:                'Settings',
    notifications:           'Notifications',
    dailyReminder:           'Daily reminder',
    reminderTime:            'Reminder time',
    notifEnabled:            'Reminders are on',
    notifDisabled:           'Reminders are off',
    enableNotif:             'Enable',
    disableNotif:            'Disable',
    saveSettings:            'Save',
    settingsSaved:           'Settings saved!',
    notifPermissionTitle:    'Stay on your streak! 🔥',
    notifPermissionBody:     'Allow Qazaq Tili to send a daily reminder so you never miss a practice session.',
    notifPermissionAllow:    'Allow notifications',
    notifPermissionSkip:     'Not now',

    // ── Achievements / Badges ────────────────────────────────────────────────
    badges:             'Badges',
    achievementUnlocked: 'Achievement Unlocked! 🏆',
    awesome:            'Awesome!',
    badgesProgress:     'badges unlocked',
    locked:             'Locked',
    unlockedOn:         'Unlocked',
    levelUpTitle:       'LEVEL UP!',
    youReachedLevel:    'You reached Level',
    nextLevelAt:        'Next level at',
    levelUpContinue:    'Continue',
    bdg_first_lesson:        'First Lesson',
    bdg_quiz_rookie:         'Quiz Rookie',
    bdg_flashcard_fan:       'Flashcard Fan',
    bdg_streak_3:            '3-Day Streak',
    bdg_streak_7:            '7-Day Streak',
    bdg_streak_30:           '30-Day Streak',
    bdg_level_2:             'Level 2',
    bdg_level_5:             'Level 5',
    bdg_level_10:            'Level 10',
    bdg_xp_1000:             'XP Collector',
    bdg_perfect_score:       'Perfect Score',
    bdg_quiz_master:         'Quiz Master',
    bdg_word_collector:      'Word Collector',
    bdg_century:             'Century',
    bdg_alphabet_explorer:   'Alphabet Explorer',
    bdg_first_lesson_d:      'Open your first vocabulary lesson',
    bdg_quiz_rookie_d:       'Complete your first quiz',
    bdg_flashcard_fan_d:     'Complete your first flashcard deck',
    bdg_streak_3_d:          'Maintain a 3-day streak',
    bdg_streak_7_d:          'Maintain a 7-day streak',
    bdg_streak_30_d:         'Maintain a 30-day streak',
    bdg_level_2_d:           'Reach Level 2',
    bdg_level_5_d:           'Reach Level 5',
    bdg_level_10_d:          'Reach Level 10',
    bdg_xp_1000_d:           'Earn 1,000 total XP',
    bdg_perfect_score_d:     'Get 10/10 on any quiz',
    bdg_quiz_master_d:       'Complete 10 quizzes',
    bdg_word_collector_d:    'Master 50 words with flashcards',
    bdg_century_d:           'Master 100 words with flashcards',
    bdg_alphabet_explorer_d: 'Open the Kazakh alphabet',

    // ── Hearts / XP system ───────────────────────────────────────────────────
    heartsLabel:         'Hearts',
    outOfHearts:         "You're out of hearts!",
    outOfHeartsSubtext:  'Come back when your hearts refill, or practice flashcards instead.',
    nextHeartIn:         'Next heart in',
    practiceFlashcards:  'Practice Flashcards',
    waitForHearts:       'Wait',
    correct:             'Correct!',
    incorrect:           'Incorrect',
    correctAnswer:       'Correct answer:',
    xpGained:            'XP',
    quizBonusXP:         '+50 XP bonus for completing the quiz!',
    level:               'Level',
    totalXP:             'Total XP',
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
    checkSpamHint:           'Не видите письмо? Проверьте папку Спам или Нежелательная почта.',

    // ── Settings & notifications ─────────────────────────────────────────────
    settings:                'Настройки',
    notifications:           'Уведомления',
    dailyReminder:           'Ежедневное напоминание',
    reminderTime:            'Время напоминания',
    notifEnabled:            'Напоминания включены',
    notifDisabled:           'Напоминания отключены',
    enableNotif:             'Включить',
    disableNotif:            'Отключить',
    saveSettings:            'Сохранить',
    settingsSaved:           'Настройки сохранены!',
    notifPermissionTitle:    'Не теряй серию! 🔥',
    notifPermissionBody:     'Разрешите Qazaq Tili отправлять ежедневные напоминания, чтобы не пропустить тренировку.',
    notifPermissionAllow:    'Разрешить уведомления',
    notifPermissionSkip:     'Не сейчас',

    // ── Achievements / Badges ────────────────────────────────────────────────
    badges:             'Достижения',
    achievementUnlocked: 'Достижение получено! 🏆',
    awesome:            'Отлично!',
    badgesProgress:     'достижений получено',
    locked:             'Закрыто',
    unlockedOn:         'Получено',
    levelUpTitle:       'НОВЫЙ УРОВЕНЬ!',
    youReachedLevel:    'Вы достигли уровня',
    nextLevelAt:        'Следующий уровень через',
    levelUpContinue:    'Продолжить',
    bdg_first_lesson:        'Первый урок',
    bdg_quiz_rookie:         'Новичок в квизе',
    bdg_flashcard_fan:       'Любитель карточек',
    bdg_streak_3:            '3 дня подряд',
    bdg_streak_7:            '7 дней подряд',
    bdg_streak_30:           '30 дней подряд',
    bdg_level_2:             'Уровень 2',
    bdg_level_5:             'Уровень 5',
    bdg_level_10:            'Уровень 10',
    bdg_xp_1000:             'Коллекционер XP',
    bdg_perfect_score:       'Идеальный результат',
    bdg_quiz_master:         'Мастер квиза',
    bdg_word_collector:      'Коллекционер слов',
    bdg_century:             'Сотня',
    bdg_alphabet_explorer:   'Исследователь алфавита',
    bdg_first_lesson_d:      'Откройте первый урок словаря',
    bdg_quiz_rookie_d:       'Пройдите первый квиз',
    bdg_flashcard_fan_d:     'Завершите первый набор карточек',
    bdg_streak_3_d:          'Удерживайте серию 3 дня',
    bdg_streak_7_d:          'Удерживайте серию 7 дней',
    bdg_streak_30_d:         'Удерживайте серию 30 дней',
    bdg_level_2_d:           'Достигните уровня 2',
    bdg_level_5_d:           'Достигните уровня 5',
    bdg_level_10_d:          'Достигните уровня 10',
    bdg_xp_1000_d:           'Наберите 1 000 XP',
    bdg_perfect_score_d:     'Наберите 10/10 в любом квизе',
    bdg_quiz_master_d:       'Пройдите 10 квизов',
    bdg_word_collector_d:    'Изучите 50 слов с карточками',
    bdg_century_d:           'Изучите 100 слов с карточками',
    bdg_alphabet_explorer_d: 'Откройте казахский алфавит',

    // ── Hearts / XP system ───────────────────────────────────────────────────
    heartsLabel:         'Жизни',
    outOfHearts:         'Жизни закончились!',
    outOfHeartsSubtext:  'Возвращайтесь когда жизни пополнятся, или потренируйтесь на карточках.',
    nextHeartIn:         'Следующая жизнь через',
    practiceFlashcards:  'Карточки',
    waitForHearts:       'Подождать',
    correct:             'Правильно!',
    incorrect:           'Неправильно',
    correctAnswer:       'Правильный ответ:',
    xpGained:            'XP',
    quizBonusXP:         '+50 XP бонус за завершение квиза!',
    level:               'Уровень',
    totalXP:             'Всего XP',
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
