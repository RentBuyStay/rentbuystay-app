/**
 * Stable per-browser device identifier sent as the `X-Device-Id` header on every
 * request. The backend uses it for trusted-device login: an unrecognised device
 * triggers a NEW_DEVICE OTP step (see authApi.login). Persisted so a returning
 * browser stays "trusted" and skips the OTP.
 */
const KEY = "rbs-device-id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
