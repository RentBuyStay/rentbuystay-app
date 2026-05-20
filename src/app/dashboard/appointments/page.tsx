"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Figma 477:26216 (Desktop-47 / All Upcoming) + 477:27181 (Completed) + 477:27540 (Cancelled)
// Content area is the 1088-wide column at x:312 inside the dashboard layout (sidebar 272 + 40 padding).
//
// Layout:
//   Tabs row at y:120 (h:40): 120w each, gap 16, plain text 14/20 Geist Medium, 1px #305E82 underline on active
//   Cards list at y:184: column gap 24, each card row space-between, padding 24, bg white, border 1px #F6F6F6 r:20
//
// Card structure (row gap 24):
//   Time block 82w col gap 8 (time 18/24 SemiBold + date 12/20 Regular #807E7E)
//   Vertical line 1x96 #F6F6F6
//   Property block 236w col gap 16 (title 14/20 Medium + location row with pin) (avatar+name row + View Property link)
//   --- pushed to right by space-between ---
//   Actions block 308w col gap 24 align-end (status badge top + actions row bottom)
//
// Status badges (padding 2/8 r:16, text 12/18 Medium):
//   Confirmed: bg rgba(138,56,245,0.08) text #8A38F5
//   Pending:   bg #FFF7E9 text #EA651A
//   Completed: bg #ECFDF3 text #027A48
//   Cancelled: bg #FFECF1 text #E30045
//
// Action buttons (h:48 padding 8/24 r:12):
//   Cancel Appointment: text-only #E30045 14 Medium
//   Reschedule / Confirm: white text on blue gradient

type Status = "Confirmed" | "Pending" | "Completed" | "Cancelled";

interface Appointment {
  id: string;
  time: string;
  date: string;
  property: string;
  location: string;
  initials: string;
  name: string;
  status: Status;
  propertyHref: string;
}

const APPOINTMENTS: Record<"upcoming" | "completed" | "cancelled", Appointment[]> = {
  upcoming: [
    {
      id: "u1",
      time: "10:00 AM",
      date: "19 Apr 2026",
      property: "3-Bedroom Flat, Lekki Phase 1",
      location: "Lekki Phase 1, Lagos",
      initials: "CN",
      name: "Chidi Nwosu",
      status: "Confirmed",
      propertyHref: "/marketplace/property/3-bed-lekki",
    },
    {
      id: "u2",
      time: "11:30 AM",
      date: "20 Apr 2026",
      property: "2-Bedroom Apartment, Victoria Island",
      location: "Victoria Island, Lagos",
      initials: "AA",
      name: "Amara Akintola",
      status: "Pending",
      propertyHref: "/marketplace/property/2-bed-vi",
    },
    {
      id: "u3",
      time: "2:00 PM",
      date: "21 Apr 2026",
      property: "Duplex House, Ikoyi",
      location: "Ikoyi, Lagos",
      initials: "MO",
      name: "Moses Oladele",
      status: "Confirmed",
      propertyHref: "/marketplace/property/duplex-ikoyi",
    },
    {
      id: "u4",
      time: "5:00 PM",
      date: "21 Apr 2026",
      property: "Duplex House, Ikoyi",
      location: "Ikoyi, Lagos",
      initials: "MA",
      name: "Muyiwa Akindele",
      status: "Confirmed",
      propertyHref: "/marketplace/property/duplex-ikoyi",
    },
  ],
  completed: [
    {
      id: "c1",
      time: "2:00 PM",
      date: "21 Apr 2026",
      property: "Duplex House, Ikoyi",
      location: "Ikoyi, Lagos",
      initials: "MO",
      name: "Moses Oladele",
      status: "Completed",
      propertyHref: "/marketplace/property/duplex-ikoyi",
    },
    {
      id: "c2",
      time: "10:00 AM",
      date: "19 Apr 2026",
      property: "3-Bedroom Flat, Lekki Phase 1",
      location: "Lekki Phase 1, Lagos",
      initials: "CN",
      name: "Chidi Nwosu",
      status: "Completed",
      propertyHref: "/marketplace/property/3-bed-lekki",
    },
  ],
  cancelled: [
    {
      id: "x1",
      time: "4:15 PM",
      date: "22 Apr 2026",
      property: "Studio Apartment, Yaba",
      location: "Yaba, Lagos",
      initials: "TO",
      name: "Tolu Omotayo",
      status: "Cancelled",
      propertyHref: "/marketplace/property/studio-yaba",
    },
  ],
};

const TABS = [
  { key: "upcoming" as const, label: "All Upcoming" },
  { key: "completed" as const, label: "Completed" },
  { key: "cancelled" as const, label: "Cancelled" },
];

