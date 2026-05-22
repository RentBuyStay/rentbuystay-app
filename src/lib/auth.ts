import type { AccountRole } from "./role";

type Credential = { email: string; password: string; role: AccountRole };

const CREDENTIALS: Credential[] = [
  { email: "owner@rbs.com", password: "owner123", role: "Property Owner" },
  { email: "seeker@rbs.com", password: "seeker123", role: "Property Seeker" },
];

export function verifyCredentials(email: string, password: string): AccountRole | null {
  const match = CREDENTIALS.find(
    (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
  );
  return match ? match.role : null;
}
