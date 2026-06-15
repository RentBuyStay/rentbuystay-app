"use client";

import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { config } from "@/lib/config";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/features/auth/authSlice";
import { conversationApi } from "@/services/conversationApi";
import type { MessageResponse } from "@/services/types";

/** Shape the backend pushes on /user/queue/messages (chat MessagePushListener). */
type PushPayload = {
  messageId: string;
  conversationId: string;
  conversationType?: string;
  senderUserId: string;
  senderName?: string;
  body: string;
  attachments?: { id: string; url: string; type: string; name: string }[];
  occurredAt: string;
};

import { setTyping } from "@/features/chat/chatSlice";

export let globalStompClient: Client | undefined;

export const sendTypingEvent = (conversationId: string, isTyping: boolean) => {
  const stompClient = typeof window !== "undefined" ? (window as any).globalStompClient : undefined;
  console.log("sendTypingEvent called:", { conversationId, isTyping, connected: stompClient?.connected });
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: "/app/chat.typing",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId, isTyping }),
    });
    console.log("Published typing event successfully");
  } else {
    console.warn("Cannot send typing event: stompClient is missing or disconnected");
  }
};

/**
 * Opens a STOMP-over-SockJS connection (authenticated with the access token) and
 * streams incoming chat messages into the RTK Query cache in real time. Sending
 * stays over REST (POST /me/conversations/{id}/messages) — the backend then
 * pushes the delivered message here for every participant.
 *
 * Reconnects automatically, and re-authenticates whenever the access token
 * changes (e.g. after a token refresh).
 */
export function useChatSocket() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);

  useEffect(() => {
    if (!token) return;
    let client: Client | undefined;
    let cancelled = false;

    (async () => {
      // SockJS touches browser globals — import it only on the client.
      const SockJS = (await import("sockjs-client")).default;
      if (cancelled) return;

      client = new Client({
        webSocketFactory: () => new SockJS(`${config.apiBaseUrl}/ws`),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          if (cancelled) {
            client?.deactivate();
            return;
          }
          if (typeof window !== "undefined") {
            (window as any).globalStompClient = client;
          }
          console.log("Stomp connected");

          // 1. Messages
          client?.subscribe("/user/queue/messages", (frame) => {
            let p: PushPayload;
            try {
              p = JSON.parse(frame.body);
            } catch {
              return;
            }
            const message: MessageResponse = {
              id: p.messageId,
              conversationId: p.conversationId,
              senderUserId: p.senderUserId,
              body: p.body,
              createdAt: p.occurredAt,
            };
            // Append to the open thread's cache (de-duped).
            const updateDraft = (draft: MessageResponse[]) => {
              if (!draft.some((m) => m.id === message.id)) draft.push(message);
            };
            dispatch(conversationApi.util.updateQueryData("getMessages", { id: p.conversationId }, updateDraft));
            dispatch(conversationApi.util.updateQueryData("getMessages", { id: p.conversationId, limit: 20 }, updateDraft));
            dispatch(conversationApi.util.updateQueryData("getMessages", { id: p.conversationId, limit: 50 }, updateDraft));
            // Refresh the conversation list (ordering + unread badges).
            dispatch(
              conversationApi.util.invalidateTags([{ type: "Conversations", id: "LIST" }])
            );
          });

          // 2. Presence
          client?.subscribe("/user/queue/presence", (frame) => {
            let p: { userId: string; online: boolean; lastSeenAt: string };
            try {
              p = JSON.parse(frame.body);
            } catch {
              return;
            }
            // Patch the conversation participants directly
            dispatch(
              conversationApi.util.updateQueryData("getConversations", undefined, (draft) => {
                for (const conv of draft) {
                  for (const participant of conv.participants) {
                    if (participant.userId === p.userId) {
                      participant.online = p.online;
                      participant.lastSeenAt = p.lastSeenAt;
                    }
                  }
                }
              })
            );
          });

          // 3. Typing
          client?.subscribe("/user/queue/typing", (frame) => {
            let p: { conversationId: string; userId: string; isTyping?: boolean; typing?: boolean };
            try {
              p = JSON.parse(frame.body);
            } catch {
              return;
            }
            dispatch(setTyping({
              conversationId: p.conversationId,
              userId: p.userId,
              isTyping: p.isTyping ?? p.typing ?? false
            }));
          });

          // 4. Receipts
          client?.subscribe("/user/queue/receipts", (frame) => {
            let p: {
              conversationId: string;
              userId: string;
              lastDeliveredAt: string;
              lastReadAt: string;
            };
            try {
              p = JSON.parse(frame.body);
            } catch {
              return;
            }
            dispatch(
              conversationApi.util.updateQueryData("getConversations", undefined, (draft) => {
                const conv = draft.find((c) => c.id === p.conversationId);
                if (!conv) return;
                const part = conv.participants.find((cp) => cp.userId === p.userId);
                if (part) {
                  part.lastDeliveredAt = p.lastDeliveredAt;
                  part.lastReadAt = p.lastReadAt;
                }
              })
            );
          });
        },
        onDisconnect: () => {
          if (typeof window !== "undefined") {
            (window as any).globalStompClient = undefined;
          }
        },
      });

      client.activate();
    })();

    return () => {
      cancelled = true;
      if (typeof window !== "undefined") {
        (window as any).globalStompClient = undefined;
      }
      client?.deactivate();
    };
  }, [token, dispatch]);
}
