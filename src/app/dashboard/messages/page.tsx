"use client";

import Image from "next/image";
import { useState } from "react";
import ScheduleInspectionModal from "@/components/ScheduleInspectionModal";

type Conversation = {
  id: string;
  initials: string;
  name: string;
  avatar?: string;
  property: string;
  preview: string;
  time: string;
  unread?: boolean;
};

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    initials: "AT",
    name: "Ayebatari Temitope",
    avatar: "/images/agent-pascaline.png",
    property: "3-Bedroom Flat, Lekki Phase 1",
    preview: "Good morning, I am interested in visiting the property ...",
    time: "10:32 AM",
    unread: true,
  },
  {
    id: "c2",
    initials: "CN",
    name: "Chidi Nwosu",
    property: "Office Space, Ikeja GRA",
    preview: "Hello, could you please provide more details about the neighborhood?",
    time: "08:03 AM",
    unread: true,
  },
  {
    id: "c3",
    initials: "TA",
    name: "Tunde Adeleke",
    property: "Property Request",
    preview: "If you can increase your budget, I have one mini flat in Ikeja that I can suggest for you.",
    time: "Yesterday",
  },
  {
    id: "c4",
    initials: "JC",
    name: "Jamal Clarke",
    property: "3-Bedroom Flat, Lekki Phase 1",
    preview: "Is the property available for immediate move-in? Thanks!",
    time: "Yesterday",
  },
];

type Message =
  | { kind: "incoming"; text: string; time: string }
  | { kind: "outgoing"; text: string; time: string }
  | { kind: "outgoing-video"; image: string; duration: string; time: string }
  | { kind: "property-request"; title: string; price: string; priceSuffix: string; location: string; time: string };

const TUNDE_THREAD: { date: string; messages: Message[] }[] = [
  {
    date: "Yesterday",
    messages: [
      { kind: "property-request", title: "Mini Flat for Rent", price: "₦1,200,000", priceSuffix: "/year", location: "Ikoyi, Lagos", time: "" },
      { kind: "outgoing", text: "If you can increase your budget, I have one mini flat in Ikeja that I can suggest for you.", time: "12:25" },
      { kind: "outgoing-video", image: "/images/prop2.jpg", duration: "02:25", time: "" },
      { kind: "incoming", text: "Hello chief", time: "12:25" },
      { kind: "incoming", text: "I’m not sorry, I can’t increase the budget for a mini flat.\nThank you.", time: "12:25" },
    ],
  },
];

export default function MessagesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");
  const [composerText, setComposerText] = useState("");

  const visible = CONVERSATIONS.filter((c) =>
    !search ||
    `${c.name} ${c.property} ${c.preview}`.toLowerCase().includes(search.toLowerCase()),
  );
  const activeConv = CONVERSATIONS.find((c) => c.id === selected);

  return (
    <div
      className="flex bg-white"
      style={{
        // Cancel the parent <main padding:32 40> so the two panes fill the content area edge-to-edge
        margin: "-32px -40px",
        height: "calc(100vh - 80px)",
        border: "1px solid #F6F6F6",
      }}
    >
      
      <aside
        className="flex flex-col shrink-0"
        style={{ width: "400px", borderRight: "1px solid #F6F6F6", overflow: "hidden" }}
      >
        {/* Search + sort row */}
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
          <div
            className="flex items-center"
            style={{ gap: "8px", height: "40px", padding: "8px 12px" }}
          >
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

        {/* Conversation list */}
        <ul className="flex flex-col" style={{ overflowY: "auto", flex: 1 }}>
          {visible.map((c) => {
            const isActive = c.id === selected;
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
                  {/* Avatar */}
                  {c.avatar ? (
                    <Image
                      src={c.avatar}
                      alt=""
                      width={40}
                      height={40}
                      style={{ width: "40px", height: "40px", borderRadius: "100%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      className="rounded-full flex items-center justify-center shrink-0"
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "#305E82",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {c.initials}
                    </div>
                  )}

                  {/* Body */}
                  <div className="flex flex-col flex-1 min-w-0" style={{ gap: "2px" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center" style={{ gap: "6px" }}>
                        <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>
                          {c.name}
                        </span>
                        {c.unread && (
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "100%",
                              background: "#FFAE00",
                            }}
                          />
                        )}
                      </div>
                      <span style={{ fontSize: "12px", color: "#807E7E", whiteSpace: "nowrap" }}>{c.time}</span>
                    </div>
                    <span
                      className="line-clamp-1"
                      style={{ fontSize: "13px", lineHeight: "18px", fontWeight: 500, color: "#305E82" }}
                    >
                      {c.property}
                    </span>
                    <span
                      className="line-clamp-1"
                      style={{ fontSize: "12px", lineHeight: "18px", color: "#807E7E" }}
                    >
                      {c.preview}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      
      <div className="flex flex-col flex-1" style={{ minWidth: 0 }}>
        {!activeConv ? (
          <div className="flex flex-col items-center justify-center" style={{ flex: 1, gap: "24px" }}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: "180px", height: "180px", background: "#F4F8FB" }}
            >
              <Image src="/icons/dash/nav-messages.svg" alt="" width={64} height={64} />
            </div>
            <div className="flex flex-col items-center" style={{ gap: "8px" }}>
              <h2 style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: "#121212" }}>
                Continue chatting
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "20px", color: "#807E7E" }}>
                Click on any chats to continue chatting with them.
              </p>
            </div>
          </div>
        ) : (
          <ConversationView conversation={activeConv} composer={composerText} setComposer={setComposerText} />
        )}
      </div>
    </div>
  );
}

