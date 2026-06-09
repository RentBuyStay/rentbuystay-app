import { api } from "./api";
import { endpoints } from "./endpoints";
import type { ApiEnvelope } from "./types";

/** Shape of GET /properties/analytics/mine. */
export type MyPropertyAnalytics = {
  totals: { views: number; inquiries: number; revenue: number };
  deltas: {
    viewsThisWeekChange?: string; // e.g. "+13%", "0%", "-5%"
    viewsThisMonthChange?: string;
  };
  dailyBreakdown: Record<string, number>; // day -> views (empty until there's data)
};

export const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Owner/agency analytics — properties they own/created.
    getMyPropertyAnalytics: builder.query<MyPropertyAnalytics, void>({
      query: () => ({ url: endpoints.propertiesAnalyticsMine, method: "GET" }),
      transformResponse: (res: ApiEnvelope<MyPropertyAnalytics>) => res.data,
    }),
    // Agent analytics — properties assigned to the agent (they don't own any).
    getAssignedPropertyAnalytics: builder.query<MyPropertyAnalytics, void>({
      query: () => ({ url: endpoints.propertiesAnalyticsAssigned, method: "GET" }),
      transformResponse: (res: ApiEnvelope<MyPropertyAnalytics>) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyPropertyAnalyticsQuery,
  useGetAssignedPropertyAnalyticsQuery,
} = analyticsApi;
