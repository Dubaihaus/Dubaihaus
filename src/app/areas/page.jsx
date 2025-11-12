// src/app/areas/page.jsx
import AreasPageClient from "@/components/areas/AreasPageClient";
import JsonLd from "@/components/seo/JsonLd";

export const metadata = {
  title: "UAE Areas Guide | Communities & Locations | DubaiHaus",
  description:
    "Explore UAE areas and communities including Downtown Dubai, Dubai Marina, JVC, Business Bay and more. Find off-plan projects by location on DubaiHaus.",
  keywords: [
  "UAE properties",
    "Abu dhabi properties",
    
    "Dubai areas",
    "Dubai communities",
    "Dubai neighborhoods",
    "areas to buy property in Dubai",
    "off-plan locations Dubai",
    "United Arab Emirates"
  ],
  alternates: {
    canonical: "https://dubaihaus.com/areas",
  },
  openGraph: {
    title: "UAE Area properties | Communities & Locations | DubaiHaus",
    description:
      "Discover UAE’s key areas and see off-plan projects available in each community.",
    url: "https://dubaihaus.com/areas",
    siteName: "DubaiHaus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UAE Area properties | Communities & Locations | DubaiHaus",
    description:
      "Browse UAE mostly Dubai areas like Downtown, Marina, JVC and more to find off-plan properties.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AreasPage() {
   const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://dubaihaus.com/areas#collection",
    "url": "https://dubaihaus.com/areas",
    "name": "UAE Areas & Communities | DubaiHaus",
    "inLanguage": "en",
    "description":
      "Browse key UAE areas and communities specially Dubai such as Downtown Dubai, Dubai Marina, JVC, Business Bay and more to discover off-plan projects.",
    "isPartOf": {
      "@id": "https://dubaihaus.com/#website"
    }
  };
  return (
    <>
      <JsonLd data={jsonLd} />
      <AreasPageClient />
    </>
  );
}