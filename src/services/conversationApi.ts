import { api } from "./api";
import { endpoints } from "./endpoints";
import type {
  ApiEnvelope,
  ConversationResponse,
  MessageResponse,
  SendMessageRequest,
} from "./types";

export const conversationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<ConversationResponse[], void>({
      query: () => ({ url: endpoints.conversations, method: "GET" }),
      transformResponse: (res: ApiEnvelope<ConversationResponse[]>) => res.data,
      providesTags: [{ type: "Conversations", id: "LIST" }],
    }),

    getMessages: builder.query<
      MessageResponse[],
      { id: string; before?: string; limit?: number }
    >({
      query: ({ id, before, limit = 50 }) => {
        const sp = new URLSearchParams({ limit: String(limit) });
        if (before) sp.set("before", before);
        return { url: `${endpoints.conversationMessages(id)}?${sp.toString()}`, method: "GET" };
      },
      transformResponse: (res: ApiEnvelope<MessageResponse[]>) => res.data,
      providesTags: (_r, _e, { id }) => [{ type: "Messages", id }],
    }),

    sendMessage: builder.mutation<MessageResponse, SendMessageRequest & { id: string }>({
      query: ({ id, ...body }) => ({
        url: endpoints.conversationMessages(id),
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiEnvelope<MessageResponse>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Messages", id },
        { type: "Conversations", id: "LIST" },
      ],
    }),

    markConversationRead: builder.mutation<null, string>({
      query: (id) => ({ url: endpoints.conversationRead(id), method: "POST" }),
      transformResponse: (res: ApiEnvelope<null>) => res.data,
      invalidatesTags: [{ type: "Conversations", id: "LIST" }],
    }),

    openDirectConversation: builder.mutation<ConversationResponse, string>({
      query: (otherUserId) => ({
        url: endpoints.conversationDirect,
        method: "POST",
        body: { otherUserId },
      }),
      transformResponse: (res: ApiEnvelope<ConversationResponse>) => res.data,
      invalidatesTags: [{ type: "Conversations", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
  useOpenDirectConversationMutation,
} = conversationApi;
