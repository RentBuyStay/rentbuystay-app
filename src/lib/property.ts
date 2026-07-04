import type {
  ListingType,
  PriceFrequency,
  PropertyResponse,
  PropertyStatus,
} from "@/services/types";
import type { SeekerListing, SeekerListingTag } from "@/components/SeekerPropertyCard";

/** UI-facing view model the property cards/pages render. */
export type PropertyTag = "For Rent" | "For Sale" | "Shortlet";
export type PropertyStatusLabel =
  | "Active"
  | "Awaiting Approval"
  | "Archived"
  | "Rejected"
  | "Draft";

export type PropertyVM = {
  id: string;
  referenceCode: string;
  title: string;
  location: string;
  price: string;
  priceSuffix?: string;
  tag: PropertyTag;
  status: PropertyStatusLabel;
  rawStatus: PropertyStatus;
  sqft: string;
  beds: number;
  baths: number;
  image: string;
  viewCount: number;
};

const PLACEHOLDER_IMAGE = "/images/prop1.jpg";

const TAG_BY_LISTING: Record<ListingType, PropertyTag> = {
  RENT: "For Rent",
  BUY: "For Sale",
  SHORTLET: "Shortlet",
};

const SUFFIX_BY_FREQUENCY: Record<PriceFrequency, string> = {
  PER_NIGHT: "/night",
  PER_WEEK: "/wk",
  PER_MONTH: "/mo",
  PER_YEAR: "/yr",
  OUTRIGHT: "",
};

const STATUS_LABEL: Record<PropertyStatus, PropertyStatusLabel> = {
  ACTIVE: "Active",
  AWAITING_APPROVAL: "Awaiting Approval",
  ARCHIVED: "Archived",
  REJECTED: "Rejected",
  DRAFT: "Draft",
  LIMIT_EXCEEDED: "Draft",
};

const CURRENCY_SYMBOL: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

export function formatPrice(amount: number, currency = "NGN"): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  return `${symbol}${amount.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export function primaryPhoto(p: PropertyResponse): string {
  if (!p.photos?.length) return PLACEHOLDER_IMAGE;
  const primary = p.photos.find((ph) => ph.isPrimary) ?? p.photos[0];
  return primary.url || PLACEHOLDER_IMAGE;
}

// --- Detail view model (property details page) ---

export type PropertyDetailVM = PropertyVM & {
  description: string;
  amenities: string[];
  images: string[];
  type: string;
  listedAgo: string;
  listedOn: string;
  charges: { title: string; amount: string }[];
  map: { bbox: string; marker: string } | null;
};

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function toPropertyDetailVM(p: PropertyResponse): PropertyDetailVM {
  const base = toPropertyVM(p);
  const lat = p.latitude;
  const lng = p.longitude;
  const hasCoords = typeof lat === "number" && typeof lng === "number";
  return {
    ...base,
    description: p.description || "No description provided.",
    amenities: (p.amenities ?? []).map((a) => a.name),
    images: p.photos?.length ? p.photos.map((ph) => ph.url) : [base.image],
    type: p.propertyTypeName || "—",
    listedAgo: relativeTime(p.listedAt ?? p.createdAt),
    listedOn: formatDate(p.listedAt ?? p.createdAt),
    charges: (p.charges ?? []).map((c) => ({
      title: c.title,
      amount: formatPrice(c.amount, c.currency),
    })),
    map: hasCoords
      ? {
          bbox: `${lng! - 0.01},${lat! - 0.01},${lng! + 0.01},${lat! + 0.01}`,
          marker: `${lat},${lng}`,
        }
      : null,
  };
}

/** Map a backend PropertyResponse to the UI view model. */
export function toPropertyVM(p: PropertyResponse): PropertyVM {
  return {
    id: p.id,
    referenceCode: p.referenceCode,
    title: p.title,
    location: [p.city, p.state].filter(Boolean).join(", "),
    price: formatPrice(p.price, p.currency),
    priceSuffix: SUFFIX_BY_FREQUENCY[p.priceFrequency] || undefined,
    tag: TAG_BY_LISTING[p.listingType] ?? "For Rent",
    status: STATUS_LABEL[p.status] ?? "Draft",
    rawStatus: p.status,
    sqft: p.totalAreaSqm ? `${p.totalAreaSqm.toLocaleString()} sqm` : "—",
    beds: p.bedrooms ?? 0,
    baths: p.bathrooms ?? 0,
    image: primaryPhoto(p),
    viewCount: p.viewCount ?? 0,
  };
}

// --- Seeker listing view model (Browse / saved / detail cards) ---

const SEEKER_TAG_BY_LISTING: Record<ListingType, SeekerListingTag> = {
  RENT: "FOR RENT",
  BUY: "FOR SALE",
  SHORTLET: "SHORTLET",
};

/** Map a backend PropertyResponse to the seeker card/listing view model. */
export function toSeekerListing(p: PropertyResponse): SeekerListing {
  return {
    id: p.id,
    title: p.title,
    location: [p.city, p.state].filter(Boolean).join(", ") || "—",
    price: formatPrice(p.price, p.currency),
    priceSuffix: SUFFIX_BY_FREQUENCY[p.priceFrequency] || undefined,
    tag: SEEKER_TAG_BY_LISTING[p.listingType] ?? "FOR RENT",
    sqft: p.totalAreaSqm ? `${p.totalAreaSqm.toLocaleString()} sqm` : "—",
    beds: p.bedrooms ?? 0,
    baths: p.bathrooms ?? 0,
    image: primaryPhoto(p),
    amenities: (p.amenities ?? []).map((a) => a.name),
    seller: sellerFrom(p),
    ownerUserId: p.assignedAgentUserId ?? p.ownerUserId,
    description: p.description,
    lat: p.latitude,
    lng: p.longitude,
  };
}

function sellerFrom(p: PropertyResponse): SeekerListing["seller"] {
  const name = p.assignedAgentName || p.ownerName || "Property Owner";
  const parts = name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "PO";
  return { name, initials, verified: p.listerVerified ?? false };
}
