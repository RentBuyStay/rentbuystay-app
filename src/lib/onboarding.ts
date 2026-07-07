import type { UserType } from "./userType";

/**
 * Transient state carried across the multi-page auth wizard (sign-up →
 * verify-email → create-password → log-in) and the login new-device OTP step.
 * Stored in sessionStorage so a refresh mid-flow doesn't lose the email, but it
 * clears when the tab closes. Cleared on successful login.
 */
export type OnboardingFlow = "signup" | "login-device";

export type OnboardingState = {
  email: string;
  userType?: UserType;
  flow: OnboardingFlow;
};

const KEY = "rbs-onboarding";

export function setOnboarding(state: OnboardingState): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(state));
}

export function getOnboarding(): OnboardingState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return null;
  }
}

export function clearOnboarding(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

/**
 * A property-type preference picked during the seeker onboarding step (after
 * create-password, before the first login). Stored separately from the auth
 * onboarding state so it survives clearOnboarding(); applied to
 * PUT /me/preferences on the first successful login, then cleared.
 */
const PENDING_PREF_KEY = "rbs-pending-pref";

export function setPendingPropertyTypeId(id: number): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_PREF_KEY, String(id));
}

export function getPendingPropertyTypeId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_PREF_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function clearPendingPropertyTypeId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_PREF_KEY);
}
