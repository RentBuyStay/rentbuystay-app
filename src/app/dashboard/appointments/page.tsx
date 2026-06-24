"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useGetMeQuery } from "@/services/meApi";
import {
  useGetMyInspectionsQuery,
  useConfirmInspectionMutation,
  useCancelInspectionMutation,
  useRescheduleInspectionMutation,
} from "@/services/inspectionApi";
import {
  toAppointmentVM,
  groupOf,
  type AppointmentVM,
  type AppointmentStatusLabel,
  type AppointmentGroup,
} from "@/lib/inspection";

const TABS: { key: AppointmentGroup; label: string }[] = [
  { key: "upcoming", label: "All Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function AppointmentsPage() {
  const [tab, setTab] = useState<AppointmentGroup>("upcoming");
  const { data: me } = useGetMeQuery();
  const { data: inspections, isLoading, isError } = useGetMyInspectionsQuery();

  const all = (inspections ?? []).map((i) => toAppointmentVM(i, me?.id));
  const items = all.filter((a) => groupOf(a.rawStatus) === tab);

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ gap: "16px" }}>
        {TABS.map((t) => {
          const active = tab === t.key;
          const count = all.filter((a) => groupOf(a.rawStatus) === t.key).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="hover:opacity-80 transition-opacity shrink-0 whitespace-nowrap"
              style={{
                padding: "8px 12px",
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
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <EmptyBox>Loading appointments…</EmptyBox>
      ) : isError ? (
        <EmptyBox>Couldn&rsquo;t load your appointments.</EmptyBox>
      ) : items.length === 0 ? (
        <EmptyBox>
          {tab === "upcoming"
            ? "No upcoming appointments."
            : tab === "completed"
              ? "No completed appointments."
              : "No cancelled appointments."}
        </EmptyBox>
      ) : (
        <div className="flex flex-col" style={{ gap: "24px" }}>
          {items.map((a) => (
            <AppointmentCard key={a.id} appointment={a} userRole={me?.userType} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white flex items-center justify-center"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", fontSize: "14px", color: "#807E7E" }}
    >
      {children}
    </div>
  );
}

/* ---------------- AppointmentCard ---------------- */

function AppointmentCard({ appointment, userRole }: { appointment: AppointmentVM, userRole?: string }) {
  const { id, time, date, property, propertyId, location, initials, name, status, rawStatus, isHost } = appointment;
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const [confirmInspection, { isLoading: confirming }] = useConfirmInspectionMutation();
  const [cancelInspection, { isLoading: cancelling }] = useCancelInspectionMutation();

  const busy = confirming || cancelling;
  function handleCancel() {
    if (window.confirm("Cancel this appointment?")) cancelInspection(id);
  }

  const propertyBlock = (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>{property}</div>
      {location && (
        <div className="flex items-center" style={{ gap: "8px" }}>
          <Image src="/icons/dash/card-location.svg" alt="" width={16} height={16} />
          <span style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 400, color: "#305E82" }}>{location}</span>
        </div>
      )}
    </div>
  );
  const personRow = (
    <div className="flex items-center" style={{ gap: "16px" }}>
      <div className="flex items-center" style={{ gap: "8px" }}>
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{ width: "32px", height: "32px", background: "#F5F7F9", color: "#305E82", fontSize: "13px", lineHeight: "20px", fontWeight: 600 }}
        >
          {initials}
        </div>
        <span style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>{name}</span>
      </div>
      <Link href={userRole === "PROPERTY_SEEKER" ? `/dashboard/browse/${propertyId}` : `/dashboard/properties/${propertyId}`} className="hover:opacity-80" style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 500, color: "#305E82" }}>
        View Property
      </Link>
    </div>
  );

  return (
    <>
      {/* Desktop — time | content ......... badge / actions */}
      <div className="hidden md:flex items-center justify-between bg-white" style={{ padding: "24px", border: "1px solid #F6F6F6", borderRadius: "20px", gap: "24px" }}>
        <div className="flex items-center" style={{ gap: "24px" }}>
          <div className="flex flex-col" style={{ width: "82px", gap: "8px" }}>
            <div style={{ fontSize: "18px", lineHeight: "24px", fontWeight: 600, color: "#121212", textAlign: "center" }}>{time}</div>
            <div style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>{date}</div>
          </div>
          <span style={{ width: "1px", height: "96px", background: "#F6F6F6" }} />
          <div className="flex flex-col" style={{ width: "236px", gap: "16px" }}>
            {propertyBlock}
            {personRow}
          </div>
        </div>
        <div className="flex flex-col items-end" style={{ width: "320px", gap: "24px" }}>
          <StatusBadge status={status} />
          <Actions status={rawStatus} isHost={isHost} busy={busy} onConfirm={() => confirmInspection(id)} onCancel={handleCancel} onReschedule={() => setRescheduleOpen(true)} />
        </div>
      </div>

      {/* Mobile — time + badge row, content, full-width action buttons */}
      <div className="md:hidden bg-white flex flex-col" style={{ padding: "16px", border: "1px solid #F6F6F6", borderRadius: "20px", gap: "16px" }}>
        <div className="flex items-start justify-between" style={{ gap: "12px" }}>
          <div className="flex items-center flex-wrap" style={{ gap: "8px" }}>
            <span style={{ fontSize: "20px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>{time}</span>
            <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>{date}</span>
          </div>
          <StatusBadge status={status} />
        </div>
        {propertyBlock}
        <div className="flex items-center justify-between" style={{ gap: "12px" }}>{personRow}</div>
        {rawStatus !== "COMPLETED" && (
          <div className="flex items-stretch" style={{ gap: "12px" }}>
            {rawStatus !== "CANCELLED" && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={busy}
                className="flex-1 flex items-center justify-center hover:opacity-80"
                style={{ height: "48px", borderRadius: "12px", background: "transparent", border: "none", fontSize: "14px", fontWeight: 500, color: "#E30045", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}
              >
                Cancel Appointment
              </button>
            )}
            <button
              type="button"
              onClick={() => (rawStatus === "PENDING" && isHost ? confirmInspection(id) : setRescheduleOpen(true))}
              disabled={busy}
              className="flex-1 flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              style={{ height: "48px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", borderRadius: "12px", fontSize: "14px", fontWeight: 500, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}
            >
              {rawStatus === "PENDING" && isHost ? "Confirm" : "Reschedule"}
            </button>
          </div>
        )}
      </div>

      {rescheduleOpen && <RescheduleModal id={id} onClose={() => setRescheduleOpen(false)} />}
    </>
  );
}

/* ---------------- StatusBadge ---------------- */

const BADGE_STYLES: Record<AppointmentStatusLabel, { bg: string; color: string }> = {
  Confirmed: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Pending: { bg: "#FFF7E9", color: "#EA651A" },
  Completed: { bg: "#ECFDF3", color: "#027A48" },
  Cancelled: { bg: "#FFECF1", color: "#E30045" },
};

function StatusBadge({ status }: { status: AppointmentStatusLabel }) {
  const s = BADGE_STYLES[status];
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{ padding: "2px 8px", background: s.bg, color: s.color, borderRadius: "16px", fontSize: "12px", lineHeight: "18px", fontWeight: 500 }}
    >
      {status}
    </span>
  );
}

