/**
 * Centralised runtime config. Reads NEXT_PUBLIC_* env vars (inlined by Next.js
 * at build time) so every consumer goes through one typed accessor instead of
 * touching process.env directly.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    // Surface misconfiguration loudly in dev; in prod the build would already
    // have inlined the value, so a miss here means the env var was never set.
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[config] Missing env var ${name}. Falling back to empty string.`);
    }
    return "";
  }
  return value.replace(/\/+$/, ""); // strip trailing slashes for clean URL joins
}

export const config = {
  apiBaseUrl: required("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL),
} as const;
