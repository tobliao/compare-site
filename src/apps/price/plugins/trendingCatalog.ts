import { categories } from "../core/catalog";
import type { Category, CategoryCoverage, ComparisonLink, CrawlReport, Offer, Product, Store, Trend } from "../core/types";
import { createChannelAdapters, type ChannelOfferCandidate } from "./channelAdapters";
import { categoryDiscoveryConfigs, MIN_PRODUCTS_PER_CATEGORY, type CategoryDiscoveryConfig, type DiscoverySeed } from "./trendDiscoveryConfig";

interface TrendingCatalogResult {
  products: Product[];
  offers: Offer[];
  crawlReport: CrawlReport;
}

interface AcceptedCandidate {
  config: CategoryDiscoveryConfig;
  seed: DiscoverySeed;
  offer: ChannelOfferCandidate;
  trendScore: number;
}

const seedLimitPerCategory = Number.parseInt(process.env.DISCOVERY_SEEDS_PER_CATEGORY ?? "24", 10);
const candidateLimitPerCategory = Number.parseInt(process.env.DISCOVERY_CANDIDATES_PER_CATEGORY ?? "36", 10);
const candidateLimitPerAdapter = Number.parseInt(process.env.DISCOVERY_CANDIDATES_PER_ADAPTER ?? "4", 10);
const minProductsPerCategory = Number.parseInt(process.env.MIN_PRODUCTS_PER_CATEGORY ?? String(MIN_PRODUCTS_PER_CATEGORY), 10);
const minPricedStoresPerProduct = Number.parseInt(process.env.MIN_PRICED_STORES_PER_PRODUCT ?? "2", 10);

export async function collectTrendingCatalog(stores: Store[], trends: Trend[]): Promise<TrendingCatalogResult> {
  const adapters = createChannelAdapters(stores);
  const products: Product[] = [];
  const offers: Offer[] = [];
  const warnings: string[] = [];
  const coverage: CategoryCoverage[] = [];

  for (const config of categoryDiscoveryConfigs) {
    const category = categories.find((item) => item.id === config.categoryId);

    if (!category) {
      warnings.push(`Unknown category config: ${config.categoryId}`);
      continue;
    }

    const accepted = normalizeAcceptedCandidates(await collectCategoryCandidates(config, trends, adapters, warnings));
    const discoveredProducts = toProducts(category, accepted);
    const discoveredOffers = toOffers(discoveredProducts, accepted);
    const categoryProducts = discoveredProducts
      .filter((product) => countPricedStores(discoveredOffers, product.slug) >= minPricedStoresPerProduct)
      .slice(0, candidateLimitPerCategory);
    const categoryOffers = discoveredOffers.filter((offer) => categoryProducts.some((product) => product.slug === offer.productSlug));

    products.push(...categoryProducts);
    offers.push(...categoryOffers);

    const notes = buildCoverageNotes(category, categoryProducts.length, categoryOffers.length);
    coverage.push({
      categoryId: config.categoryId,
      targetProducts: minProductsPerCategory,
      productCount: categoryProducts.length,
      offerCount: categoryOffers.length,
      status: categoryProducts.length >= minProductsPerCategory ? "met" : "insufficient",
      notes,
    });
  }

  return {
    products,
    offers: markLowestOffers(offers),
    crawlReport: {
      generatedAt: new Date().toISOString(),
      trendSource: "Google Trends Taiwan daily RSS + Taiwan channel product pages",
      minProductsPerCategory,
      categories: coverage,
      warnings,
    },
  };
}

function toProducts(category: Category, accepted: AcceptedCandidate[]): Product[] {
  const seen = new Set<string>();
  const products: Product[] = [];

  for (const group of groupAcceptedCandidates(accepted)) {
    const representative = group[0];
    const slug = createProductSlug(representative);
    const aliases = [...new Set(group.map((item) => createLegacyTitleSlug(item.offer.title)).filter((alias) => alias && alias !== slug))];

    if (seen.has(slug)) {
      continue;
    }

    seen.add(slug);
    products.push({
      slug,
      aliases,
      name: cleanupDisplayName(representative.seed.query),
      categoryId: representative.config.categoryId,
      summary: representative.config.summaryTemplate,
      keywords: [...new Set(group.flatMap((item) => [item.seed.query, ...item.seed.requiredTerms, item.offer.title]))],
      image: representative.config.image,
      specs: {
        ...representative.config.specs,
        熱度來源: "Google Trends Taiwan",
        類別: category.name,
      },
      buyingAdvice: representative.config.buyingAdvice,
      discoveredFrom: `Taiwan channel product pages via ${representative.seed.query}`,
      trendScore: Math.max(...group.map((item) => item.trendScore)),
      trendKeyword: representative.seed.query,
      verificationStatus: "verified-product-page",
      sourceUrl: representative.offer.url,
      comparisonLinks: buildComparisonLinks(representative.seed.query, group),
    });
  }

  return products;
}

