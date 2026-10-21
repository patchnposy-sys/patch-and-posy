/**
 * PATCH & POSY — Bot protection (Firebase App Check with reCAPTCHA v3)
 *
 * reCAPTCHA v3 runs invisibly: customers see no checkbox or puzzle.
 * It only starts when a site key is added to js/firebase-config.js as
 *   appCheckSiteKey: "your-recaptcha-v3-site-key"
 * Until then this file does nothing, so the site keeps working.
 */

(function startAppCheck() {
  try {
    const key = (typeof FIREBASE_CONFIG !== "undefined" && FIREBASE_CONFIG.appCheckSiteKey) || "";
    if (!key) return;
    if (typeof firebase === "undefined" || !firebase.appCheck) return;
    const ready = initFirebase();
    if (!ready) return;
    firebase.appCheck().activate(key, true);
  } catch (err) {
    console.warn("App Check did not start:", err);
  }
})();
