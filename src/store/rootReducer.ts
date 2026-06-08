import { combineReducers, type Action } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import authReducer, { logOut } from "@/features/auth/authSlice";

const appReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  // Add feature slices here.
});

/**
 * Root reducer that wipes all state on logout, so no stale per-user data (or
 * cached API responses) leaks across sessions.
 */
export const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: Action
): ReturnType<typeof appReducer> => {
  if (action.type === logOut.type) {
    state = undefined;
  }
  return appReducer(state, action);
};
