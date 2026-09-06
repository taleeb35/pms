// Canonical public site URL. All auth/email links must use this domain
// so users never receive Lovable preview URLs in their inbox.
export const SITE_URL = "https://zonoir.com";

export const siteUrl = (path: string = "") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
