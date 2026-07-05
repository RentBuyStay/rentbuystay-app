import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { config } from "@/lib/config";
import { getDeviceId } from "@/lib/device";
import { loadAuth } from "@/lib/tokenStorage";
import { endpoints } from "./endpoints";
import { logOut, setCredentials } from "@/features/auth/authSlice";
import type { RootState } from "@/store/store";
import type { ApiEnvelope, TokensResponse } from "./types";

/** Force a clean re-auth when the session can't be recovered (avoids a zombie UI). */
function redirectToLogin() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/log-in") || path.startsWith("/sign-up")) return;
  window.location.href = "/log-in";
}

// Single in-flight refresh guard: if many requests 401 at once, only the first
// refreshes the token; the rest wait on the mutex and then retry.
const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: config.apiBaseUrl,
  credentials: "include", // Essential for cross-origin cookies
  // Never let a request hang indefinitely — a stalled refresh would otherwise
  // hold the reauth mutex and freeze every other request ("Loading…" forever).
  timeout: 15000,
  prepareHeaders: (headers) => {
    // Authorization is injected per-request in withAuth() below (URL-aware) so
    // public /auth/* calls never carry a Bearer. Only the device id is global.
    const deviceId = getDeviceId();
    if (deviceId) headers.set("X-Device-Id", deviceId);
    return headers;
  },
});

const urlOf = (args: string | FetchArgs): string =>
  typeof args === "string" ? args : args.url;

// Public endpoints that must NOT carry a Bearer (and whose 401s aren't token
// expiry): /auth/* and the invitation-accept link an agent opens while logged out.
const isAuthEndpoint = (args: string | FetchArgs): boolean => {
  const url = urlOf(args);
  return url.startsWith("/auth") || url.startsWith("/invitations/");
};

/**
 * Attach the current access token — EXCEPT on public /auth/* endpoints. Sending
 * even an expired Bearer to /auth/* makes Spring's JWT filter reject the request
 * ("Jwt expired"), which would break signup/login/refresh. Reads the token fresh
 * each call so a post-refresh retry uses the new token.
 */
function withAuth(
  args: string | FetchArgs,
  getState: () => unknown
): string | FetchArgs {
  if (isAuthEndpoint(args)) return args;
  const token = (getState() as RootState).auth.accessToken;
  if (!token) return args;
  const base: FetchArgs = typeof args === "string" ? { url: args } : args;
  return { ...base, headers: { ...(base.headers as object), Authorization: `Bearer ${token}` } };
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait for any in-progress refresh to finish before firing the request.
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(withAuth(args, api.getState), api, extraOptions);

  // A 401 on an /auth/* call is meaningful (e.g. NEW_DEVICE_REQUIRES_OTP, bad
  // credentials) — never treat it as an expired access token. Otherwise, any
  // 401 while we hold a refresh token (or might have one in cookie) is an expired access token: refresh once.
  const isAuthCall = isAuthEndpoint(args);
  const hasRefreshToken =
    Boolean((api.getState() as RootState).auth.refreshToken) ||
    Boolean(loadAuth().refreshToken) ||
    true; // Always try refresh once since the token might be in an HttpOnly cookie
  const canRefresh = result.error?.status === 401 && !isAuthCall && hasRefreshToken;

  if (canRefresh) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // Prefer the latest persisted refresh token (another tab may have
        // rotated it) over the in-memory copy. If neither, pass empty object (cookie will be used)
        const refreshToken =
          loadAuth().refreshToken ?? (api.getState() as RootState).auth.refreshToken;

        const refreshResult = await rawBaseQuery(
          { 
            url: endpoints.refresh, 
            method: "POST", 
            body: refreshToken ? { refreshToken } : {} 
          },
          api,
          extraOptions
        );

        const envelope = (refreshResult as { data?: ApiEnvelope<TokensResponse> })
          .data;
        if (envelope?.success && envelope.data) {
          api.dispatch(setCredentials(envelope.data));
          // Retry with the freshly-issued access token.
          result = await rawBaseQuery(withAuth(args, api.getState), api, extraOptions);
        } else {
          // Refresh token is invalid/expired — end the session cleanly.
          api.dispatch(logOut());
          redirectToLogin();
        }
      } finally {
        release();
      }
    } else {
      // Another request is already refreshing — wait, then retry once.
      await mutex.waitForUnlock();
      result = await rawBaseQuery(withAuth(args, api.getState), api, extraOptions);
    }
  }

  return result;
};

/**
 * Root API slice. Feature endpoints are added via `api.injectEndpoints(...)`
 * in their own files (services/authApi.ts, services/meApi.ts, ...).
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Me",
    "Property",
    "Properties",
    "PropertyRequest",
    "PropertyRequests",
    "Conversations",
    "Messages",
    "Inspections",
    "Subscription",
    "Billing",
    "Notifications",
    "SavedProperties",
    "AgencyStaff",
    "Invitations",
  ],
  endpoints: () => ({}),
});

/** Pull the backend error envelope out of an RTK Query error, if present. */
export function unwrapApiError(
  error: unknown
): { code: string; message: string } | null {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "code" in error.data
  ) {
    const env = error.data as ApiEnvelope<unknown>;
    return { code: env.code, message: env.message ?? "Something went wrong." };
  }
  return null;
}

/**
 * Turn ANY RTK Query error into an accurate, user-facing message. Prefers the
 * backend's own message; otherwise distinguishes network/CORS, timeout, bad
 * response and server (5xx) failures — so a dropped connection or server error
 * is never mislabelled as "Invalid email or password".
 */
export function describeApiError(error: unknown): string {
  const api = unwrapApiError(error);
  if (api?.message) return api.message;

  const status =
    error && typeof error === "object" && "status" in error
      ? (error as { status?: unknown }).status
      : undefined;

  if (status === "FETCH_ERROR")
    return "Can't reach the server. Check your internet connection and try again.";
  if (status === "TIMEOUT_ERROR")
    return "The server took too long to respond. Please try again.";
  if (status === "PARSING_ERROR")
    return "We received an unexpected response from the server. Please try again.";
  if (typeof status === "number") {
    if (status === 401 || status === 403) return "Invalid email or password.";
    if (status === 429) return "Too many attempts. Please wait a moment and try again.";
    if (status >= 500) return "Something went wrong on our end. Please try again shortly.";
  }
  return "Something went wrong. Please try again.";
}
