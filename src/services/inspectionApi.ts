import { api } from "./api";
import { endpoints } from "./endpoints";
import type {
  ApiEnvelope,
  InspectionResponse,
  RescheduleInspectionRequest,
  ScheduleInspectionRequest,
} from "./types";

export const inspectionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // All inspections involving the current user (as requester or host).
    getMyInspections: builder.query<InspectionResponse[], void>({
      query: () => ({ url: endpoints.myInspections, method: "GET" }),
      transformResponse: (res: ApiEnvelope<InspectionResponse[]>) => res.data,
      providesTags: [{ type: "Inspections", id: "LIST" }],
    }),

    scheduleInspection: builder.mutation<InspectionResponse, ScheduleInspectionRequest>({
      query: (body) => ({ url: endpoints.inspections, method: "POST", body }),
      transformResponse: (res: ApiEnvelope<InspectionResponse>) => res.data,
      invalidatesTags: [{ type: "Inspections", id: "LIST" }],
    }),

    confirmInspection: builder.mutation<InspectionResponse, string>({
      query: (id) => ({ url: endpoints.inspectionAction(id, "confirm"), method: "PATCH" }),
      transformResponse: (res: ApiEnvelope<InspectionResponse>) => res.data,
      invalidatesTags: [{ type: "Inspections", id: "LIST" }],
    }),

    cancelInspection: builder.mutation<InspectionResponse, string>({
      query: (id) => ({ url: endpoints.inspectionAction(id, "cancel"), method: "PATCH" }),
      transformResponse: (res: ApiEnvelope<InspectionResponse>) => res.data,
      invalidatesTags: [{ type: "Inspections", id: "LIST" }],
    }),

    completeInspection: builder.mutation<InspectionResponse, string>({
      query: (id) => ({ url: endpoints.inspectionAction(id, "complete"), method: "PATCH" }),
      transformResponse: (res: ApiEnvelope<InspectionResponse>) => res.data,
      invalidatesTags: [{ type: "Inspections", id: "LIST" }],
    }),

    rescheduleInspection: builder.mutation<
      InspectionResponse,
      { id: string; body: RescheduleInspectionRequest }
    >({
      query: ({ id, body }) => ({
        url: endpoints.inspectionReschedule(id),
        method: "PATCH",
        body,
      }),
      transformResponse: (res: ApiEnvelope<InspectionResponse>) => res.data,
      invalidatesTags: [{ type: "Inspections", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyInspectionsQuery,
  useScheduleInspectionMutation,
  useConfirmInspectionMutation,
  useCancelInspectionMutation,
  useCompleteInspectionMutation,
  useRescheduleInspectionMutation,
} = inspectionApi;
