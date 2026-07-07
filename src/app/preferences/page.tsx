"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingShell from "@/components/OnboardingShell";
import { useGetPropertyTypesQuery } from "@/services/referenceApi";
import {
  getOnboarding,
  setPendingPropertyTypeId,
  clearPendingPropertyTypeId,
} from "@/lib/onboarding";

/**
 * Seeker onboarding — "What type of property are you looking for?" Shown right
 * after create-password for PROPERTY_SEEKER accounts. Options come from the real
 * /property-types list; the pick is stashed and applied to PUT /me/preferences
 * on the first login (the user isn't authenticated yet at this step).
 */
export default function PreferencesPage() {
  const router = useRouter();
  const { data: types = [], isLoading } = useGetPropertyTypesQuery();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Only reachable mid-signup; bounce out if the flow context is missing.
  useEffect(() => {
    const ob = getOnboarding();
    if (!ob?.email) router.replace("/sign-up");
    else if (ob.userType && ob.userType !== "PROPERTY_SEEKER") router.replace("/log-in");
  }, [router]);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const complete = () => {
    // Backend preferences hold a single property type — stash the first pick.
    const first = [...selected][0];
    if (first != null) setPendingPropertyTypeId(first);
    else clearPendingPropertyTypeId();
    router.push("/log-in");
  };

  return (
    <OnboardingShell>
      {/* Back */}
      <Link
        href="/create-password"
        className="inline-flex items-center self-start hover:opacity-80"
        style={{ gap: "12px" }}
      >
        <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>
          Back
        </span>
      </Link>

      {/* Heading */}
      <div className="flex flex-col" style={{ gap: "8px" }}>
        <h1
          className="text-[16px] leading-[24px] lg:text-[24px] lg:leading-[40px]"
          style={{ fontWeight: 600, color: "#121212", whiteSpace: "pre-line" }}
        >
          {"What type of property\nare you looking for?"}
        </h1>
        <p
          className="text-[12px] leading-[20px] lg:text-[16px] lg:leading-[24px]"
          style={{ fontWeight: 400, color: "#807E7E" }}
        >
          Select all that applies.
        </p>
      </div>

      {/* Property-type pills */}
      <div className="flex flex-wrap gap-x-2 gap-y-4 lg:gap-x-4 lg:gap-y-6">
        {isLoading
          ? [140, 96, 120, 108, 132, 88, 116].map((w, i) => (
              <span
                key={i}
                className="animate-pulse rounded-[8px] bg-[#F6F6F6]"
                style={{ height: "32px", width: `${w}px` }}
              />
            ))
          : types.map((t) => {
              const on = selected.has(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggle(t.id)}
                  aria-pressed={on}
                  className="inline-flex items-center justify-center hover:opacity-90 transition-colors text-[12px] lg:text-[14px] px-2 lg:px-3"
                  style={{
                    height: "32px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    lineHeight: "24px",
                    fontWeight: 500,
                    background: on ? "rgba(120,158,187,0.1)" : "#F6F6F6",
                    color: on ? "#305E82" : "#807E7E",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.displayName}
                </button>
              );
            })}
      </div>

      {/* Complete */}
      <button
        type="button"
        onClick={complete}
        className="flex items-center justify-center self-stretch text-white hover:opacity-90 transition-opacity"
        style={{
          height: "48px",
          padding: "8px 24px",
          gap: "8px",
          background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
          border: "1px solid rgba(120,158,187,0.5)",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Complete Sign up
      </button>
    </OnboardingShell>
  );
}
