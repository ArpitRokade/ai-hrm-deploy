// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace the values below with YOUR Firebase project config
// You can find this in Firebase Console → Project Settings → Your apps
const firebaseConfig = {
  apiKey: "AIzaSyB7BYgSkPj5kXPgHX2B9YxfHuweJoyvScA",
  authDomain: "i-hrm-backend.firebaseapp.com",
  projectId: "i-hrm-backend",
  storageBucket: "i-hrm-backend.firebasestorage.app",
  messagingSenderId: "866159838525",
  appId: "1:866159838525:web:50c6bcc5eb840b1ec37154"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you need
export const auth = getAuth(app);
export const db = getFirestore(app);