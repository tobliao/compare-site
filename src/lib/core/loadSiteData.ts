import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { categories } from "./catalog";
import type { SiteData } from "./types";
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
    };
  }
}
