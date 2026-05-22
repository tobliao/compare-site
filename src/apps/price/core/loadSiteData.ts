import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { categories } from "./catalog";
import type { CrawlReport, SiteData } from "./types";
import { manualTrends, offers, products, stores } from "../plugins/seedCatalog";

export async function getSiteData(): Promise<SiteData> {
  try {
    const raw = await readFile(resolve("data/site.json"), "utf-8");
    return JSON.parse(raw) as SiteData;
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      categories,
      stores,
      products,
      offers,
      trends: manualTrends,
      crawlReport: createFallbackCrawlReport(),
    };
  }
}

function createFallbackCrawlReport(): CrawlReport {
  const generatedAt = new Date().toISOString();

  return {
    generatedAt,
    trendSource: "Fallback seed data",
    minProductsPerCategory: 20,
    categories: categories.map((category) => {
      const productCount = products.filter((product) => product.categoryId === category.id).length;
      const offerCount = offers.filter((offer) => products.some((product) => product.categoryId === category.id && product.slug === offer.productSlug)).length;

      return {
        categoryId: category.id,
        targetProducts: 20,
        productCount,
        offerCount,
        status: productCount >= 20 ? "met" : "insufficient",
        notes: ["Fallback data is used only when data/site.json is unavailable."],
      };
    }),
    warnings: ["Using fallback seed data because generated data/site.json was not found."],
  };
}
