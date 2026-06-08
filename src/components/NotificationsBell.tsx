"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  useGetUnreadNotificationCountQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from "@/services/notificationApi";

function relTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 60_000,
  });
  const { data: page, isLoading } = useGetNotificationsQuery({ page: 0, size: 20 }, { skip: !open });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [removeNotification] = useDeleteNotificationMutation();

  const items = page?.content ?? [];

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative hover:opacity-80"
        style={{ background: "none", border: "none", padding: 0, width: "24px", height: "24px", cursor: "pointer" }}
      >
        <Image src="/icons/dash/tb-notification.svg" alt="" width={24} height={24} />
        {unreadCount > 0 && (
          <span
            className="absolute flex items-center justify-center"
            style={{
              top: "-6px",
              right: "-6px",
              minWidth: "16px",
              height: "16px",
              padding: "0 4px",
              borderRadius: "8px",
              background: "#E11900",
              border: "1.5px solid #FFFFFF",
              color: "#FFFFFF",
              fontSize: "10px",
              lineHeight: "13px",
              fontWeight: 600,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute bg-white"
          style={{
            top: "36px",
            right: 0,
            width: "380px",
            maxWidth: "calc(100vw - 48px)",
            border: "1px solid #F6F6F6",
            borderRadius: "16px",
            boxShadow: "0 12px 32px rgba(18,18,18,0.12)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          <div className="flex items-center justify-between" style={{ padding: "16px 20px", borderBottom: "1px solid #F6F6F6" }}>
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#121212" }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="hover:underline"
                style={{ fontSize: "13px", fontWeight: 500, color: "#305E82", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div style={{ maxHeight: "420px", overflowY: "auto" }}>
            {isLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#807E7E", fontSize: "14px" }}>Loading…</div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: "48px 24px", gap: "8px" }}>
                <Image src="/icons/dash/tb-notification.svg" alt="" width={28} height={28} style={{ opacity: 0.4 }} />
                <span style={{ fontSize: "14px", color: "#807E7E" }}>You&rsquo;re all caught up</span>
              </div>
            ) : (
              items.map((n) => {
                const unread = !n.readAt;
                return (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => unread && markRead(n.id)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && unread) markRead(n.id);
                    }}
                    className="group flex hover:bg-[#FAFAFA] transition-colors"
                    style={{ padding: "14px 20px", gap: "12px", borderBottom: "1px solid #F6F6F6", cursor: unread ? "pointer" : "default", background: unread ? "rgba(120,158,187,0.06)" : "transparent" }}
                  >
                    <span
                      className="shrink-0"
                      style={{ width: "8px", height: "8px", marginTop: "6px", borderRadius: "100%", background: unread ? "#FFAE00" : "transparent" }}
                    />
                    <div className="flex flex-col flex-1 min-w-0" style={{ gap: "2px" }}>
                      <div className="flex items-center justify-between" style={{ gap: "8px" }}>
                        <span className="line-clamp-1" style={{ fontSize: "14px", fontWeight: unread ? 600 : 500, color: "#121212" }}>
                          {n.title}
                        </span>
                        <span className="shrink-0" style={{ fontSize: "11px", color: "#807E7E", whiteSpace: "nowrap" }}>
                          {relTime(n.createdAt)}
                        </span>
                      </div>
                      <span className="line-clamp-2" style={{ fontSize: "13px", lineHeight: "18px", color: "#807E7E" }}>
                        {n.body}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="Dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(n.id);
                      }}
                      className="shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-70 transition-opacity"
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#807E7E", fontSize: "16px", lineHeight: 1, alignSelf: "flex-start" }}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
