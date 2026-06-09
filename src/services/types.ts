import type { UserType } from "@/lib/userType";

/**
 * Every backend response is wrapped in this envelope (shared/api/ApiResponse).
 * Success: { success:true, data: T, ... }. Error: { success:false, code, message,
 * errors? }. Endpoints unwrap `data` via transformResponse; errors surface as the
 * raw envelope on the RTK Query error object (see unwrapApiError).
 */
export type FieldError = { field: string; message: string };

export type ApiEnvelope<T> = {
  success: boolean;
  code: string;
  message: string | null;
  data: T;
  errors: FieldError[] | null;
  timestamp: string;
  path: string | null;
};

// --- Auth ---

/** TokensResponse from the backend (data of login / verify-device / refresh). */
export type TokensResponse = {
  userId: string;
  tokenType: string; // "Bearer"
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

export type OtpPurpose =
  | "EMAIL_VERIFY"
  | "PHONE_VERIFY"
  | "PASSWORD_RESET"
  | "EMAIL_CHANGE"
  | "LOGIN_2FA"
  | "NEW_DEVICE"
  | "REACTIVATION";

export type SignupRequest = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userType: UserType;
};

export type SignupResponse = { userId: string; email: string };

export type VerifyEmailRequest = { email: string; code: string };
export type SetPasswordRequest = { email: string; password: string };
export type LoginRequest = { email: string; password: string };
export type VerifyDeviceRequest = { email: string; code: string };
export type RefreshTokenRequest = { refreshToken: string };
export type LogoutRequest = { refreshToken: string };
export type ResendOtpRequest = { email: string; purpose: OtpPurpose };
export type PasswordResetRequest = { email: string };
export type PasswordResetConfirmRequest = {
  email: string;
  code: string;
  newPassword: string;
};

/** Error code returned (HTTP 401) when logging in from an unrecognised device. */
export const NEW_DEVICE_REQUIRES_OTP = "NEW_DEVICE_REQUIRES_OTP";

// --- Current user (GET /me) ---

// --- Pagination (Spring Page<T>) ---

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
};

// --- Properties ---

export type ListingType = "RENT" | "BUY" | "SHORTLET";
export type PriceFrequency =
  | "PER_NIGHT"
  | "PER_WEEK"
  | "PER_MONTH"
  | "PER_YEAR"
  | "OUTRIGHT";
export type PropertyStatus =
  | "DRAFT"
  | "AWAITING_APPROVAL"
  | "ACTIVE"
  | "ARCHIVED"
  | "REJECTED"
  | "LIMIT_EXCEEDED";

export type PhotoRef = { id?: string; url: string; sortOrder?: number; isPrimary?: boolean };
export type ChargeRef = {
  id?: string;
  title: string;
  amount: number;
  currency?: string;
  sortOrder?: number;
};
export type AmenityRef = { id: number; name: string; slug?: string };

export type PropertyResponse = {
  id: string;
  referenceCode: string;
  title: string;
  description?: string;
  propertyTypeId?: number;
  propertyTypeName?: string;
  listingType: ListingType;
  price: number;
  priceFrequency: PriceFrequency;
  currency?: string;
  state: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  totalAreaSqm?: number;
  yearBuilt?: number;
  status: PropertyStatus;
  archiveReason?: string;
  rejectionReason?: string;
  viewCount?: number;
  listedAt?: string;
  isFurnished?: boolean;
  ownerUserId?: string;
  ownerName?: string;
  organizationId?: string;
  assignedAgentUserId?: string;
  assignedAgentName?: string;
  amenities?: AmenityRef[];
  photos?: PhotoRef[];
  charges?: ChargeRef[];
  createdAt?: string;
  updatedAt?: string;
};

export type PropertyPhotoInput = { url: string; isPrimary?: boolean };
export type PropertyChargeInput = { title: string; amount: number; currency?: string };

export type CreatePropertyRequest = {
  title: string;
  description?: string;
  propertyTypeId: number;
  listingType: ListingType;
  price: number;
  priceFrequency: PriceFrequency;
  state: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  totalAreaSqm?: number;
  yearBuilt?: number;
  amenityIds?: number[];
  customAmenities?: string[];
  photos?: PropertyPhotoInput[];
  charges?: PropertyChargeInput[];
  assignedAgentUserId?: string;
};

export type ArchiveReason = "RENTED" | "SOLD" | "OTHER";

// --- Reference data ---

export type PropertyTypeOption = { id: number; code: string; displayName: string };
export type LocationOption = {
  id: number;
  name: string;
  city: string;
  state: string;
  country: string;
};

// --- Seeker preferences (GET /me/preferences) ---

export type SeekerPreferencesResponse = {
  lookingFor?: string; // RENT | BUY | SHORTLET
  propertyTypeId?: number;
  propertyTypeName?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  preferredLocations?: LocationOption[];
};

// --- Agents & agencies (Discover) ---

export type AgentListItem = {
  userId: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  email?: string;
  organizationId?: string;
  organizationName?: string;
  // Present only once the backend adds them to the /agents directory DTO
  // (the profile is already loaded server-side — see AgentDirectoryService).
  state?: string;
  city?: string;
  bio?: string;
  listingCount?: number;
  identityVerified?: boolean;
  professionalLicenseVerified?: boolean;
  online?: boolean;
  lastSeenAt?: string;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
};

