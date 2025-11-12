// "use client";
export const metadata = {
  title: "Dubai & Abu Dhabi Property FAQ | Off-Plan, Fees & Golden Visa",
  description:
    "Answers to common questions about buying property in Dubai and Abu Dhabi, including off-plan purchases, service charges, payment plans and Golden Visa eligibility.",
  keywords: [
    "how to buy property in Dubai",
    "how to buy property in Abu Dhabi",
    "buy property in UAE",
    "Dubai property FAQ",
    "Abu Dhabi property FAQ",
    "Dubai real estate questions",
    "off-plan FAQ Dubai",
    "Golden Visa property requirements",
    "fees for buying property in Dubai",
  ],
  alternates: {
    canonical: "https://dubaihaus.com/faq",
  },
  openGraph: {
    title:
      "Dubai & Abu Dhabi Property FAQ | Off-Plan, Fees & Golden Visa | DubaiHaus",
    description:
      "Get clear explanations on off-plan buying, costs, legal aspects and residency via property investment in Dubai and Abu Dhabi.",
    url: "https://dubaihaus.com/faq",
    siteName: "DubaiHaus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Dubai & Abu Dhabi Property FAQ | Off-Plan, Fees & Golden Visa | DubaiHaus",
    description:
      "Frequently asked questions about buying and investing in Dubai and Abu Dhabi real estate.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import FAQSection from "@/components/FAQSection";


export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <div className="pt-4 pb-4">
        <FAQSection />
      </div>
    </main>
  );
}
