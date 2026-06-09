"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import {
  useGetAgenciesQuery,
  useGetAgencyAgentsQuery,
  useGetAgencySummaryQuery,
} from "@/services/agentApi";
import { useOpenDirectConversationMutation } from "@/services/conversationApi";
import type { AgentListItem } from "@/services/types";

type Tab = "All Properties" | "Agents" | "Reviews";

function ratingLabel(n?: number): string {
  return n && n > 0 ? n.toFixed(1) : "New";
}

export default function AgencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("All Properties");
  const [openDirect] = useOpenDirectConversationMutation();

  const { data: summary, isLoading } = useGetAgencySummaryQuery(id);
  const { data: agenciesPage } = useGetAgenciesQuery({ page: 0, size: 100 });
  const { data: agentsPage } = useGetAgencyAgentsQuery({ id, size: 50 });

  const listItem = agenciesPage?.content.find((a) => a.id === id);
  const agents = agentsPage?.content ?? [];

  function contactUser(userId?: string) {
    if (!userId) return;
    openDirect(userId)
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

  if (!summary) {
    return (
      <div className="flex flex-col" style={{ gap: "24px" }}>
        {back}
        <div
          className="bg-white flex items-center justify-center"
          style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "64px", color: "#807E7E", fontSize: "14px" }}
        >
          {isLoading ? "Loading agency…" : "This agency could not be found."}
        </div>
      </div>
    );
  }

  const location = [summary.city, summary.state].filter(Boolean).join(", ") || "—";
  const initials = summary.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      {back}

      <div className="flex items-start justify-between" style={{ gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "16px", flex: 1, minWidth: 0 }}>
          <div
            className="relative overflow-hidden shrink-0 flex items-center justify-center"
            style={{ width: "56px", height: "56px", borderRadius: "12px", background: "#F0F4FA", color: "#305E82", fontSize: "18px", fontWeight: 600 }}
          >
            {initials}
          </div>

          <div className="flex flex-col" style={{ gap: "8px", minWidth: 0 }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <h1 style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: "#121212" }}>{summary.name}</h1>
              {listItem?.businessVerified && <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />}
            </div>

            <div className="flex items-center" style={{ gap: "16px", flexWrap: "wrap" }}>
              <div className="flex items-center" style={{ gap: "8px" }}>
                <Image src="/icons/dash/detail-location.svg" alt="" width={20} height={20} />
                <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>{location}</span>
              </div>
              <span
                className="inline-flex items-center justify-center"
                style={{ gap: "8px", height: "24px", padding: "0 12px", background: "rgba(48,94,130,0.08)", color: "#305E82", borderRadius: "100px", fontSize: "12px", fontWeight: 500 }}
              >
                <Image src="/icons/dash/icon-buildings.svg" alt="" width={16} height={16} />
                {summary.propertyCount} Listings
              </span>
              <div className="flex items-center" style={{ gap: "8px" }}>
                <Image src="/icons/dash/icon-star.svg" alt="" width={20} height={20} />
                <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>{ratingLabel(listItem?.averageRating)}</span>
              </div>
              <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>
                {summary.agentCount} {summary.agentCount === 1 ? "agent" : "agents"}
              </span>
            </div>
          </div>
        </div>

        {listItem?.ownerUserId && (
          <div className="flex items-center shrink-0" style={{ gap: "12px" }}>
            <button
              type="button"
              aria-label="Call"
              onClick={() => contactUser(listItem.ownerUserId)}
              className="inline-flex items-center justify-center hover:opacity-90"
              style={{ width: "40px", height: "40px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", borderRadius: "12px", cursor: "pointer" }}
            >
              <Image src="/icons/dash/call.svg" alt="" width={20} height={20} />
            </button>
            <button
              type="button"
              aria-label="Message"
              onClick={() => contactUser(listItem.ownerUserId)}
              className="inline-flex items-center justify-center hover:opacity-90"
              style={{ width: "40px", height: "40px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", borderRadius: "12px", cursor: "pointer" }}
            >
              <Image src="/icons/dash/messages-2.svg" alt="" width={20} height={20} />
            </button>
          </div>
        )}
      </div>

      {summary.bio && (
        <p style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>{summary.bio}</p>
      )}

      <TabsBar tabs={["All Properties", "Agents", "Reviews"]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "All Properties" && (
        <EmptyState>This agency doesn’t have any published listings yet.</EmptyState>
      )}
      {activeTab === "Agents" &&
        (agents.length === 0 ? (
          <EmptyState>No agents listed for this agency yet.</EmptyState>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "24px" }}>
            {agents.map((a) => (
              <MiniAgentCard key={a.userId} agent={a} onContact={() => contactUser(a.userId)} />
            ))}
          </div>
        ))}
      {activeTab === "Reviews" && <EmptyState>No reviews yet.</EmptyState>}
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

function MiniAgentCard({ agent, onContact }: { agent: AgentListItem; onContact: () => void }) {
  const name = `${agent.firstName ?? ""} ${agent.lastName ?? ""}`.trim() || "Agent";
  const initials = ((agent.firstName?.[0] ?? "") + (agent.lastName?.[0] ?? "")).toUpperCase() || "A";
  return (
    <div
      className="bg-white"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <Link href={`/dashboard/agents/${agent.userId}`} className="flex items-center hover:opacity-80" style={{ gap: "16px" }}>
        <div
          className="rounded-full relative overflow-hidden shrink-0 flex items-center justify-center"
          style={{ width: "48px", height: "48px", background: "rgba(48,94,130,0.05)", color: "#305E82", fontSize: "16px", fontWeight: 600 }}
        >
          {agent.avatarUrl ? (
            <Image src={agent.avatarUrl} alt={name} fill unoptimized sizes="48px" style={{ objectFit: "cover" }} />
          ) : (
            initials
          )}
        </div>
        <div className="flex flex-col" style={{ gap: "4px", flex: 1, minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>{name}</span>
            {agent.identityVerified && <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />}
          </div>
          <span style={{ fontSize: "14px", lineHeight: "20px", color: "#807E7E" }}>
            {agent.organizationName ?? "Independent"}
          </span>
        </div>
      </Link>

      <div className="flex items-center" style={{ gap: "16px", paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
        <button
          type="button"
          onClick={onContact}
          className="inline-flex items-center justify-center hover:opacity-80"
          style={{ flex: 1, height: "48px", padding: "8px 24px", gap: "8px", background: "#FFFFFF", border: "1px solid #F6F6F6", borderRadius: "12px", fontSize: "14px", fontWeight: 500, color: "#121212", cursor: "pointer" }}
        >
          <Image src="/icons/dash/call-dark.svg" alt="" width={20} height={20} />
          Call
        </button>
        <button
          type="button"
          onClick={onContact}
          className="inline-flex items-center justify-center text-white hover:opacity-90"
          style={{ flex: 1, height: "48px", padding: "8px 24px", gap: "8px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", borderRadius: "12px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
        >
          <Image src="/icons/dash/messages-2.svg" alt="" width={20} height={20} />
          Message
        </button>
      </div>
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
    <div className="flex items-center" style={{ borderBottom: "1px solid #F6F6F6" }}>
      {tabs.map((t) => {
        const active = t === activeTab;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            style={{
              padding: "12px 16px",
              background: "transparent",
              color: active ? "#305E82" : "#807E7E",
              border: "none",
              borderBottom: active ? "1.5px solid #305E82" : "1.5px solid transparent",
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 500,
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
