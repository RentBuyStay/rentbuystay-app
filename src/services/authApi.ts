import { api } from "./api";
import { endpoints } from "./endpoints";
import { logOut, setCredentials } from "@/features/auth/authSlice";
import type {
  ApiEnvelope,
  ChangePasswordRequest,
  LoginRequest,
  LogoutRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  ResendOtpRequest,
  SendPhoneOtpRequest,
  SendPhoneOtpResponse,
  SetPasswordRequest,
  SignupRequest,
  SignupResponse,
  TokensResponse,
  VerifyDeviceRequest,
  VerifyEmailRequest,
  VerifyPhoneOtpRequest,
} from "./types";

/** Unwrap the { success, data } envelope down to `data`. */
const unwrap = <T>(res: ApiEnvelope<T>): T => res.data;

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Register — returns { userId, email }; triggers an email-verification OTP.
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (body) => ({ url: endpoints.signup, method: "POST", body }),
      transformResponse: unwrap<SignupResponse>,
    }),

    // 2. Verify the 4-digit email OTP.
    verifyEmail: builder.mutation<null, VerifyEmailRequest>({
      query: (body) => ({ url: endpoints.verifyEmail, method: "POST", body }),
      transformResponse: unwrap<null>,
    }),

    // 3. Set the initial password (Argon2id-hashed server-side).
    setPassword: builder.mutation<null, SetPasswordRequest>({
      query: (body) => ({ url: endpoints.setPassword, method: "POST", body }),
      transformResponse: unwrap<null>,
    }),

    // 4. Login. On a NEW/untrusted device this returns HTTP 401 with code
    //    NEW_DEVICE_REQUIRES_OTP (surfaced via the mutation's `error`); the UI
    //    should then collect the OTP and call verifyDevice.
    login: builder.mutation<TokensResponse, LoginRequest>({
      query: (body) => ({ url: endpoints.login, method: "POST", body }),
      transformResponse: unwrap<TokensResponse>,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          /* error (incl. NEW_DEVICE_REQUIRES_OTP) surfaces on the mutation result */
        }
      },
      invalidatesTags: ["Auth", "Me"],
    }),

    // 5. Verify the NEW_DEVICE OTP — trusts the device and issues tokens.
    verifyDevice: builder.mutation<TokensResponse, VerifyDeviceRequest>({
      query: (body) => ({ url: endpoints.verifyDevice, method: "POST", body }),
      transformResponse: unwrap<TokensResponse>,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          /* handled by caller */
        }
      },
      invalidatesTags: ["Auth", "Me"],
    }),

    logout: builder.mutation<null, LogoutRequest>({
      query: (body) => ({ url: endpoints.logout, method: "POST", body }),
      transformResponse: unwrap<null>,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logOut()); // clear locally regardless of server outcome
        }
      },
      invalidatesTags: ["Auth", "Me"],
    }),

    resendOtp: builder.mutation<null, ResendOtpRequest>({
      query: (body) => ({ url: endpoints.resendOtp, method: "POST", body }),
      transformResponse: unwrap<null>,
    }),

    requestPasswordReset: builder.mutation<null, PasswordResetRequest>({
      query: (body) => ({
        url: endpoints.passwordResetRequest,
        method: "POST",
        body,
      }),
      transformResponse: unwrap<null>,
    }),

    confirmPasswordReset: builder.mutation<null, PasswordResetConfirmRequest>({
      query: (body) => ({
        url: endpoints.passwordResetConfirm,
        method: "POST",
        body,
      }),
      transformResponse: unwrap<null>,
    }),

    // Logged-in password change.
    changePassword: builder.mutation<null, ChangePasswordRequest>({
      query: (body) => ({
        url: endpoints.passwordChange,
        method: "POST",
        body,
      }),
      transformResponse: unwrap<null>,
    }),

    sendPhoneOtp: builder.mutation<SendPhoneOtpResponse, SendPhoneOtpRequest>({
      query: (body) => ({ url: endpoints.sendPhoneOtp, method: "POST", body }),
      transformResponse: unwrap<SendPhoneOtpResponse>,
    }),

    verifyPhoneOtp: builder.mutation<null, VerifyPhoneOtpRequest>({
      query: (body) => ({ url: endpoints.verifyPhoneOtp, method: "POST", body }),
      transformResponse: unwrap<null>,
      invalidatesTags: ["Me"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSignupMutation,
  useVerifyEmailMutation,
  useSetPasswordMutation,
  useLoginMutation,
  useVerifyDeviceMutation,
  useLogoutMutation,
  useResendOtpMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useChangePasswordMutation,
  useSendPhoneOtpMutation,
  useVerifyPhoneOtpMutation,
} = authApi;
