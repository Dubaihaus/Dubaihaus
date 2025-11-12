// src/app/off-plan/page.jsx  (SERVER)
export const metadata = {
  title: "Off-Plan Properties for Sale in Dubai & Abu Dhabi | Prices & Payment Plans",
  description:
    "Explore new off-plan properties for sale across Dubai and Abu Dhabi. Filter by area, developer, price, unit type and currency. View real-time prices, payment plans and handover dates.",
  keywords: [
    "off-plan properties Dubai",
    "off-plan properties Abu Dhabi",
    "new developments Dubai",
    "new properties in Abu Dhabi",
    "off-plan apartments for sale Dubai",
    "off-plan villas Abu Dhabi",
    "Dubai off-plan payment plans",
    "buy off-plan property Dubai",
    "buy property Abu Dhabi off-plan",
    "UAE off-plan projects",
  ],
  alternates: { canonical: "https://dubaihaus.com/off-plan" },
  openGraph: {
    title: "Off-Plan Properties for Sale in Dubai & Abu Dhabi | DubaiHaus",
    description:
      "Search UAE off-plan projects with filters for area, price, developer and unit types. See payment plans in AED, EUR and USD.",
    url: "https://dubaihaus.com/off-plan",
    siteName: "DubaiHaus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Off-Plan Properties for Sale in Dubai & Abu Dhabi | DubaiHaus",
    description:
      "Browse off-plan apartments, villas and townhouses in Dubai and Abu Dhabi with flexible payment plans.",
  },
  robots: { index: true, follow: true },
};

import OffPlanClient from "../../components/OffPlanClient";

export default function OffPlanPageServer() {
  // Full page → no `limit`, filters panel visible
  return <OffPlanClient />;
}
