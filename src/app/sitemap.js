// src/app/sitemap.js
// Next.js App Router sitemap generator for DubaiHaus

import { listDevelopers, searchProperties } from "@/lib/reellyApi";
import { BLOG_POSTS } from "@/data/blogPosts";

export const dynamic = "force-static";     // generate at build time / revalidate
export const revalidate = 60 * 60 * 24;    // 24 hours

const BASE_URL = "https://dubaihaus.com";

/**
 * Small helper to build a static route entry with SEO-friendly defaults
 */
function makeStaticRoute(path, { priority = 0.7, changeFrequency = "weekly" } = {}) {
  return {
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    priority,
    changeFrequency,
  };
}

export default async function sitemap() {
  const now = new Date();

  /* ─────────────────────────────
   * 1) STATIC PAGES
   * ──────────────────────────── */
  const staticRoutes = [
    makeStaticRoute("", { priority: 1.0, changeFrequency: "daily" }),            // /
    makeStaticRoute("/off-plan", { priority: 0.9, changeFrequency: "daily" }),
    makeStaticRoute("/areas", { priority: 0.8, changeFrequency: "weekly" }),
    makeStaticRoute("/developers", { priority: 0.8, changeFrequency: "weekly" }),
    makeStaticRoute("/map", { priority: 0.8, changeFrequency: "weekly" }),
    makeStaticRoute("/blog", { priority: 0.7, changeFrequency: "weekly" }),
    makeStaticRoute("/faq", { priority: 0.6, changeFrequency: "monthly" }),
    makeStaticRoute("/contact", { priority: 0.6, changeFrequency: "yearly" }),
  ];

  /* ─────────────────────────────
   * 2) BLOG POSTS  /blog/[slug]
   * ──────────────────────────── */
  let blogEntries = [];
  try {
    blogEntries = (BLOG_POSTS || [])
      .filter(Boolean)
      .map((post) => {
        const lastMod = post.updatedAt || post.updated_at || post.date || now;
        return {
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: new Date(lastMod),
          changeFrequency: "monthly",
          priority: 0.7,
        };
      });
  } catch (e) {
    console.error("SITEMAP: blog posts error", e);
  }

  /* ─────────────────────────────
   * 3) DEVELOPERS  /developers/[id]
   * ──────────────────────────── */
  let developerEntries = [];
  try {
    const devs = await listDevelopers({ limit: 200, offset: 0 });
    developerEntries = (devs || []).map((d) => ({
      url: `${BASE_URL}/developers/${d.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (e) {
    console.error("SITEMAP: developers error", e);
  }

  /* ─────────────────────────────
   * 4) OFF-PLAN PROJECT DETAILS  /off-plan/[id]
   *    (1st batch for SEO coverage)
   * ──────────────────────────── */
  let propertyEntries = [];
  try {
    const props = await searchProperties({
      page: 1,
      pageSize: 200,       // adjust if you want more/less
      pricedOnly: true,
      includeAllData: false,
    });

    const seen = new Set();
    const list = props?.results || [];

    propertyEntries = list.reduce((acc, p) => {
      const id = p.id || p.slug;
      if (!id) return acc;
      const key = String(id);
      if (seen.has(key)) return acc;
      seen.add(key);

      acc.push({
        url: `${BASE_URL}/off-plan/${key}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.85,
      });
      return acc;
    }, []);
  } catch (e) {
    console.error("SITEMAP: off-plan properties error", e);
  }

  /* ─────────────────────────────
   * FINAL MERGE
   * ──────────────────────────── */
  return [
    ...staticRoutes,
    ...blogEntries,
    ...developerEntries,
    ...propertyEntries,
  ];
}
