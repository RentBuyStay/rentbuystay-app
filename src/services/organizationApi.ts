import { api } from "./api";
import { endpoints } from "./endpoints";
import type {
  AcceptInvitationRequest,
  AgencyStaffItem,
  ApiEnvelope,
  CreateInvitationRequest,
  InvitationResponse,
  Page,
} from "./types";

type StaffParams = { orgId: string; page?: number; size?: number };

export const organizationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // The agency's own staff/agents — used by Agents Management + the
    // assign-agent picker on the property form.
    getAgencyStaff: builder.query<Page<AgencyStaffItem>, StaffParams>({
      query: ({ orgId, page = 0, size = 50 }) => ({
        url: `${endpoints.orgStaff(orgId)}?page=${page}&size=${size}`,
        method: "GET",
      }),
      transformResponse: (res: ApiEnvelope<Page<AgencyStaffItem>>) => res.data,
      providesTags: [{ type: "AgencyStaff", id: "LIST" }],
    }),

    getInvitations: builder.query<InvitationResponse[], string>({
      query: (orgId) => ({ url: endpoints.orgInvitations(orgId), method: "GET" }),
      transformResponse: (res: ApiEnvelope<InvitationResponse[]>) => res.data,
      providesTags: [{ type: "Invitations", id: "LIST" }],
    }),

    inviteStaff: builder.mutation<
      InvitationResponse,
      { orgId: string; body: CreateInvitationRequest }
    >({
      query: ({ orgId, body }) => ({
        url: endpoints.orgInvitations(orgId),
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiEnvelope<InvitationResponse>) => res.data,
      invalidatesTags: [{ type: "Invitations", id: "LIST" }],
    }),

    cancelInvitation: builder.mutation<null, { orgId: string; invitationId: string }>({
      query: ({ orgId, invitationId }) => ({
        url: endpoints.orgInvitation(orgId, invitationId),
        method: "DELETE",
      }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: [{ type: "Invitations", id: "LIST" }],
    }),

    // Agency owner suspends one of their own agents.
    suspendStaff: builder.mutation<null, { orgId: string; userId: string; reason?: string }>({
      query: ({ orgId, userId, reason }) => ({
        url: endpoints.orgStaffSuspend(orgId, userId),
        method: "POST",
        body: reason ? { reason } : {},
      }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: [{ type: "AgencyStaff", id: "LIST" }],
    }),

    unsuspendStaff: builder.mutation<null, { orgId: string; userId: string }>({
      query: ({ orgId, userId }) => ({
        url: endpoints.orgStaffUnsuspend(orgId, userId),
        method: "POST",
      }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: [{ type: "AgencyStaff", id: "LIST" }],
    }),

    // Permanently remove an agent from the agency.
    removeStaff: builder.mutation<null, { orgId: string; userId: string }>({
      query: ({ orgId, userId }) => ({
        url: endpoints.orgStaffMember(orgId, userId),
        method: "DELETE",
      }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: [{ type: "AgencyStaff", id: "LIST" }],
    }),

    // Public: the invited agent sets their password and joins the org.
    acceptInvitation: builder.mutation<
      InvitationResponse,
      { token: string; body: AcceptInvitationRequest }
    >({
      query: ({ token, body }) => ({
        url: endpoints.acceptInvitation(token),
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiEnvelope<InvitationResponse>) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAgencyStaffQuery,
  useGetInvitationsQuery,
  useInviteStaffMutation,
  useCancelInvitationMutation,
  useSuspendStaffMutation,
  useUnsuspendStaffMutation,
  useRemoveStaffMutation,
  useAcceptInvitationMutation,
} = organizationApi;
