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
