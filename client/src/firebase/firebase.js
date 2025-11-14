// client/src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";

// 🔹 Use env vars (Create React App: process.env.REACT_APP_*)

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ---------- Email/Password helpers (not used now, but kept if needed) ----------
const signupWithEmail = (email, password) =>
  firebaseCreateUserWithEmailAndPassword(auth, email, password);

const loginWithEmail = (email, password) =>
  firebaseSignInWithEmailAndPassword(auth, email, password);

// ---------- Google Sign-In helper ----------
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);

// ---------- Phone Auth helpers (optional) ----------
const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: (response) => {
        console.log("reCAPTCHA solved", response);
      },
    });
  }
};

const sendOtpToPhone = (phoneNumber) => {
  const appVerifier = window.recaptchaVerifier;
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

// ---------- Email Magic Link helpers ----------
const sendMagicLink = (email) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/login`,
    handleCodeInApp: true,
  };

  return sendSignInLinkToEmail(auth, email, actionCodeSettings);
};

export {
  auth,
  signupWithEmail,
  loginWithEmail,
  signInWithGooglePopup,
  setupRecaptcha,
  sendOtpToPhone,
  sendMagicLink,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
};
