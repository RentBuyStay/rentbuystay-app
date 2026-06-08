import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "@/services/api";
import { rootReducer } from "./rootReducer";

/**
 * Create a fresh store. In Next.js the store is created per request (via the
 * Providers client component) rather than as a module-level singleton, so SSR
 * requests never share state.
 */
export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });

  // Enables refetchOnFocus / refetchOnReconnect behaviours.
  setupListeners(store.dispatch);

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