function toOffers(products: Product[], accepted: AcceptedCandidate[]): Offer[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const bestOfferByProductAndStore = new Map<string, Offer>();

  for (const item of accepted) {
    const slug = createProductSlug(item);
    const product = bySlug.get(slug);

    if (!product) {
      continue;
    }

    const key = `${slug}-${item.offer.storeId}`;
    const offer: Offer = {
      id: key,
      productSlug: slug,
      storeId: item.offer.storeId,
      title: cleanupDisplayName(item.offer.title),
      price: item.offer.price,
      currency: "TWD",
      url: item.offer.url,
      urlType: item.offer.urlType ?? "product",
      fetchedAt: item.offer.observedAt,
      priceObservedAt: item.offer.observedAt,
      availability: item.offer.availability,
      verificationStatus: item.offer.urlType === "search" ? "candidate-only" : "verified-product-page",
      sourceName: item.offer.urlType === "search" ? `${item.offer.storeId} market listing` : `${item.offer.storeId} verified product page`,
      sourceUrl: item.offer.url,
      shippingLabel: "以通路商品頁為準",
      badges: [],
    };
    const existing = bestOfferByProductAndStore.get(key);

    if (!existing || offer.price < existing.price) {
      bestOfferByProductAndStore.set(key, offer);
    }
  }

  return [...bestOfferByProductAndStore.values()];
}

function countPricedStores(offers: Offer[], productSlug: string): number {
  return new Set(offers.filter((offer) => offer.productSlug === productSlug).map((offer) => offer.storeId)).size;
}

function groupAcceptedCandidates(accepted: AcceptedCandidate[]): AcceptedCandidate[][] {
  const groups = new Map<string, AcceptedCandidate[]>();

  for (const item of accepted) {
    const key = createProductSlug(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return [...groups.values()];
}

function normalizeAcceptedCandidates(accepted: AcceptedCandidate[]): AcceptedCandidate[] {
  return groupAcceptedCandidates(accepted).flatMap((group) => {
    const verifiedOffers = group.filter((item) => item.offer.urlType !== "search");

    if (verifiedOffers.length === 0) {
      return [];
    }

    const referencePrice = median(verifiedOffers.map((item) => item.offer.price));
    const lowerBound = referencePrice * 0.45;
    const upperBound = referencePrice * 1.8;

    return group.filter((item) => item.offer.price >= lowerBound && item.offer.price <= upperBound);
  });
}

async function collectCategoryCandidates(
  config: CategoryDiscoveryConfig,
  trends: Trend[],
  adapters: ReturnType<typeof createChannelAdapters>,
  warnings: string[],
): Promise<AcceptedCandidate[]> {
  const accepted: AcceptedCandidate[] = [];
  const seeds = rankSeedsByTrend(config.seeds, trends).slice(0, seedLimitPerCategory);

  for (const { seed, score } of seeds) {
    if (accepted.length >= candidateLimitPerCategory) {
      return accepted;
    }

    const settled = await Promise.allSettled(
      adapters.map((adapter) => collectAdapterCandidates(config, seed, score, adapter, warnings)),
    );

    for (const result of settled) {
      if (result.status === "fulfilled") {
        accepted.push(...result.value);
      }
    }

    if (accepted.length >= candidateLimitPerCategory) {
      return accepted.slice(0, candidateLimitPerCategory);
    }
  }

  return accepted;
}

async function collectAdapterCandidates(
  config: CategoryDiscoveryConfig,
  seed: DiscoverySeed,
  score: number,
  adapter: ReturnType<typeof createChannelAdapters>[number],
  warnings: string[],
): Promise<AcceptedCandidate[]> {
  try {
    const candidates = (await adapter.search(seed.query)).slice(0, candidateLimitPerAdapter);
    const offers = await Promise.allSettled(candidates.map((candidate) => adapter.fetchOffer(candidate)));
    const accepted: AcceptedCandidate[] = [];

    for (const result of offers) {
      if (result.status !== "fulfilled") {
        warnings.push(`${adapter.storeId} detail failed for "${seed.query}": ${formatError(result.reason)}`);
        continue;
      }

      const offer = result.value;

      if (!offer || offer.availability === "out-of-stock") {
        continue;
      }

      if (!isValidProductTitle(offer.title, seed.requiredTerms, config.excludeTerms)) {
        continue;
      }

      accepted.push({
        config,
        seed,
        offer,
        trendScore: score,
      });
    }

    return accepted;
  } catch (error) {
    warnings.push(`${adapter.storeId} failed for "${seed.query}": ${formatError(error)}`);
    return [];
  }
}

function rankSeedsByTrend(seeds: DiscoverySeed[], trends: Trend[]): Array<{ seed: DiscoverySeed; score: number }> {
  return seeds
    .map((seed) => ({
      seed,
      score: scoreSeed(seed, trends),
    }))
    .sort((a, b) => b.score - a.score || a.seed.query.localeCompare(b.seed.query, "zh-Hant"));
}

function scoreSeed(seed: DiscoverySeed, trends: Trend[]): number {
  const normalizedQuery = normalize(seed.query);
  const normalizedTerms = seed.requiredTerms.map(normalize);
  let score = 1;

  for (const trend of trends) {
    const normalizedTrend = normalize(trend.keyword);
    const traffic = trend.trendScore ?? trend.approxTrafficNumber ?? 0;
    const matchesQuery = normalizedTrend.includes(normalizedQuery) || normalizedQuery.includes(normalizedTrend);
    const matchesTerm = normalizedTerms.some((term) => term.length >= 2 && (normalizedTrend.includes(term) || term.includes(normalizedTrend)));

    if (matchesQuery || matchesTerm) {
      score = Math.max(score, traffic || 1_000);
    }
  }

  return score;
}

function isValidProductTitle(title: string, requiredTerms: string[], excludeTerms: string[]): boolean {
  const normalizedTitle = normalize(title);
  const hasRequiredTerms = requiredTerms.every((term) => normalizedTitle.includes(normalize(term)));
  const hasExcludedTerm = excludeTerms.some((term) => normalizedTitle.includes(normalize(term)));

  return hasRequiredTerms && !hasExcludedTerm;
}

function markLowestOffers(offers: Offer[]): Offer[] {
  const offersByProduct = new Map<string, Offer[]>();

  for (const offer of offers) {
    offersByProduct.set(offer.productSlug, [...(offersByProduct.get(offer.productSlug) ?? []), offer]);
  }

  return offers.map((offer) => {
    const productOffers = offersByProduct.get(offer.productSlug) ?? [];
    const lowestPrice = Math.min(...productOffers.map((item) => item.price));

    return {
      ...offer,
      badges: offer.price === lowestPrice ? ["lowest"] : [],
    };
  });
}

function buildCoverageNotes(category: Category, productCount: number, offerCount: number): string[] {
  const notes = [`${category.name} collected ${productCount}/${minProductsPerCategory} target products with ${offerCount} verified offers.`];

  if (productCount < minProductsPerCategory) {
    notes.push("未收錄只有單一可標價來源的品項。");
  }

  return notes;
}

function createProductSlug(item: AcceptedCandidate): string {
  const seedSlug = slugifyAscii(item.seed.query) || `trend-${hashString(`${item.config.categoryId}-${item.seed.query}`)}`;

  return seedSlug || createLegacyTitleSlug(item.offer.title) || `product-${hashString(item.seed.query)}`;
}

function createLegacyTitleSlug(title: string): string {
  const normalized = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);

  return normalized;
}

function slugifyAscii(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56);
}

function hashString(value: string): string {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36);
}

function median(values: number[]): number {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);

  if (sorted.length === 0) {
    return 0;
  }

  const midpoint = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? (sorted[midpoint - 1] + sorted[midpoint]) / 2 : sorted[midpoint];
}

