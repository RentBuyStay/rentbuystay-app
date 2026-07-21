"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ScheduleInspectionModal from "@/components/ScheduleInspectionModal";
import { useGetMeQuery } from "@/services/meApi";
import { useGetProfessionalsQuery } from "@/services/agentApi";
import { useSendMessageMutation, useMarkConversationReadMutation, useGetMessagesQuery, useGetConversationsQuery } from "@/services/conversationApi";
import { useUploadFilesBatchMutation } from "@/services/fileApi";
import { sendTypingEvent } from "@/hooks/useChatSocket";
import { useAppSelector } from "@/store/hooks";
import { selectTypingStatus } from "@/features/chat/chatSlice";
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
    avatarUrl: other?.avatarUrl,
    verified: other?.verified ?? false,
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

  const { data: me } = useGetMeQuery();
  const { data: conversations = [], isLoading, isError } = useGetConversationsQuery(undefined, {
    pollingInterval: 30_000,
  });

  // Lock the page to the viewport while the chat is open so ONLY the message
  // list scrolls (WhatsApp-style) — the header and composer stay put. Without
  // this the whole panel scrolls with the page on mobile.
  useEffect(() => {
    const { body, documentElement: html } = document;
    const prev = { body: body.style.overflow, html: html.style.overflow };
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev.body;
      html.style.overflow = prev.html;
    };
  }, []);

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
      className="flex bg-white -m-4 md:-m-8 lg:-mx-10 lg:-my-8"
      style={{
        // dvh tracks the *visible* viewport on any mobile screen (accounts for
        // the browser's collapsing toolbars), so the chat fits exactly and only
        // the message list scrolls. 80px = the dashboard top bar.
        height: "calc(100dvh - 80px)",
        overflow: "hidden",
        border: "1px solid #F6F6F6",
      }}
    >
      {/* On mobile only one pane shows: the list, or (when a chat is open) the thread. */}
      <aside
        className={`flex-col shrink-0 w-full md:w-[400px] ${selected ? "hidden md:flex" : "flex"}`}
        style={{ borderRight: "1px solid #F6F6F6", overflow: "hidden" }}
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
              const { name, initials: ini, avatarUrl, verified } = otherParty(c, me?.id);
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
                      className="rounded-full flex items-center justify-center shrink-0 overflow-hidden relative"
                      style={{ width: "40px", height: "40px", background: "#305E82", color: "#FFFFFF", fontSize: "14px", fontWeight: 600 }}
                    >
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={name} fill sizes="40px" style={{ objectFit: "cover" }} unoptimized />
                      ) : (
                        ini
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0" style={{ gap: "2px" }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center" style={{ gap: "6px" }}>
                          <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>
                            {name}
                          </span>
                          {verified && <Image src="/icons/dash/verify.svg" alt="verified" width={16} height={16} className="shrink-0" />}
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
                      <ConvPreview conversationId={c.id} unreadCount={c.unreadCount} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <div className={`flex-col flex-1 min-w-0 min-h-0 overflow-hidden ${selected ? "flex" : "hidden md:flex"}`}>
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
            onBack={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- list-item preview ---------------- */

// The conversations endpoint has no message preview, so fetch the latest
// message body per row (matches the Figma, which shows the real message).
function ConvPreview({ conversationId, unreadCount }: { conversationId: string; unreadCount: number }) {
  const { data: messages } = useGetMessagesQuery({ id: conversationId, limit: 20 });
  const list = messages ?? [];
  let latest = list.length ? list[0] : null;
  for (const m of list) {
    if (!latest || m.createdAt.localeCompare(latest.createdAt) >= 0) latest = m;
  }
  const text = latest?.body || (unreadCount > 0 ? `${unreadCount} unread` : "Tap to open");
  return (
    <span className="line-clamp-1" style={{ fontSize: "12px", lineHeight: "18px", color: "#807E7E" }}>
      {text}
    </span>
  );
}

/* ---------------- conversation pane ---------------- */

function ConversationView({
  conversation,
  myId,
  canSchedule,
  onBack,
}: {
  conversation: ConversationResponse;
  myId?: string;
  // Scheduling an inspection is a seeker action (the backend forbids hosts from
  // requesting inspections on their own properties), so hide it for owners/agents.
  canSchedule?: boolean;
  // Mobile: return to the conversation list.
  onBack?: () => void;
}) {
  const [composer, setComposer] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { name, initials: ini, online, avatarUrl, verified } = otherParty(conversation, myId);
  const otherPartyParticipant = conversation.participants?.find((p) => p.userId !== myId);
  const otherUserId = otherPartyParticipant?.userId;
  const otherReadAt = otherPartyParticipant?.lastReadAt;

  // The chat participant carries no phone, so resolve it from the public
  // professional directory by an EXACT userId match (safe — never a name guess).
  // Found only when the other party is a listed agent/agency; otherwise the
  // Call/WhatsApp buttons stay disabled rather than dial the wrong person.
  const { data: profPage } = useGetProfessionalsQuery(
    { q: name, size: 20 },
    { skip: !otherUserId || !name },
  );
  const counterpartPhone = profPage?.content?.find((p) => p.id === otherUserId)?.phoneNumber?.trim();
  // WhatsApp needs the international number without "+"; normalise a Nigerian
  // local number (leading 0) to the 234 country code.
  const waNumber = counterpartPhone
    ? (() => {
        const d = counterpartPhone.replace(/\D/g, "");
        return d.startsWith("0") ? `234${d.slice(1)}` : d;
      })()
    : "";
  const typingStatus = useAppSelector(selectTypingStatus(conversation.id));
  const isOtherTyping = otherUserId ? typingStatus[otherUserId] : false;

  // WebSocket pushes new messages into this cache live; a slow poll covers any
  // dropped connection.
  const { data: messages = [] } = useGetMessagesQuery(
    { id: conversation.id },
    { pollingInterval: 30_000 }
  );
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const [uploadFilesBatch, { isLoading: uploading }] = useUploadFilesBatchMutation();
  const [markRead] = useMarkConversationReadMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mark the conversation read whenever it's opened or new messages arrive.
  useEffect(() => {
    if (conversation.unreadCount > 0) markRead(conversation.id);
  }, [conversation.id, conversation.unreadCount, markRead]);

  // Keep the view pinned to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, isOtherTyping]);

  async function handleSend() {
    const body = composer.trim();
    if (!body || sending) return;
    setComposer("");
    sendTypingEvent(conversation.id, false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    
    try {
      await sendMessage({ id: conversation.id, body }).unwrap();
    } catch {
      setComposer(body); // restore on failure
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.length > 10) {
      alert("You can only upload up to 10 files at once.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Clear the input so selecting the same file again works
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Upload the files first
      const res = await uploadFilesBatch(formData).unwrap();
      const fileIds = res.map(r => r.id);
      const fileNames = files.map(f => f.name).join(", ");

      // Send the message with the files attached
      await sendMessage({
        id: conversation.id,
        body: `Shared ${files.length > 1 ? "files" : "file"}: ${fileNames}`,
        attachmentFileIds: fileIds,
      }).unwrap();
    } catch (err) {
      console.error("File upload failed", err);
      alert("Failed to upload files. Please try again.");
    }
  }

  const handleComposerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComposer(e.target.value);
    sendTypingEvent(conversation.id, true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTypingEvent(conversation.id, false);
    }, 2000);
  };

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0"
        style={{ height: "104px", padding: "20px 24px", borderBottom: "1px solid #F6F6F6" }}
      >
        <div className="flex items-center" style={{ gap: "12px" }}>
          <button
            type="button"
            aria-label="Back to conversations"
            onClick={onBack}
            className="md:hidden hover:opacity-80 shrink-0"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", width: "24px", height: "24px" }}
          >
            <Image src="/icons/arrow-left.svg" alt="" width={24} height={24} />
          </button>
          <div
            className="rounded-full flex items-center justify-center shrink-0 overflow-hidden relative"
            style={{ width: "48px", height: "48px", background: "#305E82", color: "#FFFFFF", fontSize: "16px", fontWeight: 600 }}
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name} fill sizes="48px" style={{ objectFit: "cover" }} unoptimized />
            ) : (
              ini
            )}
          </div>
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <span className="flex items-center" style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212", gap: "6px" }}>
              {name}
              {verified && <Image src="/icons/dash/verify.svg" alt="verified" width={18} height={18} className="shrink-0" />}
            </span>
            <div className="flex items-center" style={{ gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "100%", background: online ? "#00B756" : "#807E7E" }} />
              <span style={{ fontSize: "12px", lineHeight: "16px", color: online ? "#00B756" : "#807E7E", fontWeight: 500 }}>
                {online ? "Active" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center" style={{ gap: "24px" }}>
          {counterpartPhone ? (
            <a href={`tel:${counterpartPhone}`} aria-label={`Call ${name}`} title={`Call ${counterpartPhone}`} className="hover:opacity-80 shrink-0" style={{ width: "24px", height: "24px" }}>
              <Image src="/icons/dash/call-blue.svg" alt="" width={24} height={24} />
            </a>
          ) : (
            <button type="button" aria-label="Call" disabled title="Phone number not available" className="shrink-0" style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "not-allowed", opacity: 0.4 }}>
              <Image src="/icons/dash/call-blue.svg" alt="" width={24} height={24} />
            </button>
          )}
          {waNumber ? (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${name}`} title={`WhatsApp ${name}`} className="hover:opacity-80 shrink-0" style={{ width: "24px", height: "24px" }}>
              <Image src="/icons/dash/whatsapp.svg" alt="" width={24} height={24} />
            </a>
          ) : (
            <button type="button" aria-label="WhatsApp" disabled title="Phone number not available" className="shrink-0" style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "not-allowed", opacity: 0.4 }}>
              <Image src="/icons/dash/whatsapp.svg" alt="" width={24} height={24} />
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex flex-col" style={{ flex: 1, minHeight: 0, padding: "24px", gap: "12px", overflowY: "auto" }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center flex-1" style={{ color: "#807E7E", fontSize: "14px" }}>
            No messages yet. Send the first one below.
          </div>
        ) : (
          // API returns newest-first; render oldest→newest so the latest sits
          // at the bottom of the thread.
          [...messages]
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
            .map((m) => {
            const mine = m.senderUserId === myId;
            const read = otherReadAt && new Date(m.createdAt).getTime() <= new Date(otherReadAt).getTime();
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
                  {m.attachments?.map((attachment) => (
                    attachment.type?.startsWith("image/") ? (
                      <img key={attachment.id} src={attachment.url} alt={attachment.name || "Attached Image"} style={{ maxWidth: "100%", borderRadius: "8px", marginBottom: "4px" }} />
                    ) : (
                      <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" style={{ textDecoration: "underline", color: "inherit", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Image src={mine ? "/icons/dash/paperclip-white.svg" : "/icons/dash/paperclip.svg"} alt="" width={16} height={16} />
                        {attachment.name || "Download Attachment"}
                      </a>
                    )
                  ))}
                  <span style={{ fontSize: "14px", lineHeight: "20px", whiteSpace: "pre-wrap" }}>{m.body}</span>
                  <div className="flex items-center" style={{ gap: "4px", alignSelf: "flex-end" }}>
                    <span style={{ fontSize: "10px", lineHeight: "14px", color: mine ? "rgba(255,255,255,0.7)" : "#807E7E" }}>
                      {relTime(m.createdAt)}
                    </span>
                    {mine && (
                      <Image 
                        src="/icons/dash/msg-checks.svg" 
                        alt={read ? "Read" : "Delivered"} 
                        width={14} 
                        height={14} 
                        style={{ opacity: read ? 1 : 0.5 }} 
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {isOtherTyping && (
          <div className="flex" style={{ justifyContent: "flex-start", marginTop: "4px" }}>
            <div
              className="flex items-center"
              style={{
                padding: "8px 14px",
                background: "#F6F6F6",
                borderRadius: "16px 16px 16px 4px",
                color: "#807E7E",
                fontSize: "12px",
                fontStyle: "italic",
              }}
            >
              {name} is typing...
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center shrink-0" style={{ padding: "16px 24px", gap: "12px", borderTop: "1px solid #F6F6F6" }}>
        {canSchedule && (
          <button type="button" aria-label="Schedule inspection" onClick={() => setScheduleOpen(true)} className="hover:opacity-80 shrink-0" style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <Image src="/icons/dash/calendar-edit.svg" alt="" width={24} height={24} />
          </button>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          multiple
          accept="image/*"
          onChange={handleFileUpload} 
        />
        <button type="button" aria-label="Attach" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="hover:opacity-80 shrink-0" style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.5 : 1 }}>
          <Image src="/icons/dash/paperclip.svg" alt="" width={24} height={24} />
        </button>
        <div className="flex-1 flex items-center" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", height: "40px" }}>
          <input
            value={composer}
            onChange={handleComposerChange}
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
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0 px-4 md:px-6 gap-0 md:gap-2"
          style={{
            height: "48px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            opacity: composer.trim() && !sending ? 1 : 0.6,
            cursor: composer.trim() && !sending ? "pointer" : "not-allowed",
          }}
        >
          {/* Mobile: icon only (Figma); desktop: "Send" + icon */}
          <span className="hidden md:inline">Send</span>
          <Image src="/icons/dash/send-msg.svg" alt="" width={16} height={16} />
        </button>
      </div>

      {canSchedule && (
        <ScheduleInspectionModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} hostUserId={otherUserId} />
      )}
    </>
  );
}
