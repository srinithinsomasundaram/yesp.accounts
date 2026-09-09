"use client";

import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { setTokens, getAccessToken } from "./api";

const BASE = "/api/v1";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "request_failed");
  }
  return res.json();
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Registration (console — user must be signed in) ─────────────────────────

export async function registerPasskey(deviceName?: string): Promise<void> {
  // 1. Get challenge + options from backend
  const optionsRes = await fetch(`${BASE}/passkeys/register/options`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!optionsRes.ok) throw new Error("Failed to get registration options");
  const options = await optionsRes.json();

  // 2. Browser WebAuthn prompt
  const credential = await startRegistration({ optionsJSON: options });

  // 3. Verify with backend
  const verifyRes = await fetch(`${BASE}/passkeys/register/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ response: credential, deviceName }),
  });
  if (!verifyRes.ok) {
    const err = await verifyRes.json().catch(() => ({}));
    throw new Error(err.error ?? "verification_failed");
  }
}

// ─── Authentication (login — public) ─────────────────────────────────────────

export interface PasskeyLoginResult {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function loginWithPasskey(email: string): Promise<PasskeyLoginResult> {
  // 1. Get challenge + allowed credentials for this email
  const optionsRes = await post<{ userId: string } & Record<string, unknown>>(
    "/passkeys/authenticate/options",
    { email }
  );
  const { userId, ...authOptions } = optionsRes;

  // 2. Browser WebAuthn prompt
  const credential = await startAuthentication({ optionsJSON: authOptions as never });

  // 3. Verify with backend — returns full token set
  const tokens = await post<PasskeyLoginResult>("/passkeys/authenticate/verify", {
    userId,
    response: credential,
  });

  setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens;
}
