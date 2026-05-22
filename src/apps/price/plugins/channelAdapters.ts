import type { Store } from "../core/types";

export interface ChannelSearchCandidate {
  storeId: string;
  title: string;
  url: string;
  sourceUrl: string;
  price?: number;
  urlType?: "product" | "search";
}

export interface ChannelOfferCandidate extends ChannelSearchCandidate {
  price: number;
  observedAt: string;
  availability: "in-stock" | "out-of-stock" | "unknown";
}

export interface ChannelAdapter {
  storeId: string;
  search(query: string): Promise<ChannelSearchCandidate[]>;
  fetchOffer(candidate: ChannelSearchCandidate): Promise<ChannelOfferCandidate | undefined>;
}

const requestHeaders = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "zh-TW,zh;q=0.9,en;q=0.6",
  "user-agent": "Mozilla/5.0 (compatible; TaiwanPriceRadar/0.1; +https://tobliao.github.io/compare-site/)",
};

export function createChannelAdapters(stores: Store[]): ChannelAdapter[] {
  const enabledStoreIds = new Set(stores.map((store) => store.id));
  const adapters: ChannelAdapter[] = [createMomoAdapter(), createPchomeAdapter(), createBigGoAdapter(), createFeebeeAdapter(), createIherbAdapter()];

  return adapters.filter((adapter) => enabledStoreIds.has(adapter.storeId));
}

