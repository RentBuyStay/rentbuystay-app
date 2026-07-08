/**
 * Recover an email read from a URL query param. In query strings `+` is decoded
 * to a space (application/x-www-form-urlencoded), so `foo+1@x.com` arrives as
 * `foo 1@x.com`. Emails never contain spaces, so any space is a lost `+`.
 */
export function emailFromParam(raw: string | null | undefined): string {
  return (raw ?? "").replace(/ /g, "+").trim();
}
