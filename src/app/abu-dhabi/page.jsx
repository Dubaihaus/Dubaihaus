// src/app/abu-dhabi/page.jsx
import { getTranslations } from "next-intl/server";
import { generateStandardMetadata } from "@/lib/seo";
import AbuDhabiHero from "@/components/abu-dhabi/AbuDhabiHero";
import AbuDhabiAreasPaginated from "@/components/abu-dhabi/AbuDhabiAreasPaginated";
import AbuDhabiMapSection from "@/components/abu-dhabi/AbuDhabiMapSection";
import AbuDhabiPropertiesSection from "@/components/abu-dhabi/AbuDhabiPropertiesSection";
import AbuDhabiFaqSection from "@/components/abu-dhabi/AbuDhabiFaqSection";

export async function generateMetadata() {
    const t = await getTranslations({ namespace: "seo.abuDhabi" });

    return generateStandardMetadata({
        pathname: "abu-dhabi",
        title: t("title"),
        description: t("description"),
        keywords: t("keywords"),
        index: true,
        follow: true,
    });
}

export default function AbuDhabiPage() {
    return (
        <main className="min-h-screen bg-white">
            <AbuDhabiHero />
            <AbuDhabiAreasPaginated />
            <AbuDhabiMapSection />
            <AbuDhabiPropertiesSection />
            <AbuDhabiFaqSection />
        </main>
    );
}
