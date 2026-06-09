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
    // The current owner/agency's own property analytics (views, inquiries, revenue).
    getMyPropertyAnalytics: builder.query<MyPropertyAnalytics, void>({
      query: () => ({ url: endpoints.propertiesAnalyticsMine, method: "GET" }),
      transformResponse: (res: ApiEnvelope<MyPropertyAnalytics>) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyPropertyAnalyticsQuery } = analyticsApi;
