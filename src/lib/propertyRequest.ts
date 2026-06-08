import type {
  ListingType,
  PropertyRequestResponse,
  SeekerType,
} from "@/services/types";
import { formatPrice } from "./property";

export type RequestTag = "For Rent" | "For Sale" | "Shortlet";

export type RequestVM = {
  id: string;
  posterUserId: string;
  seeking: string;
  type: RequestTag;
  bedrooms: string;
  area: string;
  by: string;
  budget: string;
  budgetSuffix?: string;
  listed: string;
  initials: string;
  name: string;
};

const TAG_BY_LISTING: Record<ListingType, RequestTag> = {
  RENT: "For Rent",
  BUY: "For Sale",
  SHORTLET: "Shortlet",
};

const SEEKER_LABEL: Record<SeekerType, string> = {
  INDIVIDUAL: "Individual",
  CORPORATE: "Corporate",
  REAL_ESTATE_AGENT: "Real Estate Agent",
  DEVELOPER: "Developer",
};

const SUFFIX_BY_LISTING: Record<ListingType, string | undefined> = {
  RENT: "/year",
  SHORTLET: "/night",
  BUY: undefined,
};

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function toRequestVM(r: PropertyRequestResponse): RequestVM {
  const first = r.posterFirstName ?? "";
  const last = r.posterLastName ?? "";
  return {
    id: r.id,
    posterUserId: r.posterUserId,
    seeking: r.title,
    type: TAG_BY_LISTING[r.listingType] ?? "For Rent",
    bedrooms: r.bedrooms ? String(r.bedrooms) : "Studio",
    area: [r.city, r.state].filter(Boolean).join(", ") || "—",
    by: SEEKER_LABEL[r.seekerType] ?? r.seekerType,
    budget: r.budget ? formatPrice(r.budget) : "—",
    budgetSuffix: r.budget ? SUFFIX_BY_LISTING[r.listingType] : undefined,
    listed: fmtDate(r.createdAt),
    initials: ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "—",
    name: `${first} ${last}`.trim() || "Seeker",
  };
}
