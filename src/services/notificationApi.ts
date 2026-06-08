import { api } from "./api";
import { endpoints } from "./endpoints";
import type {
  ApiEnvelope,
  NotificationCategory,
  NotificationPreference,
  NotificationResponse,
  Page,
} from "./types";

const UNREAD_TAG = { type: "Notifications" as const, id: "UNREAD" };
const LIST_TAG = { type: "Notifications" as const, id: "LIST" };

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Unread badge count. The backend wraps it in the standard envelope; the
    // payload may be a bare number or an object, so normalise to a number.
    getUnreadNotificationCount: builder.query<number, void>({
      query: () => ({ url: endpoints.notificationsUnreadCount, method: "GET" }),
      transformResponse: (res: ApiEnvelope<unknown>) => {
        const d = res.data as
          | number
          | { unread?: number; count?: number; unreadCount?: number; total?: number }
          | null;
        if (typeof d === "number") return d;
        return d?.unread ?? d?.count ?? d?.unreadCount ?? d?.total ?? 0;
      },
      providesTags: [UNREAD_TAG],
    }),

    getNotifications: builder.query<
      Page<NotificationResponse>,
      { page?: number; size?: number; unreadOnly?: boolean } | void
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        sp.set("page", String(params?.page ?? 0));
        sp.set("size", String(params?.size ?? 20));
        if (params?.unreadOnly) sp.set("unreadOnly", "true");
        return { url: `${endpoints.notifications}?${sp.toString()}`, method: "GET" };
      },
      transformResponse: (res: ApiEnvelope<Page<NotificationResponse>>) => res.data,
      providesTags: [LIST_TAG],
    }),

    markNotificationRead: builder.mutation<null, string>({
      query: (id) => ({ url: `${endpoints.notifications}/${id}/read`, method: "POST" }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: [LIST_TAG, UNREAD_TAG],
    }),

    markAllNotificationsRead: builder.mutation<null, void>({
      query: () => ({ url: `${endpoints.notifications}/read-all`, method: "POST" }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: [LIST_TAG, UNREAD_TAG],
    }),

    deleteNotification: builder.mutation<null, string>({
      query: (id) => ({ url: `${endpoints.notifications}/${id}`, method: "DELETE" }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: [LIST_TAG, UNREAD_TAG],
    }),

    // Returns only the categories applicable to the current user's type.
    getNotificationPreferences: builder.query<NotificationPreference[], void>({
      query: () => ({ url: endpoints.notificationPreferences, method: "GET" }),
      transformResponse: (res: ApiEnvelope<NotificationPreference[]>) => res.data,
    }),

    updateNotificationPreference: builder.mutation<
      NotificationPreference,
      { category: NotificationCategory; enabled: boolean }
    >({
      query: ({ category, enabled }) => ({
        url: endpoints.notificationPreference(category),
        method: "PUT",
        body: { enabled },
      }),
      transformResponse: (res: ApiEnvelope<NotificationPreference>) => res.data,
      // Optimistically flip the toggle; revert if the request fails.
      onQueryStarted: async ({ category, enabled }, { dispatch, queryFulfilled }) => {
        const patch = dispatch(
          notificationApi.util.updateQueryData(
            "getNotificationPreferences",
            undefined,
            (draft) => {
              const item = draft.find((p) => p.category === category);
              if (item) item.enabled = enabled;
              else draft.push({ category, enabled });
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUnreadNotificationCountQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferenceMutation,
} = notificationApi;
