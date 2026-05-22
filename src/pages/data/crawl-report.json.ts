import type { APIRoute } from "astro";
import { getSiteData } from "@price/core/loadSiteData";

export const GET: APIRoute = async () => {
  const siteData = await getSiteData();

  return new Response(JSON.stringify(siteData.crawlReport ?? null, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
};
