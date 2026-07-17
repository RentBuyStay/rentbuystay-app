import { api } from "./api";
import { endpoints } from "./endpoints";
import type { ApiEnvelope } from "./types";

/** Daily view breakdown — still returned by GET /properties/analytics/assigned. */
export type MyPropertyAnalytics = {
  totals: { views: number; inquiries: number; revenue: number };
  deltas: {
    viewsThisWeekChange?: string; // e.g. "+13%", "0%", "-5%"
    viewsThisMonthChange?: string;
  };
  dailyBreakdown: Record<string, number>; // day -> views (empty until there's data)
};

/** One dashboard metric tile as prepared by the backend. */
export type DashboardMetric = {
  value: string; // already formatted (e.g. "27", "₦840k")
  delta?: string | null; // e.g. "+13% this week"; null when there's no trend
  label: string; // e.g. "Total Views"
};

/**
 * GET /properties/analytics/mine — the backend now returns a role-aware set of
 * up to six ready-made cards (owner / agent / agency / staff), so the client no
 * longer stitches these together from several endpoints. `card1..card6` are
 * flattened into `cards` (nulls dropped).
 */
export type DashboardMetrics = {
  role: string; // "DEVELOPER_AGENCY" | "PROPERTY_STAFF" | "OWNER" | "PROPERTY_AGENT"
  cards: DashboardMetric[];
};

type DashboardMetricsEnvelope = {
  role: string;
  card1?: DashboardMetric | null;
  card2?: DashboardMetric | null;
  card3?: DashboardMetric | null;
  card4?: DashboardMetric | null;
  card5?: DashboardMetric | null;
  card6?: DashboardMetric | null;
};

export const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Role-aware dashboard cards for the current user (owner/agent/agency/staff).
    getDashboardMetrics: builder.query<DashboardMetrics, number | void>({
      query: (days) => ({
        url: endpoints.propertiesAnalyticsMine,
        method: "GET",
        params: days ? { days } : undefined,
      }),
      transformResponse: (res: ApiEnvelope<DashboardMetricsEnvelope>) => {
        const d = res.data;
        return {
          role: d.role,
          cards: [d.card1, d.card2, d.card3, d.card4, d.card5, d.card6].filter(
            (c): c is DashboardMetric => c != null,
          ),
        };
      },
    }),
    // Agent analytics — daily view breakdown for properties assigned to the agent.
    getAssignedPropertyAnalytics: builder.query<MyPropertyAnalytics, void>({
      query: () => ({ url: endpoints.propertiesAnalyticsAssigned, method: "GET" }),
      transformResponse: (res: ApiEnvelope<MyPropertyAnalytics>) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardMetricsQuery,
  useGetAssignedPropertyAnalyticsQuery,
} = analyticsApi;
