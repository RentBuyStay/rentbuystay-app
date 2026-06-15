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
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  occurredAt: string;
};

import { setTyping } from "@/features/chat/chatSlice";

export let globalStompClient: Client | undefined;

export const sendTypingEvent = (conversationId: string, isTyping: boolean) => {
  if (globalStompClient && globalStompClient.connected) {
    globalStompClient.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ conversationId, isTyping }),
    });
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
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          globalStompClient = client;

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
            dispatch(
              conversationApi.util.updateQueryData(
                "getMessages",
                { id: p.conversationId },
                (draft) => {
                  if (!draft.some((m) => m.id === message.id)) draft.push(message);
                }
              )
            );
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
            let p: { conversationId: string; userId: string; isTyping: boolean };
            try {
              p = JSON.parse(frame.body);
            } catch {
              return;
            }
            dispatch(setTyping(p));
          });
        },
        onDisconnect: () => {
          globalStompClient = undefined;
        },
      });

      client.activate();
    })();

    return () => {
      cancelled = true;
      globalStompClient = undefined;
      client?.deactivate();
    };
  }, [token, dispatch]);
}
