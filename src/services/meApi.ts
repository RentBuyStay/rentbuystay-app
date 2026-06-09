import { api } from "./api";
import { endpoints } from "./endpoints";
import { setRole, setUser } from "@/features/auth/authSlice";
import { userTypeToRole } from "@/lib/userType";
import type {
  ApiEnvelope,
  MeResponse,
  UpdateProfileRequest,
  UpdateOrganizationRequest,
} from "./types";

export const meApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Consolidated current-user snapshot (user + profile + org + verification +
    // counts). Call after login to resolve the user's role and populate the UI.
    getMe: builder.query<MeResponse, void>({
      query: () => ({ url: endpoints.me, method: "GET" }),
      transformResponse: (res: ApiEnvelope<MeResponse>) => res.data,
      providesTags: ["Me"],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setRole(userTypeToRole(data.userType)));
          dispatch(
            setUser({
              id: data.id,
              email: data.email,
              firstName: data.profile?.firstName,
              lastName: data.profile?.lastName,
            })
          );
        } catch {
          /* unauthenticated or network error — handled by the caller */
        }
      },
    }),

    // Patch the caller's own profile (state/city/bio/company/whatsapp/avatar).
    // Invalidates Me so the snapshot refetches with the saved values.
    updateMyProfile: builder.mutation<MeResponse, UpdateProfileRequest>({
      query: (body) => ({ url: endpoints.meProfile, method: "PATCH", body }),
      transformResponse: (res: ApiEnvelope<MeResponse>) => res.data,
      invalidatesTags: ["Me"],
    }),

    // Agency org-level fields (whatsapp/website/state/city/officeAddress/
    // esvarbonLicence/yearEstablished/bio). Reflected in GET /me organization.
    updateMyOrganization: builder.mutation<MeResponse, UpdateOrganizationRequest>({
      query: (body) => ({ url: endpoints.meOrganization, method: "PATCH", body }),
      transformResponse: (res: ApiEnvelope<MeResponse>) => res.data,
      invalidatesTags: ["Me"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateMyProfileMutation,
  useUpdateMyOrganizationMutation,
} = meApi;
