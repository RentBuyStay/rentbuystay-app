export type Country = {
  name: string;
  iso2: string; // ISO 3166-1 alpha-2
  dial: string; // E.164 calling code incl. leading "+"
};

/** Emoji flag from an ISO-3166 alpha-2 code (regional-indicator letters). */
export function flagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

/**
 * Calling-code list. Nigeria first (RBS is a Nigeria-based platform → sensible
 * default), then the rest alphabetically. Extend as needed.
 */
export const COUNTRIES: Country[] = [
  { name: "Nigeria", iso2: "NG", dial: "+234" },
  { name: "Algeria", iso2: "DZ", dial: "+213" },
  { name: "Angola", iso2: "AO", dial: "+244" },
  { name: "Australia", iso2: "AU", dial: "+61" },
  { name: "Austria", iso2: "AT", dial: "+43" },
  { name: "Bangladesh", iso2: "BD", dial: "+880" },
  { name: "Belgium", iso2: "BE", dial: "+32" },
  { name: "Benin", iso2: "BJ", dial: "+229" },
  { name: "Brazil", iso2: "BR", dial: "+55" },
  { name: "Cameroon", iso2: "CM", dial: "+237" },
  { name: "Canada", iso2: "CA", dial: "+1" },
  { name: "China", iso2: "CN", dial: "+86" },
  { name: "Côte d'Ivoire", iso2: "CI", dial: "+225" },
  { name: "Denmark", iso2: "DK", dial: "+45" },
  { name: "Egypt", iso2: "EG", dial: "+20" },
  { name: "Ethiopia", iso2: "ET", dial: "+251" },
  { name: "Finland", iso2: "FI", dial: "+358" },
  { name: "France", iso2: "FR", dial: "+33" },
  { name: "Germany", iso2: "DE", dial: "+49" },
  { name: "Ghana", iso2: "GH", dial: "+233" },
  { name: "Greece", iso2: "GR", dial: "+30" },
  { name: "India", iso2: "IN", dial: "+91" },
  { name: "Indonesia", iso2: "ID", dial: "+62" },
  { name: "Ireland", iso2: "IE", dial: "+353" },
  { name: "Italy", iso2: "IT", dial: "+39" },
  { name: "Japan", iso2: "JP", dial: "+81" },
  { name: "Kenya", iso2: "KE", dial: "+254" },
  { name: "Liberia", iso2: "LR", dial: "+231" },
  { name: "Mali", iso2: "ML", dial: "+223" },
  { name: "Morocco", iso2: "MA", dial: "+212" },
  { name: "Netherlands", iso2: "NL", dial: "+31" },
  { name: "New Zealand", iso2: "NZ", dial: "+64" },
  { name: "Niger", iso2: "NE", dial: "+227" },
  { name: "Norway", iso2: "NO", dial: "+47" },
  { name: "Pakistan", iso2: "PK", dial: "+92" },
  { name: "Portugal", iso2: "PT", dial: "+351" },
  { name: "Rwanda", iso2: "RW", dial: "+250" },
  { name: "Saudi Arabia", iso2: "SA", dial: "+966" },
  { name: "Senegal", iso2: "SN", dial: "+221" },
  { name: "Sierra Leone", iso2: "SL", dial: "+232" },
  { name: "South Africa", iso2: "ZA", dial: "+27" },
  { name: "Spain", iso2: "ES", dial: "+34" },
  { name: "Sweden", iso2: "SE", dial: "+46" },
  { name: "Switzerland", iso2: "CH", dial: "+41" },
  { name: "Tanzania", iso2: "TZ", dial: "+255" },
  { name: "Togo", iso2: "TG", dial: "+228" },
  { name: "Tunisia", iso2: "TN", dial: "+216" },
  { name: "Turkey", iso2: "TR", dial: "+90" },
  { name: "Uganda", iso2: "UG", dial: "+256" },
  { name: "United Arab Emirates", iso2: "AE", dial: "+971" },
  { name: "United Kingdom", iso2: "GB", dial: "+44" },
  { name: "United States", iso2: "US", dial: "+1" },
  { name: "Zambia", iso2: "ZM", dial: "+260" },
  { name: "Zimbabwe", iso2: "ZW", dial: "+263" },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0]; // Nigeria
