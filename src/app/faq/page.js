import FAQSection from "@/components/FAQSection";

export const metadata = {
  title: "FAQ | Dubai Haus –Your Gateway to Dubai Real Estate",
  description:
    "Frequently asked questions about buying, selling, and investing in Dubai real estate, off-plan properties, Golden Visa and more.",
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <div className="pt-4 pb-4">
        <FAQSection />
      </div>
    </main>
  );
}
