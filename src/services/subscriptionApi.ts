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

    getPaymentProviders: builder.query<string[], void>({
      query: () => ({ url: endpoints.paymentProviders, method: "GET" }),
      transformResponse: (res: ApiEnvelope<string[]>) => res.data,
      keepUnusedDataFor: 3600,
    }),

    // Starts a checkout; redirect the browser to authorizationUrl.
    initiateSubscription: builder.mutation<PaymentInitiateResponse, { planId: string; provider?: string }>({
      query: ({ planId, provider }) => {
        let url = endpoints.subscriptionInitiate(planId);
        if (provider) {
          url += `?provider=${provider}`;
        }
        return { url, method: "POST" };
      },
      transformResponse: (res: ApiEnvelope<PaymentInitiateResponse>) => res.data,
    }),

    // PATCH /subscriptions/my/auto-renew — toggles auto-renew on the active sub.
    // Turning it ON without a saved card returns an authorizationUrl (redirect to
    // add a card); otherwise the change is applied and the response is null.
    toggleAutoRenew: builder.mutation<PaymentInitiateResponse | null, boolean>({
      query: (autoRenew) => ({ url: endpoints.subscriptionAutoRenew, method: "PATCH", body: { autoRenew } }),
      transformResponse: (res: ApiEnvelope<PaymentInitiateResponse | null>) => res.data ?? null,
      invalidatesTags: [{ type: "Subscription", id: "ME" }],
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
  useGetPaymentProvidersQuery,
  useInitiateSubscriptionMutation,
  useVerifySubscriptionMutation,
  useToggleAutoRenewMutation,
} = subscriptionApi;
