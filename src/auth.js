// ============================================================
// auth.js — Google Sign-In
// ============================================================
import { auth, provider } from '../firebase.js';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// Ouvintes de mudança de estado
const listeners = [];

export function onAuthChange(callback) {
  listeners.push(callback);
  return onAuthStateChanged(auth, user => {
    callback(user);
  });
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') return null;
    throw err;
  }
}

export async function signOutUser() {
  await signOut(auth);
}

export function getCurrentUser() {
  return auth.currentUser;
}
