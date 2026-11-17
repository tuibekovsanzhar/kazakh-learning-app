// utils/api.js
// Client for the Qazaq Tili server (the website's API). The app holds no AI keys:
// every AI call goes to our server with the signed-in user's Firebase ID token,
// and the server calls the model, applies the daily limits and the shared budget.

import { auth } from './firebase';

// Public address, not a secret. Set per build profile in eas.json (env.EXPO_PUBLIC_API_BASE_URL).
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://kazakh-tutor-nine.vercel.app').replace(/\/$/, '');

const TIMEOUT_MS = 30000;

/** Error with the server's stable code: unauthenticated, consent_required, daily_limit, rest_until_tomorrow, rate_limited, tutor_unavailable, offline… */
export class ApiError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

async function call(method, path, body) {
  const user = auth.currentUser;
  if (!user) throw new ApiError('unauthenticated', 401);
  const token = await user.getIdToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('offline', 0);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let code = 'internal';
    try {
      code = (await res.json()).error.code || code;
    } catch {
      // not a JSON error body
    }
    throw new ApiError(code, res.status);
  }
  return res.json();
}

export const api = {
  /** { consented, checksUsedToday, checksAllowed, available } */
  exerciseStatus: () => call('GET', '/api/exercises'),
  /** One-time confirmation: 16 or older, and agreement to AI processing. */
  exerciseConsent: () => call('POST', '/api/exercises/consent', { age16Confirmed: true, aiProcessing: true }),
  /** topic: greetings|travel|food|business|family; level: beginner|intermediate; lang: en|ru → { set } */
  exerciseSet: (topic, level, lang) => call('POST', '/api/exercises/sets', { topic, level, lang }),
  /** → { verdict: correct|almost|wrong, corrections, comment, answer, answerLatin, checksLeft } */
  checkExercise: (setId, index, answer, lang) => call('POST', '/api/exercises/check', { setId, index, answer, lang }),
  /** reason: wrong|offensive|other */
  reportExercise: (setId, index, reason) => call('POST', '/api/exercises/report', { setId, index, reason }),
};

/** Translation key for an API error, for the AI exercises screen. */
export function errorKey(err) {
  switch (err instanceof ApiError ? err.code : '') {
    case 'offline':
      return 'aiOffline';
    case 'daily_limit':
      return 'aiNoChecksLeft';
    case 'rest_until_tomorrow':
      return 'aiResting';
    case 'rate_limited':
      return 'aiTooFast';
    default:
      return 'aiGeneric';
  }
}
