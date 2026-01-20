// src/app/sitemap.js
// SEO-Optimized Sitemap for DubaiHaus (Next.js App Router)

import { listDevelopers, searchAllProjects } from "@/lib/reellyApi";
import { BLOG_POSTS } from "@/data/blogPosts";

export const dynamic = "force-static";   // metadata route config
export const revalidate = 86400;         // 24 hours (must be a literal)

const BASE_URL = "https://dubaihaus.com/en";

function makeStatic(path, priority = 0.7, freq = "weekly") {
  return {
    url: `${BASE_URL}${path === '/' ? '' : path}`,
    lastModified: new Date(),
    priority,
    changeFrequency: freq,
  };
}

export default async function sitemap() {
  const now = new Date();

  /* 1) Static pages */
  const staticPages = [
    makeStatic("/", 1.0, "daily"),
    makeStatic("/off-plan", 0.9, "daily"),
    makeStatic("/areas", 0.8, "weekly"),
    makeStatic("/developers", 0.8, "weekly"),
    makeStatic("/map", 0.8, "weekly"),
    makeStatic("/blog", 0.7, "weekly"),
    makeStatic("/faq", 0.6, "monthly"),
    makeStatic("/contact", 0.5, "yearly"),
  ];

  /* 2) Blog posts /blog/[slug] */
  let blogPages = [];
  try {
    blogPages = (BLOG_POSTS || [])
      .filter(Boolean)
      .map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.date || now),
        priority: 0.7,
        changeFrequency: "monthly",
      }));
  } catch (e) {
    console.error("Sitemap: Blog posts error", e);
  }

  /* 3) Developer profiles /developers/[id] */
  let developerPages = [];
  try {
    const devs = await listDevelopers({ limit: 300, offset: 0 });
    developerPages = (devs || []).map((d) => ({
      url: `${BASE_URL}/developers/${d.id}`,
      lastModified: now,
      priority: 0.8,
      changeFrequency: "weekly",
    }));
  } catch (e) {
    console.error("Sitemap: Developer error", e);
  }

  /* 4) Off-plan detail pages /off-plan/[id] */
  let offplanPages = [];
  try {
    const allProjects = await searchAllProjects({
      pageSize: 200,
      maxPages: 5,       // up to 1000 projects
      pricedOnly: true,
    });

    const seen = new Set();
    offplanPages = (allProjects?.results || [])
      .filter((p) => p && p.id)
      .reduce((acc, p) => {
        const id = String(p.id);
        if (seen.has(id)) return acc;
        seen.add(id);

        acc.push({
          url: `${BASE_URL}/off-plan/${id}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
          priority: 0.9,
          changeFrequency: "weekly",
        });
        return acc;
      }, []);
  } catch (e) {
    console.error("Sitemap: Off-plan error", e);
  }

  /* 5) Merge + dedupe by URL */
  const allEntries = [
    ...staticPages,
    ...blogPages,
    ...developerPages,
    ...offplanPages,
  ];

  const seenUrls = new Set();
  const uniqueEntries = [];

  for (const entry of allEntries) {
    if (!entry?.url) continue;
    if (seenUrls.has(entry.url)) continue;
    seenUrls.add(entry.url);
    uniqueEntries.push(entry);
  }

  return uniqueEntries;
}
