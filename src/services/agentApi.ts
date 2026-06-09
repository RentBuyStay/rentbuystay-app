import { api } from "./api";
import { endpoints } from "./endpoints";
import type {
  AgencyListItem,
  AgentListItem,
  ApiEnvelope,
  OrganizationSummary,
  Page,
} from "./types";

type ListParams = { q?: string; state?: string; page?: number; size?: number };

const toQuery = (p: ListParams = {}) => {
  const sp = new URLSearchParams();
  sp.set("page", String(p.page ?? 0));
  sp.set("size", String(p.size ?? 50));
  if (p.q) sp.set("search", p.q);
  if (p.state) sp.set("state", p.state);
  return sp.toString();
};

export const agentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAgents: builder.query<Page<AgentListItem>, ListParams | void>({
      query: (params) => ({ url: `${endpoints.agents}?${toQuery(params ?? {})}`, method: "GET" }),
      transformResponse: (res: ApiEnvelope<Page<AgentListItem>>) => res.data,
    }),
    getAgencies: builder.query<Page<AgencyListItem>, ListParams | void>({
      query: (params) => ({ url: `${endpoints.agencies}?${toQuery(params ?? {})}`, method: "GET" }),
      transformResponse: (res: ApiEnvelope<Page<AgencyListItem>>) => res.data,
    }),
    getAgencySummary: builder.query<OrganizationSummary, string>({
      query: (id) => ({ url: endpoints.agencySummary(id), method: "GET" }),
      transformResponse: (res: ApiEnvelope<OrganizationSummary>) => res.data,
    }),
    getAgencyAgents: builder.query<Page<AgentListItem>, { id: string; page?: number; size?: number }>({
      query: ({ id, page = 0, size = 50 }) => ({
        url: `${endpoints.agencyAgents(id)}?page=${page}&size=${size}`,
        method: "GET",
      }),
      transformResponse: (res: ApiEnvelope<Page<AgentListItem>>) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAgentsQuery,
  useGetAgenciesQuery,
  useGetAgencySummaryQuery,
  useGetAgencyAgentsQuery,
} = agentApi;
