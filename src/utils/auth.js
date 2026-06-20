// Single source of truth for reading/clearing the auth session.
//
// Reading the token or the stored user must NEVER throw. Previously several
// places did `JSON.parse(localStorage.getItem('userData'))` directly, so a
// missing, empty, or corrupt value (e.g. the literal string "undefined" left
// over from a half-finished login) crashed the whole app with a white screen.
// These helpers fail soft: on any problem they return null / no-op, and callers
// treat that as "not logged in" and redirect to /login.

// Every session-scoped key. clearAuthStorage() wipes all of them so no stale
// token, user, or branch selection is left behind after a logout / auth failure.
const SESSION_KEYS = ['authToken', 'userData', 'selectedBranchId', 'selectedBranchName'];

export function getToken() {
  try {
    const t = localStorage.getItem('authToken');
    return t && t !== 'undefined' && t !== 'null' ? t : null;
  } catch {
    return null;
  }
}

// Safely parse the stored user. Returns null instead of throwing on bad JSON.
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('userData');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Remove every session key. Safe to call any time; never throws.
export function clearAuthStorage() {
  try {
    SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* localStorage unavailable (private mode / SSR) — nothing to clear */
  }
}

// True only when we have a token AND a parseable, unexpired user.
export function hasValidSession() {
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) return false;
  const now = Math.floor(Date.now() / 1000);
  if (user.exp && user.exp < now) return false; // expired JWT
  return true;
}