function cleanupDisplayName(value: string): string {
  return value
    .replace(/^【([^】]+)】\s*/, "$1 ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildComparisonLinks(seedQuery: string, group: AcceptedCandidate[]): ComparisonLink[] {
  const offerLinks = [...group]
    .sort((a, b) => a.offer.price - b.offer.price)
    .map((item) => ({
      storeId: item.offer.storeId,
      label: storeLabel(item.offer.storeId),
      url: item.offer.url,
      kind: item.offer.urlType === "search" ? ("search" as const) : ("product" as const),
      note: item.offer.urlType === "search" ? "市場列表低價" : "已抓到商品頁價格",
    }));
  const official = getOfficialReference(seedQuery);
  const searchLinks: ComparisonLink[] = [
    {
      storeId: "momo",
      label: "momo",
      url: `https://m.momoshop.com.tw/search.momo?searchKeyword=${encodeURIComponent(seedQuery)}`,
      kind: "search",
      note: "搜尋同型號",
    },
    {
      storeId: "pchome",
      label: "PChome 24h",
      url: `https://24h.pchome.com.tw/search/?q=${encodeURIComponent(seedQuery)}`,
      kind: "search",
      note: "搜尋同型號",
    },
    {
      storeId: "biggo",
      label: "BigGo",
      url: `https://biggo.com.tw/s/${encodeURIComponent(seedQuery)}`,
      kind: "search",
      note: "比價搜尋",
    },
  ];

  return dedupeLinks([...(official ? [official] : []), ...offerLinks, ...searchLinks]).slice(0, 5);
}

function getOfficialReference(seedQuery: string): ComparisonLink | undefined {
  const normalized = normalize(seedQuery);
  const references: Array<[string, ComparisonLink]> = [
    ["iphone", { storeId: "apple", label: "Apple 官方", url: "https://www.apple.com/tw/iphone/", kind: "official", note: "官方規格與建議售價" }],
    ["ipad", { storeId: "apple", label: "Apple 官方", url: "https://www.apple.com/tw/ipad/", kind: "official", note: "官方規格與建議售價" }],
    ["macbook", { storeId: "apple", label: "Apple 官方", url: "https://www.apple.com/tw/mac/", kind: "official", note: "官方規格與建議售價" }],
    ["airpods", { storeId: "apple", label: "Apple 官方", url: "https://www.apple.com/tw/airpods/", kind: "official", note: "官方規格與建議售價" }],
    ["dyson", { storeId: "brand-store", label: "Dyson 官方", url: "https://www.dyson.tw/", kind: "official", note: "官方規格與保固" }],
    ["samsung", { storeId: "brand-store", label: "Samsung 官方", url: "https://www.samsung.com/tw/", kind: "official", note: "官方規格與保固" }],
    ["pixel", { storeId: "brand-store", label: "Google Store", url: "https://store.google.com/tw/", kind: "official", note: "官方規格與保固" }],
    ["asus", { storeId: "brand-store", label: "ASUS 官方", url: "https://www.asus.com/tw/", kind: "official", note: "官方規格與保固" }],
    ["sony", { storeId: "brand-store", label: "Sony 官方", url: "https://store.sony.com.tw/", kind: "official", note: "官方規格與保固" }],
    ["lg", { storeId: "brand-store", label: "LG 官方", url: "https://www.lg.com/tw/", kind: "official", note: "官方規格與保固" }],
    ["panasonic", { storeId: "brand-store", label: "Panasonic 官方", url: "https://www.panasonic.com/tw/", kind: "official", note: "官方規格與保固" }],
    ["xiaomi", { storeId: "brand-store", label: "Xiaomi 官方", url: "https://www.mi.com/tw/", kind: "official", note: "官方規格與保固" }],
    ["anker", { storeId: "brand-store", label: "Anker 官方", url: "https://www.anker.com/", kind: "official", note: "官方規格" }],
    ["belkin", { storeId: "brand-store", label: "Belkin 官方", url: "https://www.belkin.com/tw/", kind: "official", note: "官方規格" }],
    ["lego", { storeId: "brand-store", label: "LEGO 官方", url: "https://www.lego.com/zh-tw", kind: "official", note: "官方商品資訊" }],
  ];

  return references.find(([keyword]) => normalized.includes(keyword))?.[1];
}

function storeLabel(storeId: string): string {
  const labels: Record<string, string> = {
    momo: "momo",
    pchome: "PChome 24h",
    biggo: "BigGo",
    feebee: "飛比價格",
    iherb: "iHerb",
  };

  return labels[storeId] ?? storeId;
}

function dedupeLinks(links: ComparisonLink[]): ComparisonLink[] {
  const seen = new Set<string>();
  const result: ComparisonLink[] = [];

  for (const link of links) {
    const key = link.storeId;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(link);
  }

  return result;
}

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKC").replace(/\s+/g, "");
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
