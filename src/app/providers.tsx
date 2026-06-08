"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import { hydrateAuth } from "@/features/auth/authSlice";

/**
 * Client-side Redux provider. Creates one store per browser session (lazy
 * useState initializer runs exactly once) and hydrates persisted auth from
 * localStorage before the tree renders.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => {
    const s = makeStore();
    s.dispatch(hydrateAuth());
    return s;
  });

  return <Provider store={store}>{children}</Provider>;
}
