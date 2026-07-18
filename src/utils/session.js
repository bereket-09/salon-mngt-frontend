// Centralized session / auth-expiry handling.
//
// Every component fetches with a Bearer token but nobody handled a 401, so an
// expired session returned an error body that then crashed downstream code
// (e.g. `.map` on a non-array). This installs a single global guard that
// intercepts any 401 from our API and performs a clean logout + redirect.

import config from 'src/config';
import { clearAuthStorage } from './auth';

let loggingOut = false;

// Clear all auth/session state and send the user to the login screen.
// Returns true if it initiated a navigation (so callers can stop work).
export function forceLogout({ expired = true } = {}) {
  if (loggingOut) return true;
  loggingOut = true;

  clearAuthStorage(); // wipes every session key; never throws

  const path = typeof window !== 'undefined' ? window.location.pathname : '/login';
  if (path === '/login') {
    loggingOut = false; // already here; let the login page work normally
    return false;
  }

  if (expired) {
    try { sessionStorage.setItem('sessionExpired', '1'); } catch (_e) { /* ignore */ }
  }
  window.location.assign('/login');
  return true;
}

function urlOf(input) {
  if (typeof input === 'string') return input;
  if (input && typeof input.url === 'string') return input.url; // Request object
  return '';
}

// Install once at app startup. Patches window.fetch and (optionally) an axios
// instance so a 401 from our API triggers forceLogout instead of crashing.
export function installAuthGuard(axiosInstance) {
  if (typeof window !== 'undefined' && !window.__authGuardInstalled) {
    window.__authGuardInstalled = true;
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      try {
        if (res.status === 401) {
          const url = urlOf(args[0]);
          const isApi = url.includes(config.BASE_URL);
          const isLogin = url.includes('/auth/login'); // wrong-password 401s must stay on the form
          const hadToken = !!localStorage.getItem('authToken');
          if (isApi && !isLogin && hadToken) {
            const navigating = forceLogout();
            // We're leaving this page — never resolve so the caller's
            // downstream code (res.json().map(...)) never runs and can't crash.
            if (navigating) return new Promise(() => {});
          }
        }
      } catch (_e) { /* never let the guard itself throw */ }
      return res;
    };
  }

  if (axiosInstance && axiosInstance.interceptors) {
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error && error.response && error.response.status;
        const url = (error && error.config && error.config.url) || '';
        if (status === 401 && !url.includes('/auth/login') && localStorage.getItem('authToken')) {
          forceLogout();
        }
        return Promise.reject(error);
      }
    );
  }
}
