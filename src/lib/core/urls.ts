const baseUrl = normalizeBaseUrl(import.meta.env.BASE_URL ?? "/");

export function sitePath(path: string): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${baseUrl}${cleanPath}`;
}

export function absoluteSiteUrl(path: string, site: URL | undefined): string {
  const origin = site ?? new URL("https://example.com");
  return new URL(sitePath(path), origin).toString();
}

function normalizeBaseUrl(value: string): string {
  if (value === "/") {
    return value;
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}