export default function AppointmentsPage() {
  const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const items = APPOINTMENTS[tab];

  return (
    <div className="flex flex-col" style={{ gap: "24px", maxWidth: "1088px" }}>
      {/* Tabs row — Figma 477:26993: h:40, 120w each, gap 16, bottom border on active */}
      <div className="flex items-center" style={{ gap: "16px" }}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="hover:opacity-80 transition-opacity"
              style={{
                width: "120px",
                height: "40px",
                padding: "8px 16px",
                background: "none",
                border: "none",
                borderBottom: active ? "1px solid #305E82" : "1px solid transparent",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 500,
                color: active ? "#305E82" : "#807E7E",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Cards list — Figma 477:27082-style frames: col gap 24 */}
      <div className="flex flex-col" style={{ gap: "24px" }}>
        {items.map((a) => (
          <AppointmentCard key={a.id} appointment={a} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- AppointmentCard ---------------- */

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const { time, date, property, location, initials, name, status, propertyHref } = appointment;

  return (
    <div
      className="flex items-center justify-between bg-white"
      style={{
        padding: "24px",
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        gap: "24px",
      }}
    >
      {/* Left: time | line | property */}
      <div className="flex items-center" style={{ gap: "24px" }}>
        {/* Time block — Figma layout_HC2BI2: col gap 8 w:82 */}
        <div className="flex flex-col" style={{ width: "82px", gap: "8px" }}>
          <div
            style={{
              fontSize: "18px",
              lineHeight: "24px",
              fontWeight: 600,
              color: "#121212",
              textAlign: "center",
            }}
          >
            {time}
          </div>
          <div
            style={{
              fontSize: "12px",
              lineHeight: "20px",
              fontWeight: 400,
              color: "#807E7E",
              textAlign: "center",
            }}
          >
            {date}
          </div>
        </div>

        {/* Vertical divider — Figma layout_G0PU4Y: h:96 #F6F6F6 */}
        <span style={{ width: "1px", height: "96px", background: "#F6F6F6" }} />

        {/* Property block — Figma layout_7L5BZA: col gap 16 w:236 */}
        <div className="flex flex-col" style={{ width: "236px", gap: "16px" }}>
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <div
              style={{
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 500,
                color: "#121212",
              }}
            >
              {property}
            </div>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/card-location.svg" alt="" width={16} height={16} />
              <span
                style={{
                  fontSize: "12px",
                  lineHeight: "20px",
                  fontWeight: 400,
                  color: "#807E7E",
                }}
              >
                {location}
              </span>
            </div>
          </div>

          {/* avatar + name + View Property link row */}
          <div className="flex items-center" style={{ gap: "16px" }}>
            {/* Avatar — Figma 477:27049: 32x32 r:full bg #F5F7F9, initials Geist SemiBold 13/20 #305E82 */}
            <div className="flex items-center" style={{ gap: "8px" }}>
              <div
                className="rounded-full flex items-center justify-center shrink-0"
                style={{
                  width: "32px",
                  height: "32px",
                  background: "#F5F7F9",
                  color: "#305E82",
                  fontSize: "13px",
                  lineHeight: "20px",
                  fontWeight: 600,
                }}
              >
                {initials}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  lineHeight: "20px",
                  fontWeight: 500,
                  color: "#121212",
                }}
              >
                {name}
              </span>
            </div>
            <Link
              href={propertyHref}
              className="hover:opacity-80"
              style={{
                fontSize: "12px",
                lineHeight: "20px",
                fontWeight: 500,
                color: "#305E82",
              }}
            >
              View Property
            </Link>
          </div>
        </div>
      </div>

      {/* Right: status + actions — Figma layout_0WW9PG: col gap 24 w:308 align-end */}
      <div className="flex flex-col items-end" style={{ width: "308px", gap: "24px" }}>
        <StatusBadge status={status} />
        <Actions status={status} />
      </div>
    </div>
  );
}

/* ---------------- StatusBadge ---------------- */

const BADGE_STYLES: Record<Status, { bg: string; color: string }> = {
  Confirmed: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Pending: { bg: "#FFF7E9", color: "#EA651A" },
  Completed: { bg: "#ECFDF3", color: "#027A48" },
  Cancelled: { bg: "#FFECF1", color: "#E30045" },
};

function StatusBadge({ status }: { status: Status }) {
  const s = BADGE_STYLES[status];
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        padding: "2px 8px",
        background: s.bg,
        color: s.color,
        borderRadius: "16px",
        fontSize: "12px",
        lineHeight: "18px",
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );
}

/* ---------------- Actions ---------------- */

function Actions({ status }: { status: Status }) {
  if (status === "Completed") return null;

  if (status === "Cancelled") {
    return (
      <div className="flex items-center justify-end" style={{ gap: "16px" }}>
        <PrimaryButton label="Reschedule" />
      </div>
    );
  }

  // Confirmed → Cancel + Reschedule
  // Pending → Cancel + Confirm
  const primaryLabel = status === "Pending" ? "Confirm" : "Reschedule";

  return (
    <div className="flex items-center justify-end" style={{ gap: "16px" }}>
      <button
        type="button"
        className="hover:opacity-80"
        style={{
          height: "48px",
          padding: "8px 16px",
          background: "none",
          border: "none",
          fontSize: "14px",
          fontWeight: 500,
          color: "#E30045",
          cursor: "pointer",
        }}
      >
        Cancel Appointment
      </button>
      <PrimaryButton label={primaryLabel} />
    </div>
  );
}

function PrimaryButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
      style={{
        height: "48px",
        padding: "8px 24px",
        background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
        border: "1px solid rgba(120,158,187,0.5)",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
