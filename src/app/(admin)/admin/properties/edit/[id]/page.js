
import PropertyForm from "@/components/admin/PropertyForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditPropertyPage({ params }) {
    const resolvedParams = await params;
    const property = await prisma.property.findUnique({
        where: { id: resolvedParams.id },
        include: {
            images: true,
            amenities: true,
        }
    });

    if (!property) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto">
            <PropertyForm initialData={property} />
        </div>
    );
}
