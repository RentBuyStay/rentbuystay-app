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
  // Never let a request hang indefinitely — a stalled refresh would otherwise
  // hold the reauth mutex and freeze every other request ("Loading…" forever).
  timeout: 15000,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    // Stable device id powers the backend's trusted-device login flow.
    const deviceId = getDeviceId();
    if (deviceId) headers.set("X-Device-Id", deviceId);
    return headers;
  },
});

const urlOf = (args: string | FetchArgs): string =>
  typeof args === "string" ? args : args.url;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait for any in-progress refresh to finish before firing the request.
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  // A 401 on an /auth/* call is meaningful (e.g. NEW_DEVICE_REQUIRES_OTP, bad
  // credentials) — never treat it as an expired access token. Otherwise, any
  // 401 while we hold a refresh token is an expired access token: refresh once.
  const isAuthCall = urlOf(args).startsWith("/auth");
  const hasRefreshToken =
    Boolean((api.getState() as RootState).auth.refreshToken) ||
    Boolean(loadAuth().refreshToken);
  const canRefresh = result.error?.status === 401 && !isAuthCall && hasRefreshToken;

  if (canRefresh) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // Prefer the latest persisted refresh token (another tab may have
        // rotated it) over the in-memory copy.
        const refreshToken =
          loadAuth().refreshToken ?? (api.getState() as RootState).auth.refreshToken;

        const refreshResult = refreshToken
          ? await rawBaseQuery(
              { url: endpoints.refresh, method: "POST", body: { refreshToken } },
              api,
              extraOptions
            )
          : { error: { status: 401 } as FetchBaseQueryError };

        const envelope = (refreshResult as { data?: ApiEnvelope<TokensResponse> })
          .data;
        if (envelope?.success && envelope.data) {
          api.dispatch(setCredentials(envelope.data));
          result = await rawBaseQuery(args, api, extraOptions); // retry original
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
      result = await rawBaseQuery(args, api, extraOptions);
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
