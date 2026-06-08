import type { AccountRole } from "./role";

/**
 * Backend user-type enum (see SignupRequest.userType / MeResponse.userType).
 * This is the wire value; the UI uses the friendlier AccountRole label.
 */
export type UserType =
  | "PROPERTY_SEEKER"
  | "PROPERTY_OWNER"
  | "PROPERTY_AGENT"
  | "PROPERTY_AGENCY"
  | "AGENCY_STAFF"
  | "ADMIN"
  | "SUPER_ADMIN";

const TYPE_TO_ROLE: Record<UserType, AccountRole> = {
  PROPERTY_SEEKER: "Property Seeker",
  PROPERTY_OWNER: "Property Owner",
  PROPERTY_AGENT: "Real Estate Agent",
  AGENCY_STAFF: "Real Estate Agent",
  PROPERTY_AGENCY: "Real Estate Agency or Developer",
  ADMIN: "Real Estate Agency or Developer",
  SUPER_ADMIN: "Real Estate Agency or Developer",
};

const ROLE_TO_TYPE: Record<AccountRole, UserType> = {
  "Property Seeker": "PROPERTY_SEEKER",
  "Property Owner": "PROPERTY_OWNER",
  "Real Estate Agent": "PROPERTY_AGENT",
  "Real Estate Agency or Developer": "PROPERTY_AGENCY",
};

export function userTypeToRole(t: UserType): AccountRole {
  return TYPE_TO_ROLE[t];
}

export function roleToUserType(r: AccountRole): UserType {
  return ROLE_TO_TYPE[r];
}
