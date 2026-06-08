import { api } from "./api";
import { endpoints } from "./endpoints";
import type { ApiEnvelope, SeekerPreferencesResponse } from "./types";

export const seekerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Property-search preferences for the current seeker (GET /me/preferences).
    getSeekerPreferences: builder.query<SeekerPreferencesResponse | null, void>({
      query: () => ({ url: endpoints.mePreferences, method: "GET" }),
      transformResponse: (res: ApiEnvelope<SeekerPreferencesResponse | null>) => res.data ?? null,
      providesTags: [{ type: "Me", id: "PREFERENCES" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSeekerPreferencesQuery } = seekerApi;
