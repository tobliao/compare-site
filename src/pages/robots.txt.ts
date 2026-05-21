import type { APIRoute } from "astro";
import { absoluteSiteUrl } from "../lib/core/urls";

export const GET: APIRoute = ({ site }) => {
  const body = `User-agent: *
Allow: /

Sitemap: ${absoluteSiteUrl("/sitemap.xml", site)}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
};
