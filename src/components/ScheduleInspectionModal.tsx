"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGetActivePropertiesQuery } from "@/services/propertyApi";
import { useScheduleInspectionMutation } from "@/services/inspectionApi";
import { useGetMeQuery } from "@/services/meApi";
import { unwrapApiError } from "@/services/api";

const TIME_SLOTS = ["09:00", "11:00", "13:00", "15:00", "17:00"];

export default function ScheduleInspectionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [property, setProperty] = useState(""); // propertyId
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only ACTIVE (approved) listings can be inspected, and you can't schedule on
  // your own property (you'd be the host). GET /properties returns all statuses,
  // so filter down to what's actually schedulable.
  const { data: me } = useGetMeQuery();
  const { data: propPage } = useGetActivePropertiesQuery({ size: 50 }, { skip: !open });
  const properties = (propPage?.content ?? []).filter(
    (p) => p.status === "ACTIVE" && p.ownerUserId !== me?.id
  );
  const [scheduleInspection, { isLoading: scheduling }] = useScheduleInspectionMutation();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Reset to the form view each time the modal (re)opens.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSent(false);
    setError(null);
  }, [open]);

  if (!open) return null;

  const canSend = !!property && !!date && !!time && !scheduling;

  async function handleSend() {
    if (!canSend) return;
    const selected = properties.find((p) => p.id === property);
    if (!selected) return;
    setError(null);
    try {
      await scheduleInspection({
        propertyId: selected.id,
        hostUserId: selected.ownerUserId ?? "",
        preferredDate: date, // <input type=date> → ISO YYYY-MM-DD
        preferredTime: time,
        note: note || undefined,
      }).unwrap();
      setSent(true);
    } catch (e) {
      setError(unwrapApiError(e)?.message ?? "Could not schedule the inspection. Please try again.");
    }
  }

  if (sent) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ background: "rgba(18,18,18,0.5)", zIndex: 10000 }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white"
          style={{ width: "503px", maxWidth: "100%", height: "462px", borderRadius: "24px" }}
        >
          
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute hover:opacity-70"
            style={{ top: "40px", right: "40px", width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
          </button>

          
          <div
            className="absolute flex flex-col items-center"
            style={{ left: "40px", top: "88px", width: "423px", gap: "24px" }}
          >
            <Image
              src="/icons/noti-success.svg"
              alt=""
              width={165}
              height={112}
              style={{ width: "165px", height: "112.5px" }}
            />
            <div className="flex flex-col" style={{ gap: "8px", width: "100%" }}>
              <h2
                style={{
                  fontSize: "20px",
                  lineHeight: "30px",
                  fontWeight: 600,
                  color: "#121212",
                  textAlign: "center",
                }}
              >
                Inspection Request Sent
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  fontWeight: 400,
                  color: "#807E7E",
                  textAlign: "center",
                }}
              >
                Your inspection request has been sent successfully, you will be notified when
                they confirm, cancel or reschedule the appointment.
              </p>
            </div>
          </div>

          
          <Link
            href="/dashboard/appointments"
            onClick={onClose}
            className="absolute flex items-center justify-center text-white hover:opacity-90 transition-opacity"
            style={{
              left: "40px",
              top: "374.5px",
              width: "423px",
              height: "48px",
              padding: "8px 24px",
              gap: "8px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Go to Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(18,18,18,0.5)", zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white"
        style={{ width: "612px", maxWidth: "100%", maxHeight: "calc(100vh - 32px)", borderRadius: "24px", overflowY: "auto" }}
      >
        
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute hover:opacity-70"
          style={{ top: "40px", right: "40px", width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
        </button>

        
        <div
          className="absolute flex flex-col"
          style={{ left: "40px", top: "40px", width: "363px", gap: "8px" }}
        >
          <h2 style={{ fontSize: "20px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
            Schedule Inspection
          </h2>
          <p style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>
            Fill the details below to schedule a property inspection.
          </p>
        </div>

        
        <div
          className="relative flex flex-col"
          style={{ paddingLeft: "40px", paddingRight: "40px", paddingTop: "132px", paddingBottom: "40px", gap: "16px" }}
        >
          {/* Property dropdown — real ACTIVE listings (value = id) */}
          <FieldGroup label="Property">
            <div className="flex items-center" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", height: "40px" }}>
              <select
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                className="w-full outline-none bg-transparent appearance-none"
                style={{ fontSize: "14px", lineHeight: "24px", color: property ? "#121212" : "#807E7E", letterSpacing: "-0.02em" }}
              >
                <option value="" disabled hidden>
                  {properties.length ? "Select property" : "No properties available to inspect yet"}
                </option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id} style={{ color: "#121212" }}>
                    {p.title}
                    {p.city ? ` — ${p.city}` : ""}
                  </option>
                ))}
              </select>
              <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} className="shrink-0" />
            </div>
          </FieldGroup>

          
          <FieldGroup label="Preferred Date">
            <div
              className="flex items-center justify-between relative"
              style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", height: "40px" }}
            >
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 outline-none bg-transparent date-input-hide-icon"
                style={{
                  fontSize: "14px",
                  lineHeight: "24px",
                  fontWeight: 400,
                  color: date ? "#121212" : "#807E7E",
                  letterSpacing: "-0.02em",
                }}
              />
              {/* Override native ::-webkit-calendar-picker-indicator inside this scope */}
              <style>{`
                .date-input-hide-icon::-webkit-calendar-picker-indicator { opacity: 0; cursor: pointer; }
                .date-input-hide-icon::-webkit-inner-spin-button,
                .date-input-hide-icon::-webkit-clear-button { display: none; }
              `}</style>
              <Image
                src="/icons/dash/calendar-field.svg"
                alt=""
                width={20}
                height={20}
                style={{ pointerEvents: "none", position: "absolute", right: "16px" }}
              />
            </div>
          </FieldGroup>

          {/* Preferred Time dropdown */}
          <FieldGroup label="Preferred Time">
            <Select
              value={time}
              onChange={setTime}
              options={TIME_SLOTS}
              placeholder="Select preferred time"
            />
          </FieldGroup>

          {/* Note (Optional) — textarea, padding 16, taller */}
          <FieldGroup label="Note (Optional)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write any specific question or request here..."
              rows={4}
              className="outline-none resize-none w-full"
              style={{
                background: "#F6F6F6",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#121212",
                letterSpacing: "-0.02em",
              }}
            />
          </FieldGroup>

          
          {error && (
            <p role="alert" style={{ fontSize: "13px", lineHeight: "18px", fontWeight: 500, color: "#E30045" }}>
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
            style={{
              width: "100%",
              height: "48px",
              padding: "8px 24px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              opacity: canSend ? 1 : 0.5,
              cursor: canSend ? "pointer" : "not-allowed",
              marginTop: "8px",
            }}
          >
            {scheduling ? "Sending…" : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      <label
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 500,
          color: "#121212",
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div
      className="flex items-center"
      style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "8px", height: "40px" }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full outline-none bg-transparent appearance-none"
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: value ? "#121212" : "#807E7E",
          letterSpacing: "-0.02em",
          cursor: "pointer",
        }}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} style={{ color: "#121212" }}>
            {o}
          </option>
        ))}
      </select>
      <Image src="/icons/chevron-down.svg" alt="" width={16} height={16} className="shrink-0" />
    </div>
  );
}
