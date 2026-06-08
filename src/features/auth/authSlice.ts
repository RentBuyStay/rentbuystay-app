import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AccountRole } from "@/lib/role";
import {
  clearAuth,
  loadAuth,
  saveAuth,
  type AuthUser,
} from "@/lib/tokenStorage";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  role: AccountRole | null;
  user: AuthUser | null;
};

/**
 * Subset of the backend TokensResponse that setCredentials consumes. Role and
 * user are not part of the token response — they come from GET /me (see meApi),
 * so they're optional here and filled in separately.
 */
export type Credentials = {
  accessToken: string;
  refreshToken?: string;
  role?: AccountRole;
  user?: AuthUser;
};

// Start empty on the server; the real persisted values are hydrated on the
// client (see hydrateAuth) to avoid SSR/CSR markup mismatches.
const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  role: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Rehydrate Redux from localStorage. Dispatch once on the client at startup. */
    hydrateAuth: (state) => {
      const persisted = loadAuth();
      state.accessToken = persisted.accessToken;
      state.refreshToken = persisted.refreshToken;
      state.role = persisted.role;
      state.user = persisted.user;
    },

    setCredentials: (state, action: PayloadAction<Credentials>) => {
      const { accessToken, refreshToken, role, user } = action.payload;
      state.accessToken = accessToken;
      // Preserve an existing refresh token if the response omits one (e.g. on refresh).
      if (refreshToken !== undefined) state.refreshToken = refreshToken;
      if (role !== undefined) state.role = role;
      if (user !== undefined) state.user = user;

      saveAuth({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        role: state.role,
        user: state.user,
      });
    },

    setRole: (state, action: PayloadAction<AccountRole>) => {
      state.role = action.payload;
      saveAuth({ role: action.payload });
    },

    /** Update the cached user profile (e.g. after GET /me) without touching tokens. */
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      saveAuth({ user: action.payload });
    },

    logOut: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.user = null;
      clearAuth();
    },
  },
});

export const { hydrateAuth, setCredentials, setRole, setUser, logOut } =
  authSlice.actions;
export default authSlice.reducer;

// Selectors — import RootState lazily to avoid a circular dependency with the store.
import type { RootState } from "@/store/store";
export const selectAccessToken = (s: RootState) => s.auth.accessToken;
export const selectRefreshToken = (s: RootState) => s.auth.refreshToken;
export const selectRole = (s: RootState) => s.auth.role;
export const selectUser = (s: RootState) => s.auth.user;
export const selectIsAuthenticated = (s: RootState) => Boolean(s.auth.accessToken);
