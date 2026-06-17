/**
 * Central registry of API endpoint paths (relative to NEXT_PUBLIC_API_BASE_URL,
 * which is the backend root — paths are root-level like /auth/login and /me).
 */
export const endpoints = {
  // Auth (device-based flow — see API_README in the backend repo)
  signup: "/auth/signup",
  verifyEmail: "/auth/email/verify",
  setPassword: "/auth/password/set",
  login: "/auth/login",
  verifyDevice: "/auth/login/verify-device",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  logoutAll: "/auth/logout/all",
  resendOtp: "/auth/otp/resend",
  passwordResetRequest: "/auth/password/reset/request",
  passwordResetConfirm: "/auth/password/reset/confirm",
  passwordChange: "/auth/password/change",
  reactivateRequest: "/auth/reactivate/request",
  reactivateConfirm: "/auth/reactivate/confirm",

  // Current user
  me: "/me",
  meProfile: "/me/profile",
  meDeactivate: "/me/deactivate",
  meOrganization: "/me/organization",
  mePreferences: "/me/preferences",
  myProperties: "/me/properties",
  savedProperties: "/me/saved-properties",
  notifications: "/me/notifications",
  notificationsUnreadCount: "/me/notifications/unread-count",
  notificationPreferences: "/me/notification-preferences",
  notificationPreference: (category: string) =>
    `/me/notification-preferences/${category}`,

  // Properties
  properties: "/properties",
  property: (id: string) => `/properties/${id}`,
  propertyArchive: (id: string) => `/properties/${id}/archive`,
  propertyTypes: "/property-types",
  propertiesDiscoveryAll: "/properties/discovery/all",
  propertiesAnalyticsMine: "/properties/analytics/mine",
  propertiesAnalyticsAssigned: "/properties/analytics/assigned",
  propertiesRevenueTotal: "/properties/revenue/total",

  // Property requests
  propertyRequests: "/property-requests",
  propertyRequest: (id: string) => `/property-requests/${id}`,
  propertyRequestContact: (id: string) => `/property-requests/${id}/contact`,

  // Inspections / appointments
  inspections: "/inspections",
  myInspections: "/inspections/my",
  inspectionAction: (id: string, action: "confirm" | "cancel" | "complete") =>
    `/inspections/${id}/${action}`,
  inspectionReschedule: (id: string) => `/inspections/${id}/reschedule`,

  // Conversations / messaging
  conversations: "/me/conversations",
  conversationDirect: "/me/conversations/direct",
  conversationMessages: (id: string) => `/me/conversations/${id}/messages`,
  conversationRead: (id: string) => `/me/conversations/${id}/read`,

  // Subscriptions / billing (Finance)
  subscriptionPlans: "/subscriptions/plans",
  mySubscription: "/subscriptions/my",
  subscriptionBilling: "/subscriptions/billing",
  subscriptionInitiate: (planId: string) => `/subscriptions/initiate/${planId}`,
  subscriptionVerify: (reference: string) => `/subscriptions/verify/${reference}`,
  paymentProviders: "/payments/providers",

  // Files
  fileUpload: "/files/upload",
  fileUploadBatch: "/files/upload/batch",

  // Agents & agencies (Discover)
  agents: "/agents",
  agencies: "/agencies",
  agencyAgents: (id: string) => `/agencies/${id}/agents`,
  agencySummary: (id: string) => `/agencies/${id}/summary`,

  // Agency staff + invitations (org owner)
  orgStaff: (orgId: string) => `/organizations/${orgId}/staff`,
  orgStaffMember: (orgId: string, userId: string) =>
    `/organizations/${orgId}/staff/${userId}`,
  orgStaffSuspend: (orgId: string, userId: string) =>
    `/organizations/${orgId}/staff/${userId}/suspend`,
  orgStaffUnsuspend: (orgId: string, userId: string) =>
    `/organizations/${orgId}/staff/${userId}/unsuspend`,
  orgInvitations: (orgId: string) => `/organizations/${orgId}/invitations`,
  orgInvitation: (orgId: string, invitationId: string) =>
    `/organizations/${orgId}/invitations/${invitationId}`,
  acceptInvitation: (token: string) => `/invitations/${token}/accept`,

  // Reference data
  locations: "/locations",

  // KYC / Identity verification
  kycIdentityStart: "/me/kyc/identity/start",
  kycBusinessStart: "/me/kyc/business/start",

  // Add more resource paths here as you integrate them.
} as const;
