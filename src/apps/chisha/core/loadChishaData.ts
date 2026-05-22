import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ChishaCrawlReport, ChishaSiteData } from "./types";
import { chishaArea } from "../data/xitunFeed";

const emptyStats = {
  placeCount: 0,
  reviewCount: 0,
  photoCount: 0,
  sourceCount: 0,
  todayReviewCount: 0,
  ratingBuckets: {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  },
  activitySeries: [],
} satisfies ChishaSiteData["stats"];

export async function getChishaData(): Promise<ChishaSiteData> {
  try {
    const raw = await readFile(resolve("data/chisha/site.json"), "utf-8");
    return JSON.parse(raw) as ChishaSiteData;
  } catch {
    const generatedAt = new Date().toISOString();
    const crawlReport: ChishaCrawlReport = {
      generatedAt,
      status: "not-collected",
      area: chishaArea.label,
      queryCount: 0,
      placeCount: 0,
      reviewCount: 0,
      photoCount: 0,
      warnings: ["data/chisha/site.json was not found. Run `npm run collect:chisha` with GOOGLE_MAPS_API_KEY to collect live Places data."],
      errors: [],
    };

    return {
      generatedAt,
      status: "not-collected",
      area: chishaArea,
      sources: [],
      places: [],
      stats: emptyStats,
      crawlReport,
    };
  }
}
