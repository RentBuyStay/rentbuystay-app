import type { AccountRole } from "./role";

/**
 * Single source of truth for persisted auth across reloads. Everything lives
 * behind this module so the storage backend (currently localStorage) can later
 * be swapped for httpOnly cookies without touching call sites.
 *
 * Note: localStorage is readable by any script on the page. This is fine to
 * start integrating, but tokens here are NOT protected against XSS — the secure
 * upgrade path is httpOnly cookies set by the backend.
 */

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
};

export type PersistedAuth = {
  accessToken: string | null;
  refreshToken: string | null;
  role: AccountRole | null;
  user: AuthUser | null;
};

const KEYS = {
  accessToken: "rbs-access-token",
  refreshToken: "rbs-refresh-token",
  role: "rbs-dashboard-role", // shared with lib/role.ts for prototype compatibility
  user: "rbs-user",
} as const;

const isBrowser = () => typeof window !== "undefined";

function readJSON<T>(key: string): T | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadAuth(): PersistedAuth {
  if (!isBrowser()) {
    return { accessToken: null, refreshToken: null, role: null, user: null };
  }
  return {
    accessToken: localStorage.getItem(KEYS.accessToken),
    refreshToken: localStorage.getItem(KEYS.refreshToken),
    role: (localStorage.getItem(KEYS.role) as AccountRole | null) ?? null,
    user: readJSON<AuthUser>(KEYS.user),
  };
}

function put(key: string, value: string | null) {
  if (value) localStorage.setItem(key, value);
  else localStorage.removeItem(key);
}

export function saveAuth(auth: Partial<PersistedAuth>): void {
  if (!isBrowser()) return;
  if ("accessToken" in auth) put(KEYS.accessToken, auth.accessToken ?? null);
  if ("refreshToken" in auth) put(KEYS.refreshToken, auth.refreshToken ?? null);
  if ("role" in auth) put(KEYS.role, auth.role ?? null);
  if ("user" in auth) put(KEYS.user, auth.user ? JSON.stringify(auth.user) : null);
}

export function clearAuth(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
