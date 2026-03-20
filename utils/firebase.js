import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDOUABAAMXrsBY4cgiOmBK9pMvR5YlAH3c",
  authDomain: "kazakh-learning-app-1.firebaseapp.com",
  projectId: "kazakh-learning-app-1",
  storageBucket: "kazakh-learning-app-1.firebasestorage.app",
  messagingSenderId: "744059807905",
  appId: "1:744059807905:web:eef8227791e2b904db28e0",
  measurementId: "G-D1HM1R2WWC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
