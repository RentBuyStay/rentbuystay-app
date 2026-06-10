"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useGetAgentsQuery } from "@/services/agentApi";
import { useOpenDirectConversationMutation } from "@/services/conversationApi";
import { useToast } from "@/components/Toast";

type Tab = "All Properties" | "Reviews";

function ratingLabel(n?: number): string {
  return n && n > 0 ? n.toFixed(1) : "New";
}

function joinedAgo(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Joined today";
  if (days < 30) return `Joined ${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Joined ${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `Joined ${years} year${years === 1 ? "" : "s"} ago`;
}

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: page, isLoading } = useGetAgentsQuery({ page: 0, size: 100 });
  const [openDirect] = useOpenDirectConversationMutation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("All Properties");

  const agent = page?.content.find((a) => a.userId === id);

  function contact() {
    openDirect(id)
      .unwrap()
      .then((c) => router.push(`/dashboard/messages?c=${c.id}`))
      .catch(() => {});
  }

  const back = (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center self-start hover:opacity-80"
      style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      <Image src="/icons/dash/detail-back.svg" alt="" width={24} height={24} />
      <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#525252" }}>Back</span>
    </button>
  );

  if (!agent) {
    return (
      <div className="flex flex-col" style={{ gap: "24px" }}>
        {back}
        <div
          className="bg-white flex items-center justify-center"
          style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "64px", color: "#807E7E", fontSize: "14px" }}
        >
          {isLoading ? "Loading agent…" : "This agent could not be found."}
        </div>
      </div>
    );
  }

  const name = `${agent.firstName ?? ""} ${agent.lastName ?? ""}`.trim() || "Agent";
  const initials = ((agent.firstName?.[0] ?? "") + (agent.lastName?.[0] ?? "")).toUpperCase() || "A";
  const location = [agent.city, agent.state].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      {back}

      <div className="flex items-start justify-between" style={{ gap: "16px" }}>
        <div className="flex items-start" style={{ gap: "16px", flex: 1, minWidth: 0 }}>
          <div
            className="rounded-full relative overflow-hidden shrink-0 flex items-center justify-center"
            style={{ width: "64px", height: "64px", background: "#F5FCFF", color: "#305E82", fontSize: "18px", fontWeight: 600 }}
          >
            {agent.avatarUrl ? (
              <Image src={agent.avatarUrl} alt={name} fill unoptimized sizes="64px" style={{ objectFit: "cover" }} />
            ) : (
              initials
            )}
          </div>

          <div className="flex flex-col" style={{ gap: "16px", minWidth: 0 }}>
            <div className="flex flex-col" style={{ gap: "8px", minWidth: 0 }}>
              <div className="flex items-center" style={{ gap: "8px" }}>
                <h1 className="text-[16px] md:text-[20px]" style={{ lineHeight: "24px", fontWeight: 600, color: "#121212" }}>{name}</h1>
                {agent.identityVerified && <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />}
              </div>

              {/* Location + Listings badge */}
              <div className="flex items-center flex-wrap" style={{ gap: "16px" }}>
                <div className="flex items-center" style={{ gap: "8px" }}>
                  <Image src="/icons/dash/detail-location.svg" alt="" width={16} height={16} />
                  <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>{location || "—"}</span>
                </div>
                <span
                  className="inline-flex items-center justify-center"
                  style={{ gap: "8px", padding: "4px 8px", background: "#305E82", color: "#FFFFFF", borderRadius: "20px" }}
                >
                  <Image src="/icons/dash/icon-buildings.svg" alt="" width={16} height={16} style={{ filter: "brightness(0) invert(1)" }} />
                  <span style={{ fontSize: "11px", lineHeight: "18px", fontWeight: 500 }}>{agent.listingCount ?? 0} Listings</span>
                </span>
              </div>

              {/* Rating + Joined */}
              <div className="flex items-center flex-wrap" style={{ gap: "16px" }}>
                <div className="flex items-center" style={{ gap: "8px" }}>
                  <Image src="/icons/dash/icon-star.svg" alt="" width={16} height={16} />
                  <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>{ratingLabel(agent.averageRating)}</span>
                </div>
                {joinedAgo(agent.createdAt) && (
                  <span style={{ fontSize: "12px", lineHeight: "20px", letterSpacing: "-0.02em", color: "#807E7E" }}>{joinedAgo(agent.createdAt)}</span>
                )}
              </div>
            </div>

            {/* Report Agent */}
            <button
              type="button"
              onClick={() => toast("Report submitted. Our team will review this agent.", "info")}
              className="inline-flex items-center self-start hover:opacity-80"
              style={{ gap: "8px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <Image src="/icons/dash/flag-red.svg" alt="" width={16} height={16} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#D80027" }}>Report Agent</span>
            </button>
          </div>
        </div>

        {/* Desktop: icon-only contact buttons */}
        <div className="hidden md:flex items-center shrink-0" style={{ gap: "12px" }}>
          <button
            type="button"
            aria-label="Call"
            onClick={contact}
            className="inline-flex items-center justify-center hover:opacity-90"
            style={{ width: "40px", height: "40px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", borderRadius: "12px", cursor: "pointer" }}
          >
            <Image src="/icons/dash/call.svg" alt="" width={20} height={20} />
          </button>
          <button
            type="button"
            aria-label="Message"
            onClick={contact}
            className="inline-flex items-center justify-center hover:opacity-90"
            style={{ width: "40px", height: "40px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", borderRadius: "12px", cursor: "pointer" }}
          >
            <Image src="/icons/dash/messages-2.svg" alt="" width={20} height={20} />
          </button>
        </div>
      </div>

      {agent.bio ? (
        <BioText text={agent.bio} />
      ) : (
        <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>—</p>
      )}

      {/* Mobile: full-width labelled contact buttons below the bio (Figma) */}
      <div className="flex flex-col md:hidden" style={{ gap: "16px" }}>
        <button
          type="button"
          onClick={contact}
          className="inline-flex items-center justify-center text-white hover:opacity-90"
          style={{ height: "48px", padding: "8px 24px", gap: "8px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", borderRadius: "12px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
        >
          <Image src="/icons/dash/call.svg" alt="" width={20} height={20} />
          Call
        </button>
        <button
          type="button"
          onClick={contact}
          className="inline-flex items-center justify-center hover:opacity-80"
          style={{ height: "48px", padding: "8px 24px", gap: "8px", background: "#FFFFFF", border: "1px solid #F6F6F6", borderRadius: "12px", fontSize: "14px", fontWeight: 500, color: "#121212", cursor: "pointer" }}
        >
          <Image src="/icons/dash/messages-2-dark.svg" alt="" width={20} height={20} />
          Message
        </button>
      </div>

      <TabsBar tabs={["All Properties", "Reviews"]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "All Properties" ? (
        <EmptyState>This agent doesn’t have any published listings yet.</EmptyState>
      ) : (
        <EmptyState>No reviews yet.</EmptyState>
      )}
    </div>
  );
}

function BioText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      <p
        className={expanded ? "" : "line-clamp-3 md:line-clamp-none"}
        style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="self-start md:hidden hover:opacity-80"
        style={{ background: "none", border: "none", padding: 0, fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#305E82", cursor: "pointer" }}
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white flex items-center justify-center text-center"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "64px 24px", color: "#807E7E", fontSize: "14px" }}
    >
      {children}
    </div>
  );
}

function TabsBar({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Tab[];
  activeTab: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ borderBottom: "1px solid #F6F6F6" }}>
      {tabs.map((t) => {
        const active = t === activeTab;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className="shrink-0 px-3 py-2 md:px-4 md:py-3"
            style={{
              background: "transparent",
              color: active ? "#305E82" : "#807E7E",
              border: "none",
              borderBottom: active ? "1.5px solid #305E82" : "1.5px solid transparent",
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 500,
              cursor: "pointer",
              marginBottom: "-1px",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
