import { api } from "./api";
import { endpoints } from "./endpoints";
import { setRole, setUser } from "@/features/auth/authSlice";
import { userTypeToRole } from "@/lib/userType";
import type {
  ApiEnvelope,
  MeResponse,
  UpdateProfileRequest,
  UpdateOrganizationRequest,
  KycVerificationRow,
  SubmitIdentityKycRequest,
  SubmitBusinessKycRequest,
  SubmitIdentitySelfieRequest,
  SubmitWidgetResultRequest,
  KycSdkInitResponse,
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
      query: (body) => ({
        url: endpoints.meOrganization,
        method: "PUT",
        body,
      }),
      transformResponse: (res: ApiEnvelope<MeResponse>) => res.data,
      invalidatesTags: ["Me"],
    }),

    // Dojah identity verification: submit an ID number (+ DOB for licence/passport).
    // Verified server-side via Dojah; returns a PENDING row, result arrives async.
    submitKycIdentity: builder.mutation<KycVerificationRow, SubmitIdentityKycRequest>({
      query: (body) => ({ url: endpoints.kycIndividual, method: "POST", body }),
      transformResponse: (res: ApiEnvelope<KycVerificationRow>) => res.data,
      invalidatesTags: ["Me"],
    }),

    // Dojah identity + selfie/face check (NIN/BVN/vNIN). Routes to the per-type
    // endpoint whose body field the backend expects (nin / bvn / vnin).
    submitKycIdentitySelfie: builder.mutation<KycVerificationRow, SubmitIdentitySelfieRequest>({
      query: ({ documentType, documentNumber, selfieImage }) => {
        const route = {
          NIN: { url: endpoints.kycNin, field: "nin" },
          BVN: { url: endpoints.kycBvn, field: "bvn" },
          VNIN: { url: endpoints.kycVnin, field: "vnin" },
        }[documentType];
        return { url: route.url, method: "POST", body: { [route.field]: documentNumber, selfieImage } };
      },
      transformResponse: (res: ApiEnvelope<KycVerificationRow>) => res.data,
      invalidatesTags: ["Me"],
    }),

    // Record a Dojah Web widget verification outcome (individuals).
    submitKycWidgetResult: builder.mutation<KycVerificationRow, SubmitWidgetResultRequest>({
      query: (body) => ({ url: endpoints.kycWidgetResult, method: "POST", body }),
      transformResponse: (res: ApiEnvelope<KycVerificationRow>) => res.data,
      invalidatesTags: ["Me"],
    }),

    // Dojah business (CAC / Tax ID) verification for agencies.
    submitKycBusiness: builder.mutation<KycVerificationRow, SubmitBusinessKycRequest>({
      query: (body) => ({ url: endpoints.kycBusiness, method: "POST", body }),
      transformResponse: (res: ApiEnvelope<KycVerificationRow>) => res.data,
      invalidatesTags: ["Me"],
    }),

    // Starts a Dojah business (KYB) workflow — returns a customerReference to
    // pass to the Dojah widget as metadata; the outcome arrives via the webhook.
    startBusinessKyc: builder.mutation<KycSdkInitResponse, void>({
      query: () => ({ url: endpoints.kycBusinessStart, method: "POST" }),
      transformResponse: (res: ApiEnvelope<KycSdkInitResponse>) => res.data,
    }),

    // Self-service account deactivation (POST /me/deactivate, no body).
    deactivateAccount: builder.mutation<null, void>({
      query: () => ({ url: endpoints.meDeactivate, method: "POST" }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateMyProfileMutation,
  useUpdateMyOrganizationMutation,
  useSubmitKycIdentityMutation,
  useSubmitKycIdentitySelfieMutation,
  useSubmitKycWidgetResultMutation,
  useSubmitKycBusinessMutation,
  useStartBusinessKycMutation,
  useDeactivateAccountMutation,
} = meApi;
