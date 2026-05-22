import { XMLParser } from "fast-xml-parser";
import type { DataPlugin, Product, Trend } from "../core/types";

export const GOOGLE_TRENDS_TW_RSS = "https://trends.google.com/trending/rss?geo=TW";
const GOOGLE_TRENDS_TW_RSS_ENDPOINTS = [
  GOOGLE_TRENDS_TW_RSS,
  "https://trends.google.com/trends/trendingsearches/daily/rss?geo=TW",
];

interface GoogleTrendItem {
  title?: string;
  pubDate?: string;
  "ht:approx_traffic"?: string;
  approx_traffic?: string;
}

interface GoogleTrendFeed {
  rss?: {
    channel?: {
      item?: GoogleTrendItem | GoogleTrendItem[];
    };
  };
}

export function createGoogleTrendsPlugin(products: Product[]): DataPlugin<Trend> {
  return {
    id: "google-trends-tw",
    async collect() {
      const { xml, sourceUrl } = await fetchGoogleTrendsRss();
      const feed = parseSafeGoogleTrendsXml(xml);
      const items = toArray(feed.rss?.channel?.item);

      return items
        .filter((item): item is Required<Pick<GoogleTrendItem, "title">> & GoogleTrendItem => Boolean(item.title))
        .map((item) => {
          const keyword = item.title.trim();
          const observedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

          return {
            id: `google-${slugify(keyword)}`,
            keyword,
            approxTraffic: getApproxTraffic(item),
            approxTrafficNumber: parseApproxTraffic(getApproxTraffic(item)),
            trendScore: parseApproxTraffic(getApproxTraffic(item)),
            sourceName: "Google Trends Taiwan RSS",
            sourceUrl,
            observedAt,
            relatedProductSlugs: findRelatedProducts(keyword, products),
          };
        });
    },
  };
}

async function fetchGoogleTrendsRss(): Promise<{ xml: string; sourceUrl: string }> {
  const errors: string[] = [];

  for (const endpoint of GOOGLE_TRENDS_TW_RSS_ENDPOINTS) {
    try {
      return {
        xml: await fetchWithTimeout(endpoint),
        sourceUrl: endpoint,
      };
    } catch (error) {
      errors.push(`${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`All Google Trends RSS endpoints failed. ${errors.join(" | ")}`);
}

export function parseApproxTraffic(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const normalized = value.toLowerCase().replace(/,/g, "").trim();
  const match = normalized.match(/(\d+(?:\.\d+)?)/);

  if (!match) {
    return 0;
  }

  const base = Number.parseFloat(match[1]);
  const multiplier = normalized.includes("m") ? 1_000_000 : normalized.includes("k") || normalized.includes("千") ? 1_000 : 1;

  return Math.round(base * multiplier);
}

function getApproxTraffic(item: GoogleTrendItem): string {
  return item["ht:approx_traffic"] ?? item.approx_traffic ?? "unknown";
}

function parseSafeGoogleTrendsXml(xml: string): GoogleTrendFeed {
  if (/<!doctype/i.test(xml)) {
    throw new Error("Rejected Google Trends XML containing a DOCTYPE declaration.");
  }

  const parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
    trimValues: true,
    processEntities: false,
  });

  return parser.parse(xml) as GoogleTrendFeed;
}

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Trends request failed with ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function findRelatedProducts(keyword: string, products: Product[]): string[] {
  const normalizedKeyword = normalize(keyword);

  return products
    .filter((product) =>
      product.keywords.some((candidate) => {
        const normalizedCandidate = normalize(candidate);
        return normalizedKeyword.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedKeyword);
      }),
    )
    .map((product) => product.slug);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
