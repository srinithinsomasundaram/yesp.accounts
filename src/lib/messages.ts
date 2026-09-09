// Central Yesp Auth message library.
// Backend returns stable error codes; this maps them to user-facing copy.

export const MSG: Record<string, { title: string; body?: string }> = {
  // ── Credentials ──────────────────────────────────────────────────────────────
  AUTH_INVALID_CREDENTIALS: {
    title: "Incorrect password",
    body: "The password you entered doesn't match this account.",
  },
  AUTH_ACCOUNT_NOT_FOUND: {
    title: "We couldn't sign you in",
    body: "Check your details and try again, or use another sign-in method.",
  },
  AUTH_TOO_MANY_ATTEMPTS: {
    title: "Try again later",
    body: "To help protect your account, we've temporarily limited sign-in attempts.",
  },
  AUTH_ACCOUNT_LOCKED: {
    title: "We need to verify your identity",
    body: "To keep your account secure, use another verification method to continue.",
  },

  // ── Passkey ───────────────────────────────────────────────────────────────────
  AUTH_PASSKEY_NO_CREDENTIALS: {
    title: "No passkey available",
    body: "This device doesn't have a passkey registered for this account.",
  },
  AUTH_PASSKEY_CANCELLED: {
    title: "Passkey sign-in cancelled",
    body: "You can try again or choose another sign-in method.",
  },
  AUTH_PASSKEY_FAILED: {
    title: "We couldn't verify your passkey",
    body: "Try again or use another sign-in method.",
  },

  // ── Smart Login ───────────────────────────────────────────────────────────────
  AUTH_SMART_LOGIN_EXPIRED: {
    title: "This code has expired",
    body: "For your security, Smart Login codes are only active for a limited time.",
  },
  AUTH_SMART_LOGIN_DECLINED: {
    title: "Sign-in not approved",
    body: "The sign-in request was declined on your other device.",
  },
  AUTH_SMART_LOGIN_ALREADY_USED: {
    title: "This code can't be used",
    body: "Start a new Smart Login request and try again.",
  },

  // ── MFA ───────────────────────────────────────────────────────────────────────
  AUTH_MFA_INVALID_CODE: {
    title: "That code isn't correct",
    body: "Check the code from your authenticator app and try again.",
  },
  AUTH_MFA_CODE_EXPIRED: {
    title: "That code has expired",
    body: "Enter a new code to continue.",
  },
  AUTH_MFA_TOO_MANY_ATTEMPTS: {
    title: "Try again later",
    body: "To help protect your account, we've temporarily limited verification attempts.",
  },
  AUTH_RECOVERY_CODE_USED: {
    title: "That recovery code has already been used",
    body: "Try another recovery code.",
  },

  // ── Password reset ────────────────────────────────────────────────────────────
  AUTH_RESET_LINK_EXPIRED: {
    title: "This link has expired",
    body: "For your security, password reset links are only available for a limited time.",
  },
  AUTH_RESET_LINK_INVALID: {
    title: "This link can't be used",
    body: "Request a new password reset link and try again.",
  },
  AUTH_PASSWORD_TOO_WEAK: {
    title: "Choose a stronger password",
    body: "Try a longer, unique password that you don't use for other accounts.",
  },
  AUTH_PASSWORD_REUSED: {
    title: "Choose a different password",
    body: "For your security, you can't reuse a recently used password.",
  },

  // ── Email verification ────────────────────────────────────────────────────────
  AUTH_EMAIL_LINK_INVALID: {
    title: "This verification link can't be used",
    body: "Request a new verification email and try again.",
  },

  // ── Session ───────────────────────────────────────────────────────────────────
  AUTH_SESSION_EXPIRED: {
    title: "Your session has ended",
    body: "Sign in again to continue.",
  },

  // ── OAuth ─────────────────────────────────────────────────────────────────────
  AUTH_OAUTH_CANCELLED: {
    title: "Sign-in cancelled",
    body: "You can try again or use another sign-in method.",
  },
  AUTH_OAUTH_FAILED: {
    title: "Something went wrong",
    body: "We couldn't complete sign-in with that provider. Please try again.",
  },
  AUTH_OAUTH_CODE_EXPIRED: {
    title: "Something went wrong",
    body: "Your sign-in session expired. Please try again.",
  },
  AUTH_INVALID_STATE: {
    title: "Something went wrong",
    body: "Sign-in verification failed. Please try again.",
  },

  // ── Generic ───────────────────────────────────────────────────────────────────
  AUTH_NETWORK_ERROR: {
    title: "Check your connection",
    body: "We couldn't complete your request. Check your internet connection and try again.",
  },
  AUTH_SERVER_ERROR: {
    title: "Something went wrong",
    body: "We couldn't complete your request right now. Please try again later.",
  },
};

export function getMsg(code: string): { title: string; body?: string } {
  return MSG[code] ?? MSG["AUTH_SERVER_ERROR"];
}

export function getError(code: string): string {
  const m = getMsg(code);
  return m.body ? `${m.title}. ${m.body}` : m.title;
}
