import { api } from "./api";
import { endpoints } from "./endpoints";
import type { ApiEnvelope, LocationOption, PropertyTypeOption } from "./types";

/** Public reference data used to populate form dropdowns. */
export const referenceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPropertyTypes: builder.query<PropertyTypeOption[], void>({
      query: () => ({ url: endpoints.propertyTypes, method: "GET" }),
      transformResponse: (res: ApiEnvelope<PropertyTypeOption[]>) => res.data,
      keepUnusedDataFor: 600, // rarely changes
    }),
    getLocations: builder.query<LocationOption[], void>({
      query: () => ({ url: endpoints.locations, method: "GET" }),
      transformResponse: (res: ApiEnvelope<LocationOption[]>) => res.data,
      keepUnusedDataFor: 600,
    }),
  }),
  overrideExisting: false,
});

export const { useGetPropertyTypesQuery, useGetLocationsQuery } = referenceApi;
