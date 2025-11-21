// src/data/blogPosts.js

// TEMP: static seed data.
// Later you can replace this with a backend fetch in the pages.
export const BLOG_POSTS = [
  {
    slug: "buying-off-plan-in-dubai-complete-guide",
    title: "Buying Off-Plan in Dubai: A Complete Guide",
    excerpt:
      "Understand how off-plan purchases work in Dubai, key risks, payment plans, and what to check before reserving your unit.",
    date: "2025-01-01",
    readTime: "7 min read",
    heroImage: "/hero/developers-hero", // put something into /public/blog/ or adjust path
    tags: ["Off-plan", "Investing", "Dubai"],
    content: [
      {
        type: "paragraph",
        text:
          "Buying off-plan in Dubai has become one of the most popular ways to enter the market, especially for first-time investors. With flexible payment plans and access to brand-new communities, it can be an attractive option — if you understand how it works.",
      },
      {
        type: "heading",
        text: "What does “off-plan” actually mean?",
      },
      {
        type: "paragraph",
        text:
          "Off-plan simply means you are buying a property that is not yet built, usually based on floor plans, brochures, and show apartments. You reserve a specific unit directly from the developer, with completion expected in the future.",
      },
      {
        type: "heading",
        text: "Key things to check before you reserve",
      },
      {
        type: "list",
        items: [
          "Developer track record and previous delivered projects.",
          "RERA registration and escrow account details.",
          "Construction timeline and contractual handover date.",
          "Payment plan structure (during construction vs on handover).",
          "Service charges estimate and community facilities.",
        ],
      },
      {
        type: "paragraph",
        text:
          "A DubaiHaus advisor can help you compare multiple projects side by side, so you see payment plans, locations, and developer reliability in one place before you decide.",
      },
    ],
  },
  {
    slug: "dubai-vs-abu-dhabi-where-to-invest",
    title: "Dubai vs Abu Dhabi: Where Should You Invest?",
    excerpt:
      "Comparing Dubai and Abu Dhabi in terms of rental yields, lifestyle, communities and long-term potential.",
    date: "2025-01-05",
    readTime: "6 min read",
    heroImage: "/hero/developers-hero", // put something into /public/blog/ or adjust path
    tags: ["Investment", "Dubai", "Abu Dhabi"],
    content: [
      {
        type: "paragraph",
        text:
          "Dubai and Abu Dhabi each offer strong real estate stories — but the right city for you depends on your goals, budget and lifestyle.",
      },
      {
        type: "heading",
        text: "Who is Dubai best suited for?",
      },
      {
        type: "paragraph",
        text:
          "Dubai tends to attract investors focused on liquidity, tourism-led demand and wide choice of off-plan launches. Areas like Downtown, Business Bay, Dubai Marina and Dubai Hills Estate are highly dynamic.",
      },
      {
        type: "heading",
        text: "Where does Abu Dhabi shine?",
      },
      {
        type: "paragraph",
        text:
          "Abu Dhabi’s appeal is in master-planned communities such as Saadiyat Island, Yas Island and Al Reem. Many buyers are end-users working in the capital, looking for stability and family-friendly environments.",
      },
      {
        type: "paragraph",
        text:
          "If you’re unsure which city fits you better, start with your time horizon and whether you value yield, lifestyle or long-term capital appreciation most.",
      },
    ],
  },
  {
    slug: "understanding-payment-plans-in-uae",
    title: "Understanding Payment Plans in the UAE",
    excerpt:
      "From 60/40 to post-handover plans, learn how payment structures work and what they really mean for your cash flow.",
    date: "2025-01-10",
    readTime: "5 min read",
    heroImage: "/hero/developers-hero", // put something into /public/blog/ or adjust path
    tags: ["Payment plans", "Finance", "Guides"],
    content: [
      {
        type: "paragraph",
        text:
          "Payment plans are one of the main reasons buyers choose off-plan over ready properties. But not all plans are the same, and it’s important to be clear on what you’re committing to.",
      },
      {
        type: "heading",
        text: "Common payment plan structures",
      },
      {
        type: "list",
        items: [
          "50/50: 50% during construction, 50% on handover.",
          "60/40 or 70/30: Higher during construction, smaller on handover.",
          "Post-handover plans: Part of the purchase price is paid in instalments after you receive the keys.",
        ],
      },
      {
        type: "paragraph",
        text:
          "Always compare not only the headline percentage, but the exact dates of each instalment and how it fits into your income and savings.",
      },
    ],
  },
];
