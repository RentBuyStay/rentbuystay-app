import { api } from "./api";
import { endpoints } from "./endpoints";
import type {
  ApiEnvelope,
  ConversationResponse,
  CreatePropertyRequestRequest,
  Page,
  PropertyRequestResponse,
} from "./types";

export type RequestListParams = {
  listingType?: string;
  propertyTypeId?: number;
  state?: string;
  page?: number;
  size?: number;
};

const toQuery = (p: RequestListParams = {}) => {
  const sp = new URLSearchParams();
  sp.set("page", String(p.page ?? 0));
  sp.set("size", String(p.size ?? 50));
  if (p.listingType) sp.set("listingType", p.listingType);
  if (p.propertyTypeId != null) sp.set("propertyTypeId", String(p.propertyTypeId));
  if (p.state) sp.set("state", p.state);
  return sp.toString();
};

export const propertyRequestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPropertyRequests: builder.query<Page<PropertyRequestResponse>, RequestListParams | void>({
      query: (params) => ({
        url: `${endpoints.propertyRequests}?${toQuery(params ?? {})}`,
        method: "GET",
      }),
      transformResponse: (res: ApiEnvelope<Page<PropertyRequestResponse>>) => res.data,
      providesTags: [{ type: "PropertyRequests", id: "LIST" }],
    }),

    createPropertyRequest: builder.mutation<PropertyRequestResponse, CreatePropertyRequestRequest>({
      query: (body) => ({ url: endpoints.propertyRequests, method: "POST", body }),
      transformResponse: (res: ApiEnvelope<PropertyRequestResponse>) => res.data,
      invalidatesTags: [{ type: "PropertyRequests", id: "LIST" }],
    }),

    deletePropertyRequest: builder.mutation<null, string>({
      query: (id) => ({ url: endpoints.propertyRequest(id), method: "DELETE" }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: [{ type: "PropertyRequests", id: "LIST" }],
    }),

    // Opens a conversation with the request's poster and sends the first message.
    contactPropertyRequest: builder.mutation<
      ConversationResponse,
      { id: string; message: string }
    >({
      query: ({ id, message }) => ({
        url: endpoints.propertyRequestContact(id),
        method: "POST",
        body: { message },
      }),
      transformResponse: (res: ApiEnvelope<ConversationResponse>) => res.data,
      invalidatesTags: [{ type: "Conversations", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPropertyRequestsQuery,
  useCreatePropertyRequestMutation,
  useDeletePropertyRequestMutation,
  useContactPropertyRequestMutation,
} = propertyRequestApi;
