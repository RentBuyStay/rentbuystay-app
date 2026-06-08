"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ScheduleInspectionModal from "@/components/ScheduleInspectionModal";
import { useGetMeQuery } from "@/services/meApi";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
} from "@/services/conversationApi";
import { useChatSocket } from "@/hooks/useChatSocket";
import type { ConversationResponse } from "@/services/types";

function initials(first?: string, last?: string) {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?";
}

/** The participant who isn't the current user (the person you're chatting with). */
function otherParty(conv: ConversationResponse, myId?: string) {
  const other = conv.participants?.find((p) => p.userId !== myId) ?? conv.participants?.[0];
  const name = `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.trim();
  return {
    name: name || conv.title || "Conversation",
    initials: initials(other?.firstName, other?.lastName),
    online: other?.online ?? false,
  };
}

function relTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  if (diff < 86_400_000) return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  if (diff < 172_800_000) return "Yesterday";
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  // Auto-select a conversation when arriving via ?c=<id> (e.g. from a request's Message button).
  const [selected, setSelected] = useState<string | null>(searchParams?.get("c") ?? null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");

  // Live message delivery over WebSocket (STOMP). Incoming messages are pushed
  // straight into the RTK cache; the polling below is just a fallback.
  useChatSocket();

  const { data: me } = useGetMeQuery();
  const { data: conversations = [], isLoading, isError } = useGetConversationsQuery(undefined, {
    pollingInterval: 30_000,
  });

  const visible = useMemo(() => {
    let list = [...conversations];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const { name } = otherParty(c, me?.id);
        return `${name} ${c.title ?? ""}`.toLowerCase().includes(q);
      });
    }
    if (sort === "Unread") list = list.filter((c) => c.unreadCount > 0);
    list.sort((a, b) => {
      const ta = new Date(a.lastMessageAt ?? a.createdAt ?? 0).getTime();
      const tb = new Date(b.lastMessageAt ?? b.createdAt ?? 0).getTime();
      return sort === "Oldest" ? ta - tb : tb - ta;
    });
    return list;
  }, [conversations, search, sort, me?.id]);

  const activeConv = conversations.find((c) => c.id === selected) ?? null;

  return (
    <div
      className="flex bg-white"
      style={{
        margin: "-32px -40px",
        height: "calc(100vh - 80px)",
        border: "1px solid #F6F6F6",
      }}
    >
      <aside
        className="flex flex-col shrink-0"
        style={{ width: "400px", borderRight: "1px solid #F6F6F6", overflow: "hidden" }}
      >
        <div
          className="flex items-center"
          style={{ padding: "20px", gap: "12px", borderBottom: "1px solid #F6F6F6" }}
        >
          <div
            className="flex items-center flex-1"
            style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "8px", height: "40px" }}
          >
            <Image src="/icons/dash/search-normal.svg" alt="" width={20} height={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 outline-none bg-transparent"
              style={{ fontSize: "14px", color: "#121212", letterSpacing: "-0.02em" }}
            />
          </div>
          <div className="flex items-center" style={{ gap: "8px", height: "40px", padding: "8px 12px" }}>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="outline-none bg-transparent appearance-none"
              style={{ fontSize: "14px", color: "#121212", fontWeight: 500, cursor: "pointer" }}
            >
              <option>Newest</option>
              <option>Oldest</option>
              <option>Unread</option>
            </select>
            <Image src="/icons/chevron-down.svg" alt="" width={16} height={16} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center" style={{ flex: 1, color: "#807E7E", fontSize: "14px" }}>
            Loading chats…
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center" style={{ flex: 1, color: "#807E7E", fontSize: "14px" }}>
            Couldn&rsquo;t load conversations.
          </div>
        ) : visible.length === 0 ? (
          <div className="flex items-center justify-center text-center" style={{ flex: 1, padding: "40px", color: "#807E7E", fontSize: "14px" }}>
            No conversations yet.
          </div>
        ) : (
          <ul className="flex flex-col" style={{ overflowY: "auto", flex: 1 }}>
            {visible.map((c) => {
              const isActive = c.id === selected;
              const { name, initials: ini } = otherParty(c, me?.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(c.id)}
                    className="w-full flex items-start hover:bg-[#FAFAFA] transition-colors text-left"
                    style={{
                      padding: "16px 20px",
                      gap: "12px",
                      background: isActive ? "rgba(120,158,187,0.1)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="rounded-full flex items-center justify-center shrink-0"
                      style={{ width: "40px", height: "40px", background: "#305E82", color: "#FFFFFF", fontSize: "14px", fontWeight: 600 }}
                    >
                      {ini}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0" style={{ gap: "2px" }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center" style={{ gap: "6px" }}>
                          <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>
                            {name}
                          </span>
                          {c.unreadCount > 0 && (
                            <span style={{ width: "8px", height: "8px", borderRadius: "100%", background: "#FFAE00" }} />
                          )}
                        </div>
                        <span style={{ fontSize: "12px", color: "#807E7E", whiteSpace: "nowrap" }}>
                          {relTime(c.lastMessageAt ?? c.createdAt)}
                        </span>
                      </div>
                      {c.title && (
                        <span className="line-clamp-1" style={{ fontSize: "13px", lineHeight: "18px", fontWeight: 500, color: "#305E82" }}>
                          {c.title}
                        </span>
                      )}
                      <span className="line-clamp-1" style={{ fontSize: "12px", lineHeight: "18px", color: "#807E7E" }}>
                        {c.unreadCount > 0 ? `${c.unreadCount} unread` : "Tap to open"}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <div className="flex flex-col flex-1" style={{ minWidth: 0 }}>
        {!activeConv ? (
          <div className="flex flex-col items-center justify-center" style={{ flex: 1, gap: "24px" }}>
            <div className="flex items-center justify-center rounded-full" style={{ width: "180px", height: "180px", background: "#F4F8FB" }}>
              <Image src="/icons/dash/nav-messages.svg" alt="" width={64} height={64} />
            </div>
            <div className="flex flex-col items-center" style={{ gap: "8px" }}>
              <h2 style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: "#121212" }}>
                Continue chatting
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "20px", color: "#807E7E" }}>
                Click on any chat to continue chatting with them.
              </p>
            </div>
          </div>
        ) : (
          <ConversationView
            key={activeConv.id}
            conversation={activeConv}
            myId={me?.id}
            canSchedule={me?.userType === "PROPERTY_SEEKER"}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- conversation pane ---------------- */

function ConversationView({
  conversation,
  myId,
  canSchedule,
}: {
  conversation: ConversationResponse;
  myId?: string;
  // Scheduling an inspection is a seeker action (the backend forbids hosts from
  // requesting inspections on their own properties), so hide it for owners/agents.
  canSchedule?: boolean;
}) {
  const [composer, setComposer] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { name, initials: ini, online } = otherParty(conversation, myId);
  // WebSocket pushes new messages into this cache live; a slow poll covers any
  // dropped connection.
  const { data: messages = [] } = useGetMessagesQuery(
    { id: conversation.id },
    { pollingInterval: 30_000 }
  );
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const [markRead] = useMarkConversationReadMutation();

  // Mark the conversation read whenever it's opened or new messages arrive.
  useEffect(() => {
    if (conversation.unreadCount > 0) markRead(conversation.id);
  }, [conversation.id, conversation.unreadCount, markRead]);

  // Keep the view pinned to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  async function handleSend() {
    const body = composer.trim();
    if (!body || sending) return;
    setComposer("");
    try {
      await sendMessage({ id: conversation.id, body }).unwrap();
    } catch {
      setComposer(body); // restore on failure
    }
  }

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0"
        style={{ height: "104px", padding: "20px 24px", borderBottom: "1px solid #F6F6F6" }}
      >
        <div className="flex items-center" style={{ gap: "12px" }}>
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{ width: "48px", height: "48px", background: "#305E82", color: "#FFFFFF", fontSize: "16px", fontWeight: 600 }}
          >
            {ini}
          </div>
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
              {name}
            </span>
            <div className="flex items-center" style={{ gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "100%", background: online ? "#00B756" : "#807E7E" }} />
              <span style={{ fontSize: "12px", lineHeight: "16px", color: online ? "#00B756" : "#807E7E", fontWeight: 500 }}>
                {online ? "Active" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <button type="button" aria-label="Call" className="hover:opacity-80" style={{ width: "40px", height: "40px", borderRadius: "100%", background: "#F4F8FB", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image src="/icons/dash/call.svg" alt="" width={20} height={20} />
          </button>
          <button type="button" aria-label="WhatsApp" className="hover:opacity-80" style={{ width: "40px", height: "40px", borderRadius: "100%", background: "#F4F8FB", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image src="/icons/dash/whatsapp.svg" alt="" width={20} height={20} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex flex-col" style={{ flex: 1, padding: "24px", gap: "12px", overflowY: "auto" }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center flex-1" style={{ color: "#807E7E", fontSize: "14px" }}>
            No messages yet. Send the first one below.
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderUserId === myId;
            return (
              <div key={m.id} className="flex" style={{ justifyContent: mine ? "flex-end" : "flex-start" }}>
                <div
                  className="flex flex-col"
                  style={{
                    maxWidth: "420px",
                    padding: "10px 14px",
                    gap: "4px",
                    background: mine ? "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)" : "#F6F6F6",
                    color: mine ? "#FFFFFF" : "#121212",
                    borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  }}
                >
                  <span style={{ fontSize: "14px", lineHeight: "20px", whiteSpace: "pre-wrap" }}>{m.body}</span>
                  <span style={{ fontSize: "10px", lineHeight: "14px", color: mine ? "rgba(255,255,255,0.7)" : "#807E7E", alignSelf: "flex-end" }}>
                    {relTime(m.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center shrink-0" style={{ padding: "16px 24px", gap: "12px", borderTop: "1px solid #F6F6F6" }}>
        {canSchedule && (
          <button type="button" aria-label="Schedule inspection" onClick={() => setScheduleOpen(true)} className="hover:opacity-80" style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <Image src="/icons/dash/calendar-edit.svg" alt="" width={24} height={24} />
          </button>
        )}
        <button type="button" aria-label="Attach" className="hover:opacity-80" style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <Image src="/icons/dash/paperclip.svg" alt="" width={24} height={24} />
        </button>
        <div className="flex-1 flex items-center" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", height: "40px" }}>
          <input
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message here..."
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: "14px", color: "#121212", letterSpacing: "-0.02em" }}
          />
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!composer.trim() || sending}
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          style={{
            height: "48px",
            padding: "8px 24px",
            gap: "8px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            opacity: composer.trim() && !sending ? 1 : 0.6,
            cursor: composer.trim() && !sending ? "pointer" : "not-allowed",
          }}
        >
          Send
          <Image src="/icons/dash/send-msg.svg" alt="" width={16} height={16} />
        </button>
      </div>

      {canSchedule && (
        <ScheduleInspectionModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
      )}
    </>
  );
}