/* ---------------- conversation pane ---------------- */

function ConversationView({
  conversation,
  composer,
  setComposer,
}: {
  conversation: Conversation;
  composer: string;
  setComposer: (v: string) => void;
}) {
  // Use Tunde's thread as sample data when c3 is selected; otherwise empty thread
  const thread = conversation.id === "c3" ? TUNDE_THREAD : [];
  const [scheduleOpen, setScheduleOpen] = useState(false);
  return (
    <>
      
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          height: "104px",
          padding: "20px 24px",
          borderBottom: "1px solid #F6F6F6",
        }}
      >
        <div className="flex items-center" style={{ gap: "12px" }}>
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
              width: "48px",
              height: "48px",
              background: "#305E82",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {conversation.initials}
          </div>
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
              {conversation.name}
            </span>
            <div className="flex items-center" style={{ gap: "6px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "100%",
                  background: "#00B756",
                }}
              />
              <span style={{ fontSize: "12px", lineHeight: "16px", color: "#00B756", fontWeight: 500 }}>
                Active
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <button
            type="button"
            aria-label="Call"
            className="hover:opacity-80"
            style={{ width: "40px", height: "40px", borderRadius: "100%", background: "#F4F8FB", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Image src="/icons/dash/call.svg" alt="" width={20} height={20} />
          </button>
          <button
            type="button"
            aria-label="WhatsApp"
            className="hover:opacity-80"
            style={{ width: "40px", height: "40px", borderRadius: "100%", background: "#F4F8FB", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Image src="/icons/dash/whatsapp.svg" alt="" width={20} height={20} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div
        className="flex flex-col"
        style={{ flex: 1, padding: "24px", gap: "16px", overflowY: "auto" }}
      >
        {thread.length === 0 ? (
          <div className="flex items-center justify-center flex-1" style={{ color: "#807E7E", fontSize: "14px" }}>
            No messages yet. Send the first one below.
          </div>
        ) : (
          thread.map((group) => (
            <div key={group.date} className="flex flex-col" style={{ gap: "16px" }}>
              {/* Date divider */}
              <div className="flex items-center justify-center">
                <span style={{ fontSize: "12px", lineHeight: "16px", color: "#807E7E", fontWeight: 500 }}>
                  {group.date}
                </span>
              </div>
              {group.messages.map((m, i) => (
                <MessageRow key={i} message={m} />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Composer — calendar-edit + paperclip-2 icons + text input + Send */}
      <div
        className="flex items-center shrink-0"
        style={{ padding: "16px 24px", gap: "12px", borderTop: "1px solid #F6F6F6" }}
      >
        
        <button
          type="button"
          aria-label="Schedule inspection"
          onClick={() => setScheduleOpen(true)}
          className="hover:opacity-80"
          style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <Image src="/icons/dash/calendar-edit.svg" alt="" width={24} height={24} />
        </button>
        <button
          type="button"
          aria-label="Attach"
          className="hover:opacity-80"
          style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <Image src="/icons/dash/paperclip.svg" alt="" width={24} height={24} />
        </button>
        <div
          className="flex-1 flex items-center"
          style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", height: "40px" }}
        >
          <input
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: "14px", color: "#121212", letterSpacing: "-0.02em" }}
          />
        </div>
        
        <button
          type="button"
          onClick={() => setComposer("")}
          disabled={!composer.trim()}
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
            opacity: composer.trim() ? 1 : 0.6,
            cursor: composer.trim() ? "pointer" : "not-allowed",
          }}
        >
          Send
          <Image src="/icons/dash/send-msg.svg" alt="" width={16} height={16} />
        </button>
      </div>

      <ScheduleInspectionModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </>
  );
}

function MessageRow({ message }: { message: Message }) {
  if (message.kind === "property-request") {
    return (
      <div className="flex justify-end">
        <div
          className="flex flex-col"
          style={{
            maxWidth: "360px",
            padding: "16px",
            gap: "12px",
            background: "#FFFFFF",
            border: "1px solid #F6F6F6",
            borderRadius: "16px 16px 4px 16px",
          }}
        >
          <span
            style={{
              alignSelf: "flex-start",
              padding: "4px 10px",
              fontSize: "10px",
              lineHeight: "16px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: "#8A38F5",
              background: "rgba(138,56,245,0.1)",
              borderRadius: "100px",
            }}
          >
            PROPERTY REQUEST
          </span>
          <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 500, color: "#121212" }}>
            {message.title}
          </span>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: "#305E82" }}>
              {message.price}
              <span style={{ fontSize: "14px", fontWeight: 400, color: "#807E7E" }}>{message.priceSuffix}</span>
            </span>
          </div>
          <div className="flex items-center" style={{ gap: "4px" }}>
            <Image src="/icons/dash/card-location.svg" alt="" width={16} height={16} />
            <span style={{ fontSize: "12px", color: "#807E7E" }}>{message.location}</span>
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === "outgoing-video") {
    return (
      <div className="flex justify-end">
        <div
          className="relative overflow-hidden"
          style={{ width: "320px", height: "200px", borderRadius: "16px 16px 4px 16px" }}
        >
          <Image src={message.image} alt="" fill style={{ objectFit: "cover" }} sizes="320px" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: "56px", height: "56px", background: "rgba(255,255,255,0.9)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 3L17 10L5 17V3Z" fill="#121212" />
              </svg>
            </div>
          </div>
          
          <div
            className="absolute flex items-center"
            style={{
              right: "12px",
              bottom: "12px",
              padding: "4px 8px",
              background: "rgba(0,0,0,0.6)",
              color: "#FFFFFF",
              borderRadius: "6px",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 500 }}>{message.duration}</span>
            <Image src="/icons/dash/msg-checks.svg" alt="✓✓" width={12} height={12} />
          </div>
        </div>
      </div>
    );
  }

  const isOutgoing = message.kind === "outgoing";
  return (
    <div className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div
        className="flex flex-col"
        style={{
          maxWidth: "440px",
          padding: "10px 14px",
          gap: "4px",
          background: isOutgoing ? "#305E82" : "#F6F6F6",
          color: isOutgoing ? "#FFFFFF" : "#121212",
          borderRadius: isOutgoing ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            lineHeight: "20px",
            whiteSpace: "pre-line",
          }}
        >
          {message.text}
        </span>
        {message.time && (
          <div
            className="flex items-center"
            style={{ alignSelf: "flex-end", gap: "4px" }}
          >
            <span
              style={{
                fontSize: "11px",
                color: isOutgoing ? "rgba(255,255,255,0.7)" : "#807E7E",
              }}
            >
              {message.time}
            </span>
            
            {isOutgoing && (
              <Image src="/icons/dash/msg-checks.svg" alt="✓✓" width={12} height={12} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
