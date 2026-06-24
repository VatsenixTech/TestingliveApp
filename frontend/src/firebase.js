import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDCZDyALnx3Zep1FEcFW-zI9gGZbvu_ObM",
  authDomain: "nopromptjobs.firebaseapp.com",
  projectId: "nopromptjobs",
  storageBucket: "nopromptjobs.firebasestorage.app",
  messagingSenderId: "877644514674",
  appId: "1:877644514674:web:07bbc304c6d16e43c6c9eb",
  measurementId: "G-GG5T4XWDX1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);

// Google Provider
export const googleProvider = new GoogleAuthProvider();

// Optional Google settings
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Default export
export default app;