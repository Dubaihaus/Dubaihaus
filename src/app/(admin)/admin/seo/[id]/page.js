
import SeoForm from "@/components/admin/SeoForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditSeoPage({ params }) {
    const resolvedParams = await params;
    const seo = await prisma.sEO.findUnique({
        where: { id: resolvedParams.id },
    });

    if (!seo) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto">
            <SeoForm initialData={seo} />
        </div>
    );
}