function createMomoAdapter(): ChannelAdapter {
  return {
    storeId: "momo",
    async search(query) {
      const sourceUrl = `https://m.momoshop.com.tw/search.momo?searchKeyword=${encodeURIComponent(query)}`;
      const html = await fetchText(sourceUrl);
      const urls = extractUnique(html, /https?:\/\/(?:(?:m|www)\.)?momoshop\.com\.tw\/(?:goods\.momo|goods\/GoodsDetail\.jsp)\?[^"' <]*i_code=\d+[^"' <]*/gi)
        .concat(
          extractUnique(html, /(?:\/goods\.momo|\/goods\/GoodsDetail\.jsp)\?[^"' <]*i_code=\d+[^"' <]*/gi).map((url) =>
            url.startsWith("http") ? url : `https://m.momoshop.com.tw${url}`,
          ),
        );

      return urls.slice(0, 8).map((url) => ({
        storeId: "momo",
        title: "",
        url: normalizeMomoUrl(url),
        sourceUrl,
      }));
    },
    async fetchOffer(candidate) {
      const html = await fetchText(candidate.url);
      const title = extractTitle(html);
      const price = extractPrice(html);

      if (!title || !price) {
        return undefined;
      }

      return {
        ...candidate,
        title,
        price,
        observedAt: new Date().toISOString(),
        availability: detectOutOfStock(html) ? "out-of-stock" : "unknown",
      };
    },
  };
}

function createPchomeAdapter(): ChannelAdapter {
  return {
    storeId: "pchome",
    async search(query) {
      const sourceUrl = `https://ecshweb.pchome.com.tw/search/v3.3/all/results?q=${encodeURIComponent(query)}&page=1&sort=sale/dc`;
      const payload = await fetchJson<PchomeSearchResponse>(sourceUrl);
      const products = payload.prods ?? [];

      return products.slice(0, 8).map((product) => ({
        storeId: "pchome",
        title: cleanupTitle(product.name || product.describe || query),
        url: `https://24h.pchome.com.tw/prod/${product.Id}`,
        sourceUrl,
        price: product.price,
        urlType: "product",
      }));
    },
    async fetchOffer(candidate) {
      if (candidate.price) {
        return {
          ...candidate,
          title: candidate.title,
          price: candidate.price,
          observedAt: new Date().toISOString(),
          availability: "unknown",
        };
      }

      const html = await fetchText(candidate.url);
      const title = extractTitle(html);
      const price = extractPrice(html);

      if (!title || !price) {
        return undefined;
      }

      return {
        ...candidate,
        title,
        price,
        observedAt: new Date().toISOString(),
        availability: detectOutOfStock(html) ? "out-of-stock" : "unknown",
      };
    },
  };
}

function createBigGoAdapter(): ChannelAdapter {
  return createComparisonAdapter("biggo", (query) => `https://biggo.com.tw/s/${encodeURIComponent(query)}`);
}

function createFeebeeAdapter(): ChannelAdapter {
  return createComparisonAdapter("feebee", (query) => `https://feebee.com.tw/s/${encodeURIComponent(query)}/`);
}

function createIherbAdapter(): ChannelAdapter {
  return createComparisonAdapter("iherb", (query) => `https://tw.iherb.com/search?kw=${encodeURIComponent(query.replace(/^iHerb\s+/i, ""))}`);
}

function createComparisonAdapter(storeId: "biggo" | "feebee" | "iherb", buildUrl: (query: string) => string): ChannelAdapter {
  return {
    storeId,
    async search(query) {
      const sourceUrl = buildUrl(query);
      const html = await fetchText(sourceUrl, storeId === "biggo" ? 7_000 : 3_000);
      const marketPrice = storeId === "iherb" ? undefined : extractMarketPrice(html, query);
      const candidates = extractProductLikeAnchors(html, sourceUrl)
        .filter((candidate) => !candidate.url.includes("/s/"))
        .slice(0, 8);

      const productCandidates = candidates.map((candidate) => ({
        storeId,
        title: candidate.title,
        url: candidate.url,
        sourceUrl,
      }));

      return [
        ...(marketPrice
          ? [
              {
                storeId,
                title: query,
                url: sourceUrl,
                sourceUrl,
                price: marketPrice,
                urlType: "search" as const,
              },
            ]
          : []),
        ...productCandidates,
      ];
    },
    async fetchOffer(candidate) {
      if (candidate.price) {
        return {
          ...candidate,
          title: cleanupTitle(candidate.title),
          price: candidate.price,
          observedAt: new Date().toISOString(),
          availability: "unknown",
        };
      }

      const html = await fetchText(candidate.url);
      const title = extractTitle(html) || candidate.title;
      const price = extractPrice(html);

      if (!title || !price) {
        return undefined;
      }

      return {
        ...candidate,
        title,
        price,
        observedAt: new Date().toISOString(),
        availability: detectOutOfStock(html) ? "out-of-stock" : "unknown",
      };
    },
  };
}

interface PchomeSearchResponse {
  prods?: Array<{
    Id: string;
    name?: string;
    describe?: string;
    price?: number;
  }>;
}

export async function fetchText(url: string, timeoutMs = 3_000): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: requestHeaders,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson<T>(url: string, timeoutMs = 3_000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        ...requestHeaders,
        accept: "application/json,text/plain,*/*",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed ${response.status} for ${url}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function extractProductLikeAnchors(html: string, sourceUrl: string): Array<{ title: string; url: string }> {
  const source = new URL(sourceUrl);
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const candidates = anchors
    .map((match) => {
      const href = htmlDecode(match[1]);
      const title = stripTags(match[2]);
      return {
        title,
        url: toAbsoluteUrl(href, source.origin),
      };
    })
    .filter((candidate) => candidate.title.length >= 4 && /^https?:\/\//.test(candidate.url));

  return dedupeBy(candidates, (candidate) => candidate.url);
}

function extractTitle(html: string): string {
  const ogTitle = firstMatch(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const title = firstMatch(html, /<title[^>]*>([^<]+)<\/title>/i);
  const jsonLdName = firstMatch(html, /"@type"\s*:\s*"Product"[\s\S]{0,1200}?"name"\s*:\s*"([^"]{4,160})"/i);
  const value = ogTitle || title || jsonLdName || "";

  return cleanupTitle(value);
}

function extractPrice(html: string): number | undefined {
  const patterns = [
    /"price"\s*:\s*"?(\d[\d,]*)"?/i,
    /"salePrice"\s*:\s*"?(\d[\d,]*)"?/i,
    /(?:NT\$|\$)\s*(\d[\d,]*)/i,
    /(?:折扣後價格|限時折後價|促銷價|限時狂降)\s*(?:NT\$|\$)?\s*(\d[\d,]*)/i,
  ];

  for (const pattern of patterns) {
    const raw = firstMatch(html, pattern);

    if (raw) {
      const price = Number.parseInt(raw.replace(/,/g, ""), 10);

      if (Number.isFinite(price) && price > 0) {
        return price;
      }
    }
  }

  return undefined;
}

function extractMarketPrice(html: string, query: string): number | undefined {
  const minimumPrice = getMinimumMarketPrice(query);
  const prices = [
    ...html.matchAll(/(?:NT\$|\$)\s*([0-9][0-9,]+)/gi),
    ...html.matchAll(/"price"\s*:\s*"?(\d[\d,]*)"?/gi),
  ]
    .map((match) => Number.parseInt(match[1].replace(/,/g, ""), 10))
    .filter((price) => Number.isFinite(price) && price >= minimumPrice);

  return prices.length > 0 ? Math.min(...prices) : undefined;
}

function getMinimumMarketPrice(query: string): number {
  const normalized = query.toLowerCase();

  if (/macbook/.test(normalized)) {
    return 20_000;
  }

  if (/iphone|samsung|pixel|zenfone/.test(normalized)) {
    return 10_000;
  }

  if (/ipad|ps5|rog ally|dyson|roborock|dreame/.test(normalized)) {
    return 5_000;
  }

  if (/airpods|sony|magsafe|anker|belkin|switch/.test(normalized)) {
    return 700;
  }

  return 100;
}

function detectOutOfStock(html: string): boolean {
  return /售完|補貨中|到貨通知|已完售|缺貨|out of stock/i.test(stripTags(html).slice(0, 20000));
}

function cleanupTitle(value: string): string {
  return htmlDecode(value)
    .replace(/\s+/g, " ")
    .replace(/^【([^】]+)】\s*/, "$1 ")
    .replace(/\s*[-|｜]\s*(momo購物網|PChome 24h購物|BigGo|飛比價格).*$/i, "")
    .trim()
    .slice(0, 120);
}

function normalizeMomoUrl(url: string): string {
  const parsed = new URL(url);
  const iCode = parsed.searchParams.get("i_code");

  if (!iCode) {
    return url;
  }

  return `https://m.momoshop.com.tw/goods.momo?i_code=${iCode}`;
}

function toAbsoluteUrl(url: string, origin: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/")) {
    return `${origin}${url}`;
  }

  return `${origin}/${url}`;
}

function stripTags(value: string): string {
  return htmlDecode(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function htmlDecode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, " ")
    .replace(/&nbsp;/g, " ");
}

function firstMatch(value: string, pattern: RegExp): string | undefined {
  return value.match(pattern)?.[1]?.trim();
}

function extractUnique(value: string, pattern: RegExp): string[] {
  return [...new Set([...value.matchAll(pattern)].map((match) => htmlDecode(match[0])))];
}

function dedupeBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key = keyFn(item);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}
