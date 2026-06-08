export type AccountRole =
  | "Property Owner"
  | "Property Seeker"
  | "Real Estate Agent"
  | "Real Estate Agency or Developer";

const KEY = "rbs-dashboard-role";

export function getRole(): AccountRole | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(KEY);
  return v ? (v as AccountRole) : null;
}

export function setRole(role: AccountRole) {
  localStorage.setItem(KEY, role);
}

export function clearRole() {
  localStorage.removeItem(KEY);
}

export function roleBadgeLabel(role: AccountRole): string {
  if (role === "Real Estate Agency or Developer") return "AGENCY/DEVELOPER";
  return role.toUpperCase();
}
