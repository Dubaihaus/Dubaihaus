// src/app/contact/page.jsx
export const metadata = {
  title: "Contact DubaiHaus | Speak with Dubai & Abu Dhabi Property Experts",
  description:
    "Get in touch with DubaiHaus for help buying, selling or investing in property in Dubai and Abu Dhabi. Talk to our experts about off-plan projects, payment plans and Golden Visa eligibility.",
  keywords: [
    "contact DubaiHaus",
    "Dubai property contact",
    "speak to real estate expert Dubai",
    "off-plan property consultation Dubai",
    "Dubai real estate agency contact",
    "buy property in Dubai help",
    "Dubai Abu Dhabi property experts",
  ],
  alternates: {
    canonical: "https://dubaihaus.com/contact",
  },
  openGraph: {
    title:
      "Contact DubaiHaus | Dubai & Abu Dhabi Property Experts | DubaiHaus",
    description:
      "Reach out to our team for tailored advice on buying, selling and investing in Dubai & Abu Dhabi real estate.",
    url: "https://dubaihaus.com/contact",
    siteName: "DubaiHaus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Contact DubaiHaus | Dubai & Abu Dhabi Property Experts | DubaiHaus",
    description:
      "Get personalised guidance on Dubai and Abu Dhabi property investment.",
  },
  robots: {
    index: true,
    follow: true,
  },
};



import ContactSection from "@/components/ContactSection";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <div className="pt-4 pb-10">
        <ContactSection />
      </div>
    </main>
  );
}
