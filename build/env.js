// Runtime environment variables for the static frontend.
// Edit this file on the server hosting nuvsoslabs.in to change the API URL without rebuilding.
window._env_ = window._env_ || {};

// Set your backend API URL here. For quick testing with a local backend exposed by ngrok,
// replace the value below with the HTTPS ngrok URL followed by /api, for example:
//   https://abcd1234.ngrok.io/api
// If you will host the backend on the same domain later, use:
//   https://nuvsoslabs.in/api
// Default placeholder is intentionally non-functional so you must set it before public hosting.
window._env_.REACT_APP_API_URL = window._env_.REACT_APP_API_URL || 'https://nuvsoslabs.in/api';
