"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useOpenDirectConversationMutation,
  useSendMessageMutation,
} from "@/services/conversationApi";
import { unwrapApiError } from "@/services/api";

/**
 * "Send a Message" reply-to-request modal.
 * Desktop: centred dialog (580px). Mobile: full-screen compose.
 * On send → "Reply Sent" success (centred / bottom sheet) with a Proceed CTA.
 */
export default function ReplyToRequestModal({
  open,
  onClose,
  posterUserId,
  name,
  initials,
}: {
  open: boolean;
  onClose: () => void;
  posterUserId?: string;
  name: string;
  initials: string;
}) {
  const router = useRouter();
  const [openDirect, { isLoading: opening }] = useOpenDirectConversationMutation();
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSent(false);
    setBody("");
    setError(null);
    setConvId(null);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const busy = opening || sending;
  const canSend = !!body.trim() && !!posterUserId && !busy;

  async function handleSend() {
    if (!canSend || !posterUserId) return;
    setError(null);
    try {
      const conv = await openDirect(posterUserId).unwrap();
      await sendMessage({ id: conv.id, body: body.trim() }).unwrap();
      setConvId(conv.id);
      setSent(true);
    } catch (e) {
      setError(unwrapApiError(e)?.message ?? "Could not send your message. Please try again.");
    }
  }

  const avatar = (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: "40px", height: "40px", background: "rgba(48,94,130,0.05)", color: "#305E82", fontSize: "14px", fontWeight: 600 }}
    >
      {initials}
    </div>
  );

  // ---- Success ----
  if (sent) {
    return (
      <div
        className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center md:p-4"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white w-full md:w-[503px] md:max-w-full rounded-t-[25px] md:rounded-[24px] flex flex-col items-center p-6 md:p-10"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute hover:opacity-70 top-6 right-6 md:top-10 md:right-10"
            style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
          </button>

          <div className="flex flex-col items-center w-full" style={{ gap: "24px", paddingTop: "24px" }}>
            <Image src="/icons/noti-success.svg" alt="" width={165} height={112} style={{ width: "165px", height: "112.5px" }} />
            <div className="flex flex-col w-full" style={{ gap: "8px" }}>
              <h2 style={{ fontSize: "18px", lineHeight: "24px", fontWeight: 600, color: "#131313", textAlign: "center" }}>
                Reply Sent
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>
                Your reply has been sent to the property request poster, we will notify them immediately.
                You can keep track of it on your message tab.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(convId ? `/dashboard/messages?c=${convId}` : "/dashboard/messages")}
              className="flex items-center justify-center text-white hover:opacity-90 transition-opacity w-full"
              style={{
                height: "48px",
                padding: "8px 24px",
                background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
                border: "1px solid rgba(120,158,187,0.5)",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Compose ----
  return (
    <div
      className="fixed inset-0 z-[10000] flex md:items-center md:justify-center md:p-4 md:bg-[rgba(0,0,0,0.5)]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white flex flex-col w-full h-full md:h-auto md:w-[580px] md:max-h-[calc(100vh-32px)] md:rounded-[24px] md:overflow-hidden"
      >
        {/* Mobile back */}
        <button
          type="button"
          onClick={onClose}
          className="md:hidden flex items-center shrink-0 self-start hover:opacity-80"
          style={{ gap: "12px", padding: "40px 16px 16px", background: "none", border: "none", cursor: "pointer" }}
        >
          <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
          <span style={{ fontSize: "16px", lineHeight: "24px", color: "#121212" }}>Back</span>
        </button>
        {/* Desktop close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="hidden md:block absolute hover:opacity-70"
          style={{ top: "40px", right: "40px", width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
        </button>

        <div className="flex-1 md:flex-none overflow-y-auto flex flex-col gap-4 px-4 md:px-10 pt-0 md:pt-10">
          {/* Title */}
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <h2 className="text-base md:text-xl" style={{ lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
              Send a Message
            </h2>
            <p style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 400, color: "#807E7E" }}>
              Write a message to reply to the request below.
            </p>
          </div>

          {/* Replying to */}
          <div className="flex flex-col" style={{ background: "#F6F6F6", borderRadius: "15px", padding: "16px", gap: "8px" }}>
            <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "#807E7E" }}>Replying to</span>
            <div className="flex items-center" style={{ gap: "12px" }}>
              {avatar}
              <div className="flex items-center" style={{ gap: "8px" }}>
                <span style={{ fontSize: "16px", lineHeight: "1.45", fontWeight: 600, color: "#121212" }}>{name}</span>
              </div>
            </div>
          </div>

          {/* Message field */}
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212", letterSpacing: "-0.02em" }}>
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here"
              className="outline-none resize-none w-full"
              style={{
                background: "#F6F6F6",
                borderRadius: "12px",
                padding: "16px",
                minHeight: "152px",
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#121212",
                letterSpacing: "-0.02em",
              }}
            />
            <button
              type="button"
              className="inline-flex items-center self-start hover:opacity-80"
              style={{ gap: "8px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <Image src="/icons/dash/paperclip.svg" alt="" width={24} height={24} />
              <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "#305E82" }}>Attach file</span>
            </button>
          </div>

          {error && (
            <p role="alert" style={{ fontSize: "13px", lineHeight: "18px", fontWeight: 500, color: "#E30045" }}>
              {error}
            </p>
          )}
        </div>

        {/* Send */}
        <div className="shrink-0 px-4 md:px-10 pb-6 md:pb-10 pt-4">
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity w-full"
            style={{
              height: "48px",
              padding: "8px 24px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              opacity: canSend ? 1 : 0.6,
              cursor: canSend ? "pointer" : "not-allowed",
            }}
          >
            {busy ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
