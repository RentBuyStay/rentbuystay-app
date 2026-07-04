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

/** Body for POST /auth/password/change (logged-in password change). */
export type ChangePasswordRequest = {
  currentPassword: string;
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
  listerVerified?: boolean;
  amenities?: AmenityRef[];
  photos?: PhotoRef[];
  charges?: ChargeRef[];
  createdAt?: string;
  updatedAt?: string;
};

export type PropertyPhotoInput = { uploadedFileId: string; isPrimary?: boolean };
export type PropertyChargeInput = { title: string; amount: number; currency?: string };

/**
 * NOTE: the backend deserialises this as a strict record — EVERY field must be
 * present in the JSON body (missing keys → 400 "Malformed or unreadable request
 * body"). Optionals are sent as null/[]/false rather than omitted. Build the
 * full payload (see PropertyForm.handleSubmit / buildCreatePropertyBody).
 */
export type CreatePropertyRequest = {
  title: string;
  description?: string | null;
  propertyTypeId: number;
  listingType: ListingType;
  price: number;
  priceFrequency: PriceFrequency;
  state: string;
  city: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  totalAreaSqm?: number | null;
  yearBuilt?: number | null;
  isFurnished?: boolean;
  isServiced?: boolean;
  isShared?: boolean;
  amenityIds?: number[];
  customAmenities?: string[];
  photos?: PropertyPhotoInput[];
  charges?: PropertyChargeInput[];
  assignedAgentUserId?: string | null;
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

/** Body for PUT /me/preferences. preferredLocations are location IDs (max 3). */
export type UpdateSeekerPreferencesRequest = {
  lookingFor?: "RENT" | "BUY" | "SHORTLET";
  propertyTypeId?: number;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  preferredLocations?: number[];
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
  avatarFileId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
};

/** Body for PATCH /me/organization — agency org-level fields (display read from
 *  MeResponse.organization). Org name + registrationNumber are set at signup and
 *  are not editable here. */
export type UpdateOrganizationRequest = {
  whatsappNumber?: string;
  website?: string;
  state?: string;
  city?: string;
  officeAddress?: string;
  esvarbonLicenceNumber?: string;
  yearEstablished?: number;
  bio?: string;
  logoUrl?: string;
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

// --- Agency staff + invitations ---

export type AgencyStaffItem = {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  avatarUrl?: string;
  userType?: UserType;
  status?: string; // PENDING | ACTIVE | SUSPENDED | DEACTIVATED
  city?: string;
  state?: string;
  averageRating?: number;
  reviewCount?: number;
  listingCount?: number;
  joinedAt?: string;
};

export type CreateInvitationRequest = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
};

export type InvitationResponse = {
  id: string;
  organizationId: string;
  organizationName?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  status: string; // PENDING | ACCEPTED | EXPIRED | CANCELLED
  expiresAt?: string;
  acceptedAt?: string;
  createdAt?: string;
};

export type AcceptInvitationRequest = { password: string };

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
  avatarUrl?: string;
  verified?: boolean;
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
  attachments?: { id: string; url: string; type: string; name: string }[];
  createdAt: string;
  editedAt?: string;
};

export type SendMessageRequest = {
  body: string;
  attachmentFileIds?: string[];
};

export type KycSdkInitResponse = {
  verificationId: string;
  customerReference: string;
  flowId: number;
  clientId: string;
  token: string;
};

// --- KYC (Dojah direct-submit) ---

export type KycDocumentType =
  | "NIN"
  | "BVN"
  | "VNIN"
  | "VOTERS_CARD"
  | "DRIVERS_LICENSE"
  | "PASSPORT";

export type SubmitIdentityKycRequest = {
  documentType: KycDocumentType;
  documentNumber: string;
  dateOfBirth?: string; // ISO YYYY-MM-DD, required for DRIVERS_LICENSE + PASSPORT
};

export type BusinessVerificationType = "CAC_REGISTRATION" | "TAX_ID" | "PROFESSIONAL_BUSINESS";

export type SubmitBusinessKycRequest = {
  verificationType: BusinessVerificationType;
  documentNumber: string;
  companyType?: string;
};

/** ID types that carry a selfie for face verification (Tier 2). */
export type SelfieDocumentType = "NIN" | "BVN" | "VNIN";

export type SubmitIdentitySelfieRequest = {
  documentType: SelfieDocumentType;
  documentNumber: string;
  selfieImage: string; // base64 JPEG (data-URL prefix is stripped server-side)
};

export type SubmitWidgetResultRequest = {
  verified: boolean;
  documentType?: string;
  referenceId?: string;
};

/** Verification row returned by the KYC submit endpoints. */
export type KycVerificationRow = {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "VERIFIED" | "REJECTED" | "EXPIRED" | "FAILED";
  documentType?: string;
  verificationType?: string;
  rejectionReason?: string;
  createdAt?: string;
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
  // From MySubscriptionResponse (GET /subscriptions/my) — the user's default saved card.
  cardBrand?: string;
  last4?: string;
  cardExpiry?: string; // "MM/YY"
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
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
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
  organization?: {
    id?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    website?: string;
    state?: string;
    city?: string;
    officeAddress?: string;
    registrationNumber?: string;
    esvarbonLicenceNumber?: string;
    yearEstablished?: number;
    bio?: string;
    logoUrl?: string;
  };
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

export type SendPhoneOtpRequest = { phoneNumber: string };
export type SendPhoneOtpResponse = { pinId: string };
export type VerifyPhoneOtpRequest = { otp: string };
