"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
}

export async function createProperty(formData) {
    await checkAdmin();

    const title = formData.get("title");
    const description = formData.get("description");
    const location = formData.get("location");
    const price = parseFloat(formData.get("price"));
    const area = parseFloat(formData.get("area"));
    const bedrooms = parseInt(formData.get("bedrooms"));
    const bathrooms = parseInt(formData.get("bathrooms"));
    const status = formData.get("status");
    const featured = formData.get("featured") === "on";
    const imageUrl = formData.get("imageUrl");
    const amenitiesStr = formData.get("amenities");

    // Create Property
    const property = await prisma.property.create({
        data: {
            title,
            description,
            location,
            price,
            area,
            bedrooms,
            bathrooms,
            status,
            featured,
            // Create image if provided
            images: imageUrl ? {
                create: { url: imageUrl }
            } : undefined,
            // Create amenities if provided
            amenities: amenitiesStr ? {
                create: amenitiesStr.split(",").map(a => ({ name: a.trim() })).filter(a => a.name)
            } : undefined
        }
    });

    revalidatePath("/admin/properties");
    revalidatePath("/featured-properties");
    redirect("/admin/properties");
}

export async function updateProperty(id, formData) {
    await checkAdmin();

    const title = formData.get("title");
    const description = formData.get("description");
    const location = formData.get("location");
    const price = parseFloat(formData.get("price"));
    const area = parseFloat(formData.get("area"));
    const bedrooms = parseInt(formData.get("bedrooms"));
    const bathrooms = parseInt(formData.get("bathrooms"));
    const status = formData.get("status");
    const featured = formData.get("featured") === "on";
    const imageUrl = formData.get("imageUrl");
    const amenitiesStr = formData.get("amenities");

    // Transaction to update properly
    await prisma.$transaction(async (tx) => {
        // 1. Update basic fields
        await tx.property.update({
            where: { id },
            data: {
                title,
                description,
                location,
                price,
                area,
                bedrooms,
                bathrooms,
                status,
                featured,
            }
        });

        // 2. Handle Image (simplistic: delete old, add new if provided)
        // In a real app we might manage multiple images better.
        if (imageUrl) {
            // Check if exists
            const existing = await tx.propertyImage.findFirst({ where: { propertyId: id } });
            if (existing) {
                await tx.propertyImage.update({ where: { id: existing.id }, data: { url: imageUrl } });
            } else {
                await tx.propertyImage.create({ data: { propertyId: id, url: imageUrl } });
            }
        }

        // 3. Handle Amenities (simplistic: delete all, re-add)
        if (amenitiesStr !== null) { // only if field is present
            await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
            const amenities = amenitiesStr.split(",").map(a => ({ name: a.trim() })).filter(a => a.name);
            if (amenities.length > 0) {
                await tx.propertyAmenity.createMany({
                    data: amenities.map(a => ({ propertyId: id, name: a.name }))
                });
            }
        }
    });

    revalidatePath("/admin/properties");
    revalidatePath("/featured-properties");
    redirect("/admin/properties");
}

export async function deleteProperty(id) {
    await checkAdmin();

    await prisma.property.delete({
        where: { id }
    });

    revalidatePath("/admin/properties");
    revalidatePath("/featured-properties");
}
