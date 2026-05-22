import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { categories } from "@price/core/catalog";
import type { Product, SiteData, Trend } from "@price/core/types";
import { createGoogleTrendsPlugin } from "@price/plugins/googleTrends";
import { collectTrendingCatalog } from "@price/plugins/trendingCatalog";
import {
  manualTrendPlugin,
  storeSeedPlugin,
  products as fallbackProducts,
} from "@price/plugins/seedCatalog";

const outputPath = resolve("data/site.json");
const crawlReportPath = resolve("data/crawl-report.json");
const requireLiveTrends = process.env.REQUIRE_LIVE_TRENDS === "true";
const requireLiveOffers = process.env.REQUIRE_LIVE_OFFERS === "true";

async function collectSiteData(): Promise<SiteData> {
  const [stores, manualTrends] = await Promise.all([
    storeSeedPlugin.collect(),
    manualTrendPlugin.collect(),
  ]);

  const trends = await collectTrends(fallbackProducts, manualTrends);
  const catalog = await collectTrendingCatalog(stores, trends);
  const products = catalog.products;
  const offers = catalog.offers;

  if (requireLiveOffers && offers.length === 0) {
    throw new Error("Live offer collection returned no verified product-page offers.");
  }

  const trendsWithRelatedProducts = attachRelatedProducts(trends, products);

  return {
    generatedAt: new Date().toISOString(),
    categories,
    stores,
    products,
    offers,
    trends: trendsWithRelatedProducts,
    crawlReport: catalog.crawlReport,
  };
}

async function collectTrends(products: Product[], fallbackTrends: Trend[]): Promise<Trend[]> {
  try {
    const googleTrends = await createGoogleTrendsPlugin(products).collect();

    if (googleTrends.length === 0) {
      throw new Error("Google Trends returned no items.");
    }

    return dedupeTrends([...googleTrends, ...fallbackTrends]);
  } catch (error) {
    if (requireLiveTrends) {
      throw error;
    }

    console.warn(`Google Trends collection failed, using seed trends only: ${formatError(error)}`);
    return fallbackTrends;
  }
}

function attachRelatedProducts(trends: Trend[], products: Product[]): Trend[] {
  return trends.map((trend) => ({
    ...trend,
    relatedProductSlugs: findRelatedProducts(trend.keyword, products),
  }));
}

function findRelatedProducts(keyword: string, products: Product[]): string[] {
  const normalizedKeyword = normalize(keyword);

  return products
    .filter((product) => {
      const values = [product.name, ...product.keywords];
      return values.some((value) => {
        const normalizedValue = normalize(value);
        return normalizedKeyword.includes(normalizedValue) || normalizedValue.includes(normalizedKeyword);
      });
    })
    .slice(0, 8)
    .map((product) => product.slug);
}

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKC").replace(/\s+/g, "");
}

function dedupeTrends(trends: Trend[]): Trend[] {
  const seen = new Set<string>();

  return trends.filter((trend) => {
    const key = trend.keyword.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const siteData = await collectSiteData();
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(`${outputPath}.tmp`, `${JSON.stringify(siteData, null, 2)}\n`);
await writeFile(outputPath, `${JSON.stringify(siteData, null, 2)}\n`);
await writeFile(crawlReportPath, `${JSON.stringify(siteData.crawlReport, null, 2)}\n`);

console.log(
  `Collected ${siteData.products.length} products, ${siteData.offers.length} offers, and ${siteData.trends.length} trends.`,
);

if (siteData.crawlReport) {
  for (const category of siteData.crawlReport.categories) {
    console.log(`${category.categoryId}: ${category.productCount}/${category.targetProducts} products, ${category.offerCount} offers (${category.status})`);
  }
}
