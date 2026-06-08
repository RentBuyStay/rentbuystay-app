import { api } from "./api";
import { endpoints } from "./endpoints";
import type {
  ApiEnvelope,
  ArchiveReason,
  CreatePropertyRequest,
  Page,
  PropertyResponse,
} from "./types";

export type PageParams = { page?: number; size?: number; q?: string };

const toQuery = (params: PageParams = {}) => {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page ?? 0));
  sp.set("size", String(params.size ?? 12));
  if (params.q) sp.set("q", params.q);
  return sp.toString();
};

export const propertyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // The current owner/agent's own listings (all statuses).
    getMyProperties: builder.query<Page<PropertyResponse>, PageParams | void>({
      query: (params) => ({
        url: `${endpoints.myProperties}?${toQuery(params ?? {})}`,
        method: "GET",
      }),
      transformResponse: (res: ApiEnvelope<Page<PropertyResponse>>) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((p) => ({ type: "Property" as const, id: p.id })),
              { type: "Properties" as const, id: "MINE" },
            ]
          : [{ type: "Properties" as const, id: "MINE" }],
    }),

    // Public directory of ACTIVE (approved) listings — used e.g. to pick a
    // property to request an inspection on.
    getActiveProperties: builder.query<Page<PropertyResponse>, PageParams | void>({
      query: (params) => ({
        url: `${endpoints.properties}?${toQuery(params ?? {})}`,
        method: "GET",
      }),
      transformResponse: (res: ApiEnvelope<Page<PropertyResponse>>) => res.data,
      providesTags: [{ type: "Properties", id: "PUBLIC" }],
    }),

    getProperty: builder.query<PropertyResponse, string>({
      query: (id) => ({ url: endpoints.property(id), method: "GET" }),
      transformResponse: (res: ApiEnvelope<PropertyResponse>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Property", id }],
    }),

    createProperty: builder.mutation<PropertyResponse, CreatePropertyRequest>({
      query: (body) => ({ url: endpoints.properties, method: "POST", body }),
      transformResponse: (res: ApiEnvelope<PropertyResponse>) => res.data,
      invalidatesTags: [{ type: "Properties", id: "MINE" }],
    }),

    updateProperty: builder.mutation<
      PropertyResponse,
      { id: string; body: Partial<CreatePropertyRequest> }
    >({
      query: ({ id, body }) => ({ url: endpoints.property(id), method: "PUT", body }),
      transformResponse: (res: ApiEnvelope<PropertyResponse>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Property", id },
        { type: "Properties", id: "MINE" },
      ],
    }),

    archiveProperty: builder.mutation<
      PropertyResponse,
      { id: string; reason: ArchiveReason }
    >({
      query: ({ id, reason }) => ({
        url: endpoints.propertyArchive(id),
        method: "PATCH",
        body: { reason },
      }),
      transformResponse: (res: ApiEnvelope<PropertyResponse>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Property", id },
        { type: "Properties", id: "MINE" },
      ],
    }),

    deleteProperty: builder.mutation<null, string>({
      query: (id) => ({ url: endpoints.property(id), method: "DELETE" }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: "Property", id },
        { type: "Properties", id: "MINE" },
      ],
    }),

    // --- Saved properties (seeker) ---
    getSavedProperties: builder.query<Page<PropertyResponse>, PageParams | void>({
      query: (params) => ({
        url: `${endpoints.savedProperties}?${toQuery(params ?? {})}`,
        method: "GET",
      }),
      transformResponse: (res: ApiEnvelope<Page<PropertyResponse>>) => res.data,
      providesTags: [{ type: "SavedProperties", id: "LIST" }],
    }),

    saveProperty: builder.mutation<null, string>({
      query: (propertyId) => ({
        url: `${endpoints.savedProperties}/${propertyId}`,
        method: "POST",
      }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: [{ type: "SavedProperties", id: "LIST" }],
    }),

    unsaveProperty: builder.mutation<null, string>({
      query: (propertyId) => ({
        url: `${endpoints.savedProperties}/${propertyId}`,
        method: "DELETE",
      }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: [{ type: "SavedProperties", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyPropertiesQuery,
  useGetActivePropertiesQuery,
  useGetSavedPropertiesQuery,
  useSavePropertyMutation,
  useUnsavePropertyMutation,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useArchivePropertyMutation,
  useDeletePropertyMutation,
} = propertyApi;
