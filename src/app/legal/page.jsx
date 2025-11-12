// app/legal/page.jsx
export const metadata = {
  title: "Privacy Policy & Terms | DubaiHaus Legal",
  description:
    "Read the DubaiHaus Privacy Policy and Terms & Conditions. Learn how we handle your data, cookies and legal responsibilities when browsing Dubai and Abu Dhabi real estate listings.",
  keywords: [
    "legal steps to buy property Dubai",
    "legal steps to buy property Abu Dhabi",
    "DubaiHaus privacy policy",
    "DubaiHaus terms and conditions",
    "real estate legal disclaimer Dubai",
    "GDPR PDPL DubaiHaus",
  ],
  alternates: { canonical: "https://dubaihaus.com/legal" },
  openGraph: {
    title: "Privacy Policy & Terms | DubaiHaus Legal",
    description:
      "Review DubaiHaus’ Privacy Policy and Terms & Conditions for using our Dubai and Abu Dhabi real estate listing platform.",
    url: "https://dubaihaus.com/legal",
    siteName: "DubaiHaus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy & Terms | DubaiHaus Legal",
    description:
      "Legal documentation for DubaiHaus, including privacy, cookies and terms of use for UAE property buyers.",
  },
  robots: { index: true, follow: true },
};

import LegalClient from "@/components/legal/LegalClient";

export default function LegalPage() {
  // purely renders the client component
  return <LegalClient />;
}
