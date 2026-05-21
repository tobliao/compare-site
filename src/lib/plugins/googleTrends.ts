import { XMLParser } from "fast-xml-parser";
import type { DataPlugin, Product, Trend } from "../core/types";

const GOOGLE_TRENDS_TW_RSS = "https://trends.google.com/trending/rss?geo=TW";

interface GoogleTrendItem {
  title?: string;
  pubDate?: string;
  "ht:approx_traffic"?: string;
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
      const xml = await fetchWithTimeout(GOOGLE_TRENDS_TW_RSS);
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
            approxTraffic: item["ht:approx_traffic"] ?? "unknown",
            sourceName: "Google Trends Taiwan RSS",
            sourceUrl: GOOGLE_TRENDS_TW_RSS,
            observedAt,
            relatedProductSlugs: findRelatedProducts(keyword, products),
          };
        });
    },
  };
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
