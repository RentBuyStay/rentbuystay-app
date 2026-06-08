import { api } from "./api";
import { endpoints } from "./endpoints";
import type {
  ApiEnvelope,
  BillingTransaction,
  Page,
  PaymentInitiateResponse,
  SubscriptionPlan,
  UserSubscription,
} from "./types";

export const subscriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
      query: () => ({ url: endpoints.subscriptionPlans, method: "GET" }),
      transformResponse: (res: ApiEnvelope<SubscriptionPlan[]>) => res.data,
      keepUnusedDataFor: 600,
    }),

    // Current subscription; may be absent if the user has never subscribed.
    getMySubscription: builder.query<UserSubscription | null, void>({
      query: () => ({ url: endpoints.mySubscription, method: "GET" }),
      transformResponse: (res: ApiEnvelope<UserSubscription | null>) => res.data ?? null,
      providesTags: [{ type: "Subscription", id: "ME" }],
    }),

    getBilling: builder.query<Page<BillingTransaction>, { page?: number; size?: number } | void>({
      query: (params) => {
        const sp = new URLSearchParams();
        sp.set("page", String(params?.page ?? 0));
        sp.set("size", String(params?.size ?? 20));
        return { url: `${endpoints.subscriptionBilling}?${sp.toString()}`, method: "GET" };
      },
      transformResponse: (res: ApiEnvelope<Page<BillingTransaction>>) => res.data,
      providesTags: [{ type: "Billing", id: "LIST" }],
    }),

    // Starts a Paystack checkout; redirect the browser to authorizationUrl.
    initiateSubscription: builder.mutation<PaymentInitiateResponse, string>({
      query: (planId) => ({ url: endpoints.subscriptionInitiate(planId), method: "POST" }),
      transformResponse: (res: ApiEnvelope<PaymentInitiateResponse>) => res.data,
    }),

    // Called after returning from Paystack with ?reference=.
    verifySubscription: builder.mutation<unknown, string>({
      query: (reference) => ({ url: endpoints.subscriptionVerify(reference), method: "GET" }),
      transformResponse: (res: ApiEnvelope<unknown>) => res.data,
      invalidatesTags: [
        { type: "Subscription", id: "ME" },
        { type: "Billing", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  useGetBillingQuery,
  useInitiateSubscriptionMutation,
  useVerifySubscriptionMutation,
} = subscriptionApi;
