import type { InspectionResponse, InspectionStatus } from "@/services/types";

export type AppointmentStatusLabel = "Confirmed" | "Pending" | "Completed" | "Cancelled";
export type AppointmentGroup = "upcoming" | "completed" | "cancelled";

export type AppointmentVM = {
  id: string;
  time: string;
  date: string;
  property: string;
  propertyId: string;
  location: string;
  name: string;
  initials: string;
  status: AppointmentStatusLabel;
  rawStatus: InspectionStatus;
  isHost: boolean;
  note?: string;
};

const STATUS_LABEL: Record<InspectionStatus, AppointmentStatusLabel> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function groupOf(status: InspectionStatus): AppointmentGroup {
  if (status === "COMPLETED") return "completed";
  if (status === "CANCELLED") return "cancelled";
  return "upcoming"; // PENDING + CONFIRMED
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name?: string): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "—";
}

/** Map an inspection to the appointment card view, showing the *other* party. */
export function toAppointmentVM(i: InspectionResponse, myId?: string): AppointmentVM {
  const isHost = i.hostUserId === myId;
  const otherName = isHost ? i.requesterName : i.hostName;
  return {
    id: i.id,
    time: i.preferredTime,
    date: fmtDate(i.preferredDate),
    property: i.propertyTitle || "Property",
    propertyId: i.propertyId,
    location: "",
    name: otherName || "—",
    initials: initials(otherName),
    status: STATUS_LABEL[i.status],
    rawStatus: i.status,
    isHost,
    note: i.note,
  };
}
