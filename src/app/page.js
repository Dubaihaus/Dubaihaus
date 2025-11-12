// src/app/page.js
export const metadata = {
  title: "DubaiHaus: Off-Plan Properties in Dubai & Abu Dhabi ",
  description:
    "Browse verified off-plan apartments, villas and townhouses in Dubai and Abu Dhabi. Compare developers, communities and flexible payment plans in AED, EUR and USD on DubaiHaus.",
  keywords: [
    "Dubai off-plan properties",
    "Abu Dhabi off-plan properties",
    "off-plan apartments Dubai",
    "off-plan villas Abu Dhabi",
    "buy off-plan property Dubai",
    "buy property Abu Dhabi",
    "off-plan homes UAE",
    "new developments Dubai 2025",
    "new developments Abu Dhabi 2025",
    "payment plan properties Dubai",
    "Dubai real estate platform",
  ],
  alternates: {
    canonical: "https://dubaihaus.com/",
  },
  openGraph: {
    title: "DubaiHaus: Off-Plan Properties in Dubai & Abu Dhabi",
    description:
      "Discover curated off-plan projects across Dubai and Abu Dhabi with real-time prices, areas and flexible payment plans.",
    url: "https://dubaihaus.com/",
    siteName: "DubaiHaus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DubaiHaus: Off-Plan Properties in Dubai & Abu Dhabi",
    description:
      "Search and compare off-plan projects in Dubai and Abu Dhabi with flexible payment plans.",
  },
  robots: {
    index: true,
    follow: true,
  },
};
import HomeClient from "@/components/dashboard/HomeClient";
import JsonLd from "@/components/seo/JsonLd";

export default function Home() {
     const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://dubaihaus.com/#organization",
        name: "DubaiHaus",
        url: "https://dubaihaus.com/",
        logo: "https://dubaihaus.com/logo.png",
        description:
          "DubaiHaus is an independent platform for discovering off-plan real estate projects in Dubai and Abu Dhabi.",
        sameAs: [
          "https://www.tiktok.com/@dubaihaus.com?_t=ZS-90ypelf0PUw&_r=1",
          "https://www.facebook.com/share/1DEkRn4pMb/?mibextid=wwXIfr",
          "https://www.instagram.com/dubai_haus?igsh=MWRoNmF1emwwanh4cg%3D%3D&utm_source=qr",
          "https://youtube.com/@dubaihaus?si=nS7Q64bf6gPWSD_k",
          "https://x.com/dubaihaus?s=21&t=a4oLtuzI6wKe-l8h8goJ5g",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://dubaihaus.com/#website",
        url: "https://dubaihaus.com/",
        name: "DubaiHaus",
        inLanguage: "en",
        publisher: {
          "@id": "https://dubaihaus.com/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target:
            "https://dubaihaus.com/off-plan?query={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
       <JsonLd data={jsonLd} />
       <HomeClient/>
   

  
    </>
  );
}
