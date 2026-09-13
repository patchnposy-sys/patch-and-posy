/**
 * PATCH & POSY — Firebase configuration
 *
 * This connects the site to YOUR free Firebase project, which stores
 * orders securely and powers the login on dashboard.html.
 *
 * SETUP.md has full click-by-click instructions. Short version:
 *   1. Go to https://console.firebase.google.com → Add project (free).
 *   2. Build → Firestore Database → Create database (production mode).
 *   3. Build → Authentication → Sign-in method → enable Email/Password.
 *   4. Authentication → Users → Add user → this is YOUR admin login for
 *      dashboard.html (use a real email + a strong password).
 *   5. Project settings (gear icon) → General → "Your apps" → Web app
 *      (</>) → register an app → copy the firebaseConfig object shown
 *      there and paste its values below.
 *   6. Firestore → Rules tab → paste the rules from SETUP.md → Publish.
 *
 * These values are safe to be public (they identify the project, not
 * secret keys) — real security comes from the Firestore Rules in step 6.
 */

const FIREBASE_CONFIG = {
 apiKey: "AIzaSyD6lbP2x1jVwwaXhYqh09PZY4SsddilFFE",
  authDomain: "patch-and-posy.firebaseapp.com",
  projectId: "patch-and-posy",
  storageBucket: "patch-and-posy.firebasestorage.app",
  messagingSenderId: "340072166087",
  appId: "1:340072166087:web:a94fb5e0ca4590df4e44e2",
  measurementId: "G-NNTCPQJBTW"
};

// Initialized once and reused by cart.js/checkout.js/dashboard.js.
// Guarded so this file can be safely included on every page.
let firebaseApp = null;
let firebaseDB = null;
let firebaseAuth = null;

function initFirebase() {
  if (firebaseApp) return { app: firebaseApp, db: firebaseDB, auth: firebaseAuth };
  if (typeof firebase === "undefined") {
    console.warn("Firebase SDK not loaded — check the <script> tags in the HTML.");
    return null;
  }
  if (FIREBASE_CONFIG.apiKey.startsWith("PASTE_")) {
    console.warn("Firebase is not configured yet — see js/firebase-config.js and SETUP.md.");
    return null;
  }
  firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
  firebaseDB = firebase.firestore();
  firebaseAuth = firebase.auth();
  return { app: firebaseApp, db: firebaseDB, auth: firebaseAuth };
}
