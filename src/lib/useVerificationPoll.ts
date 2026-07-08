"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MeResponse } from "@/services/types";

/** RTK Query's refetch resolves to an object carrying the fresh `data`. */
type RefetchMe = () => Promise<{ data?: MeResponse }>;

// Backoff schedule — quick at first (webhook is usually fast), then patient.
// Totals ~60s across the gaps; ~10 checks.
const DELAYS = [1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 12000];

/**
 * After a Dojah widget reports success the outcome is written by an async
 * webhook — it can land a few seconds *after* the widget closes. A single
 * refetch therefore usually still reads PENDING, leaving the "Verify" button
 * on screen until the user manually reloads.
 *
 * This hook re-fetches /me on a backoff schedule until the verification we care
 * about actually flips verified (or we give up after ~1 min), exposing a
 * `finalizing` flag so the button can show a "Finalizing…" state meanwhile.
 */
export function useVerificationPoll(refetch: RefetchMe) {
  const [finalizing, setFinalizing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      timer.current = setTimeout(resolve, ms);
    });

  const poll = useCallback(
    async (isDone: (m?: MeResponse) => boolean): Promise<boolean> => {
      if (!alive.current) return false;
      setFinalizing(true);
      try {
        // Immediate check first (covers the fast-webhook / dev TRUST_CLIENT case).
        let res = await refetch();
        if (isDone(res.data)) return true;

        for (const delay of DELAYS) {
          await wait(delay);
          if (!alive.current) return false;
          res = await refetch();
          if (isDone(res.data)) return true;
        }
        return false;
      } finally {
        if (alive.current) setFinalizing(false);
      }
    },
    [refetch],
  );

  return { finalizing, poll };
}
