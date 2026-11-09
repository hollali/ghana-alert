import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { getNeonAuthUrl } from '@/src/config/auth';
import type { User } from '@/src/types';

const COOKIE_KEY = 'neon-auth-cookie';
const JWT_KEY = 'neon-auth-jwt';

const webMemory: Record<string, string> = {};

async function storageGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
       
      const ls = (globalThis as unknown as { localStorage?: Storage }).localStorage;
      return ls?.getItem(key) ?? webMemory[key] ?? null;
    } catch {
      return webMemory[key] ?? null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function storageSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webMemory[key] = value;
    try {
       
      const ls = (globalThis as unknown as { localStorage?: Storage }).localStorage;
      ls?.setItem(key, value);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function storageDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    delete webMemory[key];
    try {
       
      const ls = (globalThis as unknown as { localStorage?: Storage }).localStorage;
      ls?.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key).catch(() => {});
}

export async function getStoredCookie(): Promise<string | null> {
  return storageGet(COOKIE_KEY);
}

export async function getStoredJwt(): Promise<string | null> {
  return storageGet(JWT_KEY);
}

export async function clearAuthStorage(): Promise<void> {
  await Promise.all([storageDelete(COOKIE_KEY), storageDelete(JWT_KEY)]);
}

export interface NeonUser {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
  emailVerified?: boolean;
}

export interface SessionResult {
  user: User;
  raw: NeonUser;
  jwt: string | null;
}

export class NeonAuthError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'NeonAuthError';
    this.status = status;
    this.code = code;
  }
}

function toUser(u: NeonUser): User {
  return {
    id: u.id,
    name: u.name || u.email.split('@')[0] || 'User',
    email: u.email,
    avatarUrl: u.image ?? undefined,
  };
}

function extractCookies(response: Response): string | null {
  try {
    const headers = response.headers as unknown as {
      getSetCookie?: () => string[];
      get?: (name: string) => string | null;
    };
    const array = typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : null;
    if (array && array.length > 0) return array.join('; ');
    const single = headers.get?.('set-cookie');
    return single ?? null;
  } catch {
    return null;
  }
}

function extractJwt(response: Response): string | null {
  try {
    return response.headers.get('set-auth-jwt');
  } catch {
    return null;
  }
}

function extractSessionJwt(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null;
  const d = data as Record<string, unknown>;
  // Better Auth / Neon: { session: { token } } or { token }
  const session = d['session'] as Record<string, unknown> | undefined;
  if (session && typeof session['token'] === 'string') {
    const t = session['token'] as string;
    // JWTs have two dots; opaque session tokens do not. Only treat JWTs as access tokens.
    if (t.split('.').length === 3) return t;
  }
  const nested = d['token'];
  if (typeof nested === 'string' && nested.split('.').length === 3) return nested;
  return null;
}

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = getNeonAuthUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const cookie = await getStoredCookie();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (cookie && !headers['Cookie'] && !headers['cookie']) {
    headers['Cookie'] = cookie;
  }

  const response = await fetch(url, { ...init, headers, credentials: 'omit' });

  const setCookie = extractCookies(response);
  if (setCookie) {
    await storageSet(COOKIE_KEY, setCookie);
  }
  const jwt = extractJwt(response);
  if (jwt) {
    await storageSet(JWT_KEY, jwt);
  }

  return response;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function errorFromResponse(data: unknown, status: number): NeonAuthError {
  if (typeof data === 'object' && data !== null) {
    const d = data as Record<string, unknown>;
    const message =
      (typeof d['message'] === 'string' && (d['message'] as string)) ||
      (typeof d['error'] === 'string' && (d['error'] as string)) ||
      `Request failed (${status})`;
    const code = typeof d['code'] === 'string' ? (d['code'] as string) : undefined;
    return new NeonAuthError(message, status, code);
  }
  return new NeonAuthError(`Request failed (${status})`, status);
}

async function postEmail(
  path: string,
  body: Record<string, unknown>,
): Promise<SessionResult> {
  const response = await authFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = await parseJson(response);
  const jwtFromHeader = await getStoredJwt();
  const jwtFromBody = extractSessionJwt(data);
  if (jwtFromBody) await storageSet(JWT_KEY, jwtFromBody);
  const jwt = jwtFromHeader ?? jwtFromBody;

  if (!response.ok) throw errorFromResponse(data, response.status);

  const d = (data ?? {}) as Record<string, unknown>;
  const rawUser = (d['user'] ?? {}) as NeonUser;
  if (!rawUser.id || !rawUser.email) {
    const session = await getSession();
    if (!session) throw new NeonAuthError('Sign-in succeeded but no session was returned', 200);
    return session;
  }
  return { user: toUser(rawUser), raw: rawUser, jwt };
}

export async function signUpEmail(input: {
  name: string;
  email: string;
  password: string;
}): Promise<SessionResult> {
  return postEmail('/sign-up/email', {
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
  });
}

export async function signInEmail(input: {
  email: string;
  password: string;
}): Promise<SessionResult> {
  return postEmail('/sign-in/email', {
    email: input.email.trim(),
    password: input.password,
  });
}

export async function getSession(): Promise<SessionResult | null> {
  const cookie = await getStoredCookie();
  if (!cookie && !(await getStoredJwt())) return null;

  const response = await authFetch('/get-session', { method: 'GET' });
  const data = await parseJson(response);
  const jwtFromBody = extractSessionJwt(data);
  if (jwtFromBody) await storageSet(JWT_KEY, jwtFromBody);
  const jwt = (await getStoredJwt()) ?? jwtFromBody;

  if (!response.ok) {
    if (response.status === 401) {
      await clearAuthStorage();
      return null;
    }
    throw errorFromResponse(data, response.status);
  }

  const d = (data ?? {}) as Record<string, unknown>;
  const rawUser = (d['user'] ?? {}) as NeonUser;
  if (!rawUser.id || !rawUser.email) {
    // No active session
    await clearAuthStorage();
    return null;
  }
  return { user: toUser(rawUser), raw: rawUser, jwt };
}

export async function refreshJwt(): Promise<string | null> {
  const session = await getSession();
  return session?.jwt ?? null;
}

export async function signOut(): Promise<void> {
  try {
    await authFetch('/sign-out', { method: 'POST' });
  } catch {
    // Ignore network errors on sign-out; local state must still clear.
  } finally {
    await clearAuthStorage();
  }
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const response = await authFetch('/change-password', {
    method: 'POST',
    body: JSON.stringify({
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      revokeOtherSessions: false,
    }),
  });
  const data = await parseJson(response);
  if (!response.ok) throw errorFromResponse(data, response.status);
}

export async function getAccessToken(): Promise<string | null> {
  let jwt = await getStoredJwt();
  if (jwt) return jwt;
  jwt = await refreshJwt();
  return jwt;
}

export function isNeonAuthConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_NEON_AUTH_URL?.trim());
}
