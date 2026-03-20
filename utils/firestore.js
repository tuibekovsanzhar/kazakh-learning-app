import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Save progress data for a user to Firestore.
 * Path: users/{userId}/progress/data
 * Uses merge:true so only the fields you pass are updated —
 * existing fields (e.g. quiz scores) are not overwritten.
 *
 * @param {string} userId - the Firebase Auth uid
 * @param {object} data   - any key/value pairs to save (e.g. { streakCount: 5 })
 */
export async function saveProgress(userId, data) {
  console.log('Saving to Firestore:', userId, data);
  const ref = doc(db, 'users', userId, 'progress', 'data');
  await setDoc(ref, data, { merge: true });
}

/**
 * Load progress data for a user from Firestore.
 * Returns the saved object, or null if no document exists yet.
 *
 * @param {string} userId - the Firebase Auth uid
 */
export async function loadProgress(userId) {
  const ref = doc(db, 'users', userId, 'progress', 'data');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
