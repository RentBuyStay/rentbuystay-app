"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useGetMeQuery } from "@/services/meApi";
import { useGetAgencyStaffQuery, useSuspendStaffMutation } from "@/services/organizationApi";
import { useGetMyPropertiesQuery } from "@/services/propertyApi";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";
import { toPropertyVM, type PropertyVM, type PropertyStatusLabel } from "@/lib/property";

const STATUS_COLORS: Record<PropertyStatusLabel, { bg: string; color: string }> = {
  Active: { bg: "#ECFDF3", color: "#027A48" },
  "Awaiting Approval": { bg: "#FFF7E9", color: "#EA651A" },
  Archived: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Rejected: { bg: "#FEF3F2", color: "#B42318" },
  Draft: { bg: "#F2F4F7", color: "#475467" },
};

function ratingLabel(n?: number): string {
  return n != null && n > 0 ? n.toFixed(1) : "0.0";
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "AG";
}

function addedAgo(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Added today";
  if (days === 1) return "Added 1 day ago";
  if (days < 30) return `Added ${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Added ${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `Added ${years} year${years === 1 ? "" : "s"} ago`;
}

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [showSuspend, setShowSuspend] = useState(false);
  const { toast } = useToast();
  const [suspendStaff, { isLoading: suspending }] = useSuspendStaffMutation();

  const { data: me } = useGetMeQuery();
  const orgId = me?.organizationId;
  const { data: staffPage, isLoading } = useGetAgencyStaffQuery(
    { orgId: orgId as string },
    { skip: !orgId }
  );
  const { data: propsPage } = useGetMyPropertiesQuery({ page: 0, size: 100 });

  const staff = (staffPage?.content ?? []).find((x) => x.userId === id);
  const assigned: PropertyVM[] = (propsPage?.content ?? [])
    .filter((p) => p.assignedAgentUserId === id)
    .map(toPropertyVM);

  const name = `${staff?.firstName ?? ""} ${staff?.lastName ?? ""}`.trim() || staff?.email || "Agent";
  const location = [staff?.city, staff?.state].filter(Boolean).join(", ") || "—";
  const verified = staff?.status?.toUpperCase() === "ACTIVE";

  if (isLoading && !staff) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "40vh", color: "#807E7E", fontSize: "14px" }}>
        Loading agent…
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "50vh", gap: "16px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#121212" }}>Agent not found</h2>
        <button
          type="button"
          onClick={() => router.push("/dashboard/agents-management")}
          style={{ padding: "8px 24px", height: "48px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", color: "white", border: "none", borderRadius: "12px", cursor: "pointer" }}
        >
          Back to Agents
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center self-start hover:opacity-80"
        style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <Image src="/icons/dash/detail-back.svg" alt="" width={24} height={24} />
        <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#525252" }}>
          Back
        </span>
      </button>

      <div className="flex items-start" style={{ gap: "16px", minWidth: 0 }}>
        <div
          className="rounded-full relative overflow-hidden shrink-0 flex items-center justify-center"
          style={{ width: "64px", height: "64px", background: "#F5FCFF", color: "#305E82", fontSize: "22px", fontWeight: 600 }}
        >
          {staff.avatarUrl ? (
            <Image src={staff.avatarUrl} alt={name} fill sizes="64px" unoptimized style={{ objectFit: "cover" }} />
          ) : (
            initialsOf(name)
          )}
        </div>

        <div className="flex flex-col" style={{ gap: "16px", minWidth: 0 }}>
          <div className="flex flex-col" style={{ gap: "8px", minWidth: 0 }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <h1 className="text-[16px] md:text-[20px]" style={{ lineHeight: "24px", fontWeight: 600, letterSpacing: "-0.02em", color: "#121212" }}>
                {name}
              </h1>
              {verified && <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />}
            </div>

            {/* Location + Listings badge */}
            <div className="flex items-center flex-wrap" style={{ gap: "16px" }}>
              <div className="flex items-center" style={{ gap: "8px" }}>
                <Image src="/icons/dash/detail-location.svg" alt="" width={16} height={16} />
                <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>{location}</span>
              </div>
              <span
                className="inline-flex items-center justify-center"
                style={{ gap: "8px", padding: "4px 8px", background: "#305E82", color: "#FFFFFF", borderRadius: "20px" }}
              >
                <Image src="/icons/dash/icon-buildings.svg" alt="" width={16} height={16} style={{ filter: "brightness(0) invert(1)" }} />
                <span style={{ fontSize: "11px", lineHeight: "18px", fontWeight: 500 }}>
                  {assigned.length} {assigned.length === 1 ? "Listing" : "Listings"}
                </span>
              </span>
            </div>

            {/* Rating + Added */}
            <div className="flex items-center flex-wrap" style={{ gap: "16px" }}>
              <div className="flex items-center" style={{ gap: "8px" }}>
                <Image src="/icons/dash/icon-star.svg" alt="" width={16} height={16} />
                <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>{ratingLabel(staff.averageRating)}</span>
              </div>
              {addedAgo(staff.joinedAt) && (
                <span style={{ fontSize: "12px", lineHeight: "20px", letterSpacing: "-0.02em", color: "#807E7E" }}>
                  {addedAgo(staff.joinedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Suspend Agent */}
          <button
            type="button"
            onClick={() => setShowSuspend(true)}
            className="inline-flex items-center self-start hover:opacity-80"
            style={{ gap: "8px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <Image src="/icons/dash/flag-red.svg" alt="" width={16} height={16} />
            <span style={{ fontSize: "12px", fontWeight: 500, color: "#D80027" }}>Suspend Agent</span>
          </button>
        </div>
      </div>

      {assigned.length === 0 ? (
        <div
          className="bg-white flex items-center justify-center"
          style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "64px", color: "#807E7E", fontSize: "14px" }}
        >
          No properties assigned to this agent yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "16px" }}>
          {assigned.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}

      {showSuspend && (
        <SuspendAgentModal
          agentName={name}
          loading={suspending}
          onClose={() => setShowSuspend(false)}
          onConfirm={async () => {
            if (!orgId) return;
            try {
              await suspendStaff({ orgId, userId: id }).unwrap();
              toast("Agent suspended", "success");
              setShowSuspend(false);
              router.push("/dashboard/agents-management");
            } catch (e) {
              toast(unwrapApiError(e)?.message ?? "Couldn’t suspend the agent.", "error");
            }
          }}
        />
      )}
    </div>
  );
}

function PropertyCard({ property }: { property: PropertyVM }) {
  const status = STATUS_COLORS[property.status];
  return (
    <Link
      href={`/dashboard/properties/${property.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow"
      style={{
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <div className="relative" style={{ width: "100%", height: "180px", background: "#EDEDED" }}>
        <Image src={property.image} alt={property.title} fill style={{ objectFit: "cover" }} sizes="352px" />
        <span
          className="absolute"
          style={{
            right: "12px",
            bottom: "12px",
            padding: "4px 12px",
            background: "#FFAE00",
            color: "#FFFFFF",
            borderRadius: "50px",
            fontSize: "11px",
            lineHeight: "16px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {property.tag}
        </span>
      </div>

      <div className="flex flex-col" style={{ padding: "16px", gap: "12px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span style={{ fontSize: "18px", lineHeight: "24px", fontWeight: 600, color: "#305E82" }}>
              {property.price}
              {property.priceSuffix && (
                <span style={{ fontSize: "12px", fontWeight: 400, color: "#807E7E" }}>
                  {property.priceSuffix}
                </span>
              )}
            </span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "12px",
                background: status.bg,
                color: status.color,
                fontSize: "10px",
                lineHeight: "16px",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {property.status}
            </span>
          </div>
          <span className="shrink-0" style={{ width: "20px", height: "20px" }}>
            <Image src="/icons/dash/edit-blue.svg" alt="" width={20} height={20} />
          </span>
        </div>

        <div className="flex flex-col" style={{ gap: "4px" }}>
          <h3 style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>
            {property.title}
          </h3>
          <div className="flex items-center" style={{ gap: "4px" }}>
            <Image src="/icons/dash/card-location.svg" alt="" width={16} height={16} />
            <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>
              {property.location}
            </span>
          </div>
        </div>

        <div
          className="flex items-center"
          style={{ gap: "12px", paddingTop: "12px", borderTop: "1px solid #F6F6F6", fontSize: "12px", color: "#807E7E" }}
        >
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-maximize.svg" alt="" width={16} height={16} />
            {property.sqft}
          </span>
          <span style={{ color: "#EDEDED" }}>|</span>
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-bed.svg" alt="" width={16} height={16} />
            {property.beds} {property.beds === 1 ? "Bed" : "Beds"}
          </span>
          <span style={{ color: "#EDEDED" }}>|</span>
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-bath.svg" alt="" width={16} height={16} />
            {property.baths} {property.baths === 1 ? "Bath" : "Baths"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SuspendAgentModal({
  agentName,
  onClose,
  onConfirm,
  loading,
}: {
  agentName: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center md:p-4"
      style={{ background: "rgba(18,18,18,0.5)" }}
      onClick={onClose}
    >
      {/* Bottom sheet on mobile; centred dialog on desktop */}
      <div
        className="relative bg-white w-full md:w-[503px] md:max-w-full rounded-t-[25px] md:rounded-[24px] flex flex-col p-6 md:p-10"
        onClick={(e) => e.stopPropagation()}
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

        <div className="flex flex-col items-center" style={{ gap: "24px" }}>
          <Image src="/icons/dash/noti-warning.svg" alt="" width={165} height={112} style={{ width: "165px", height: "112.5px" }} />
          <div className="flex flex-col w-full" style={{ gap: "8px" }}>
            <h2 className="text-[18px] md:text-[20px]" style={{ lineHeight: "24px", fontWeight: 600, color: "#131313", textAlign: "center" }}>
              Suspend Agent?
            </h2>
            <p className="text-[14px] md:text-[16px]" style={{ lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>
              Are you sure you want to suspend {agentName ? `${agentName} as an` : "this"} agent? This
              action cannot be undone, and the agent will not be able to perform any action anymore.
            </p>
          </div>
        </div>

        <div className="flex flex-col" style={{ gap: "16px", marginTop: "32px" }}>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center justify-center text-white hover:opacity-90"
            style={{
              height: "48px",
              padding: "8px 24px",
              background: "#E30045",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Suspending…" : "Suspend Agent"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center hover:opacity-80"
            style={{
              height: "48px",
              padding: "8px 24px",
              background: "#FFFFFF",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#121212",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
