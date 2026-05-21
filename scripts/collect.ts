import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { categories } from "../src/lib/core/catalog";
import type { Product, SiteData, Trend } from "../src/lib/core/types";
import { createGoogleTrendsPlugin } from "../src/lib/plugins/googleTrends";
import {
  manualTrendPlugin,
  offerSeedPlugin,
  productSeedPlugin,
  storeSeedPlugin,
} from "../src/lib/plugins/seedCatalog";

const outputPath = resolve("data/site.json");
const requireLiveTrends = process.env.REQUIRE_LIVE_TRENDS === "true";

async function collectSiteData(): Promise<SiteData> {
  const [stores, products, offers, manualTrends] = await Promise.all([
    storeSeedPlugin.collect(),
    productSeedPlugin.collect(),
    offerSeedPlugin.collect(),
    manualTrendPlugin.collect(),
  ]);

  const trends = await collectTrends(products, manualTrends);

  return {
    generatedAt: new Date().toISOString(),
    categories,
    stores,
    products,
    offers,
    trends,
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

console.log(
  `Collected ${siteData.products.length} products, ${siteData.offers.length} offers, and ${siteData.trends.length} trends.`,
);
