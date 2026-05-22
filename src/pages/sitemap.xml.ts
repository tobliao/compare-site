import type { APIRoute } from "astro";
import { getSiteData } from "../lib/core/loadSiteData";
import { absoluteSiteUrl } from "../lib/core/urls";
import { topics } from "../lib/plugins/topicCatalog";

export const GET: APIRoute = async ({ site }) => {
  const siteData = await getSiteData();
  const urls = [
    { loc: absoluteSiteUrl("/", site), priority: "1.0" },
    { loc: absoluteSiteUrl("/products/", site), priority: "0.9" },
    { loc: absoluteSiteUrl("/trends/", site), priority: "0.9" },
    { loc: absoluteSiteUrl("/deals/", site), priority: "0.9" },
    ...topics.map((topic) => ({
      loc: absoluteSiteUrl(`/topics/${topic.slug}/`, site),
      priority: "0.85",
    })),
    ...siteData.categories.map((category) => ({
      loc: absoluteSiteUrl(`/category/${category.id}/`, site),
      priority: "0.75",
    })),
    ...siteData.products.map((product) => ({
      loc: absoluteSiteUrl(`/compare/${product.slug}/`, site),
      priority: "0.8",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${siteData.generatedAt.slice(0, 10)}</lastmod>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
