/* QuizNova — owner settings.
 *
 * Shared AI: with a Firebase project filled in below, every player gets AI questions without adding a key.
 * Requests go through Firebase AI Logic (Gemini Developer API) on the owner's project, so they share its
 * free limit, and App Check (reCAPTCHA) makes sure they come from this website. Players can still add their
 * own Gemini key in AI settings; their own key is used first.
 *
 * firebase: the web app config from Firebase console → Project settings → Your apps → Web app.
 * appCheck: the reCAPTCHA site key registered in Firebase console → Security → App Check
 *           (provider 'recaptcha-v3', or 'recaptcha-enterprise' for an Enterprise key).
 *
 * These values are public by design: they identify the project, they are not passwords. Never put a
 * Gemini API key or the reCAPTCHA secret key here. Leave firebase as null to make each player add their own key.
 */
window.QUIZNOVA_CONFIG = {
  firebase: null,
  appCheck: { provider: 'recaptcha-v3', siteKey: '' },
};
