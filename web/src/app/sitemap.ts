import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

const routes = ["", "/insights", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({ url: `${siteUrl}${route}` }));
}