/** Body for PATCH /me/profile — every field optional; server enforces which
 *  fields are allowed for the caller's user type. */
export type UpdateProfileRequest = {
  state?: string;
  city?: string;
  bio?: string;
  companyName?: string;
  companyRegNumber?: string;
  whatsappNumber?: string;
  avatarUrl?: string;
};

export type OrganizationSummary = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  website?: string;
  bio?: string;
  agentCount: number;
  propertyCount: number;
};

export type AgencyListItem = {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  registrationNumber?: string;
  status?: string;
  businessVerified?: boolean;
  ownerUserId?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  agentCount?: number;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
};

// --- Property requests (seekers post what they're looking for) ---

export type SeekerType = "INDIVIDUAL" | "CORPORATE" | "REAL_ESTATE_AGENT" | "DEVELOPER";

export type PropertyRequestResponse = {
  id: string;
  posterUserId: string;
  posterFirstName?: string;
  posterLastName?: string;
  title: string;
  seekerType: SeekerType;
  listingType: ListingType;
  propertyTypeId?: number;
  propertyTypeName?: string;
  state: string;
  city?: string;
  bedrooms?: number;
  budget?: number;
  comments?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePropertyRequestRequest = {
  title: string;
  seekerType: SeekerType;
  listingType: ListingType;
  propertyTypeId?: number;
  state: string;
  city?: string;
  bedrooms?: number;
  budget?: number;
  comments?: string;
};

// --- Conversations / messaging ---

export type ConversationParticipant = {
  userId: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  lastDeliveredAt?: string;
  lastReadAt?: string;
  online?: boolean;
  lastSeenAt?: string;
};

export type ConversationResponse = {
  id: string;
  type: string;
  title?: string;
  participants: ConversationParticipant[];
  lastMessageAt?: string;
  lastReadAt?: string;
  unreadCount: number;
  createdAt?: string;
};

export type MessageResponse = {
  id: string;
  conversationId: string;
  senderUserId: string;
  type?: string;
  body: string;
  createdAt: string;
  editedAt?: string;
};

export type SendMessageRequest = {
  body: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
};

// --- Inspections / appointments ---

export type InspectionStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type InspectionResponse = {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  requesterUserId: string;
  requesterName?: string;
  hostUserId: string;
  hostName?: string;
  preferredDate: string;
  preferredTime: string;
  note?: string;
  status: InspectionStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ScheduleInspectionRequest = {
  propertyId: string;
  hostUserId: string;
  preferredDate: string;
  preferredTime: string;
  note?: string;
};

export type RescheduleInspectionRequest = {
  preferredDate: string;
  preferredTime: string;
  note?: string;
};

// --- Subscriptions / billing (Finance) ---

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  listingLimit?: number;
  featuredLimit?: number;
  isActive?: boolean;
  description?: string;
  targetRole?: string;
  durationDays?: number;
  agentSeats?: number;
  features?: string; // newline/comma-separated on the wire
  createdAt?: string;
  updatedAt?: string;
};

export type UserSubscription = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startsAt?: string;
  endsAt?: string;
  autoRenew?: boolean;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BillingTransaction = {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  status: string;
  referenceId: string;
  planName?: string;
  createdAt: string;
};

export type PaymentInitiateResponse = {
  authorizationUrl: string;
  reference: string;
  planName?: string;
  amount?: number;
};

// --- Notification preferences ---

export type NotificationCategory =
  | "PROMOTIONS"
  | "NEW_INQUIRIES_MESSAGES"
  | "LISTING_EXPIRY_REMINDERS"
  | "WEEKLY_PERFORMANCE_REPORT"
  | "APPOINTMENT_CONFIRMATIONS"
  | "SUBSCRIPTION_RENEWAL"
  | "AGENT_ACTIVITY"
  | "NEW_PROPERTIES_MATCHING"
  | "PRICE_CHANGES_SAVED"
  | "APPOINTMENT_REMINDERS"
  | "PLATFORM_ALERTS";

export type NotificationPreference = {
  category: NotificationCategory;
  enabled: boolean;
};

export type NotificationResponse = {
  id: string;
  type: string;
  title: string;
  body: string;
  payload?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
};

// --- Current user (GET /me) ---

export type MeResponse = {
  id: string;
  email: string;
  userType: UserType;
  status: string;
  organizationId?: string;
  emailVerifiedAt?: string;
  joinedAt?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    avatarUrl?: string;
    state?: string;
    city?: string;
    bio?: string;
    companyName?: string;
    lastLoginAt?: string;
  };
  organization?: { id?: string; name?: string; [k: string]: unknown };
  verification?: {
    email?: { verified: boolean; verifiedAt?: string };
    phone?: { verified: boolean; verifiedAt?: string };
    identity?: { verified: boolean };
    business?: { verified: boolean };
    complete?: boolean;
  };
  counts?: {
    unreadNotifications: number;
    activeSessions: number;
    devices: number;
  };
};
