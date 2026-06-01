// ============================================================
// Firebase Configuration — CarManut
// ============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            "AIzaSyAfO5uav5uoLbMRpudfEetiHiB8a6Mt1s4",
  authDomain:        "manut-93dbb.firebaseapp.com",
  projectId:         "manut-93dbb",
  storageBucket:     "manut-93dbb.firebasestorage.app",
  messagingSenderId: "187729865300",
  appId:             "1:187729865300:web:e98a7cb95fde9dd5215bc1"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, db, provider };