/* ---------------- Actions ---------------- */

function Actions({
  status,
  isHost,
  busy,
  onConfirm,
  onCancel,
  onReschedule,
}: {
  status: AppointmentVM["rawStatus"];
  isHost: boolean;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onReschedule: () => void;
}) {
  if (status === "COMPLETED") return null;

  if (status === "CANCELLED") {
    return (
      <div className="flex items-center justify-end" style={{ gap: "16px" }}>
        <PrimaryButton label="Reschedule" onClick={onReschedule} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end" style={{ gap: "16px" }}>
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="hover:opacity-80"
        style={{
          height: "48px",
          padding: "8px 16px",
          background: "none",
          border: "none",
          fontSize: "14px",
          fontWeight: 500,
          color: "#E30045",
          cursor: busy ? "not-allowed" : "pointer",
          opacity: busy ? 0.6 : 1,
        }}
      >
        Cancel Appointment
      </button>
      {/* Only the host confirms a pending request; otherwise offer reschedule. */}
      {status === "PENDING" && isHost ? (
        <PrimaryButton label="Confirm" onClick={onConfirm} disabled={busy} />
      ) : (
        <PrimaryButton label="Reschedule" onClick={onReschedule} disabled={busy} />
      )}
    </div>
  );
}

function PrimaryButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
      style={{
        height: "48px",
        padding: "8px 24px",
        background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
        border: "1px solid rgba(120,158,187,0.5)",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}

/* ---------------- RescheduleModal ---------------- */

function RescheduleModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [reschedule, { isLoading }] = useRescheduleInspectionMutation();

  const canSubmit = !!date && !!time && !isLoading;

  async function submit() {
    if (!canSubmit) return;
    try {
      await reschedule({ id, body: { preferredDate: date, preferredTime: time, note: note || undefined } }).unwrap();
      onClose();
    } catch {
      /* keep modal open on error */
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center md:p-4"
      style={{ background: "rgba(18,18,18,0.5)", zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white flex flex-col w-full md:w-[440px] md:max-w-full rounded-t-[25px] md:rounded-[20px]"
        style={{ padding: "24px", gap: "16px" }}
      >
        <h2 style={{ fontSize: "18px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
          Reschedule appointment
        </h2>
        <Field label="New date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full outline-none bg-transparent" style={{ fontSize: "14px", color: "#121212" }} />
        </Field>
        <Field label="New time">
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full outline-none bg-transparent" style={{ fontSize: "14px", color: "#121212" }} />
        </Field>
        <Field label="Note (optional)">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" className="w-full outline-none bg-transparent" style={{ fontSize: "14px", color: "#121212" }} />
        </Field>
        <div className="flex items-center justify-end" style={{ gap: "12px", marginTop: "8px" }}>
          <button type="button" onClick={onClose} style={{ padding: "10px 16px", fontSize: "14px", fontWeight: 500, color: "#121212", background: "none", border: "none", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="text-white"
            style={{
              height: "44px",
              padding: "8px 24px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            {isLoading ? "Saving…" : "Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      <label style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>{label}</label>
      <div className="flex items-center" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "10px 16px" }}>
        {children}
      </div>
    </div>
  );
}
