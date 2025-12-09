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

export async function updateSEO(id, formData) {
    await checkAdmin();

    const metaTitle = formData.get("metaTitle");
    const metaDesc = formData.get("metaDesc");
    const slug = formData.get("slug");

    try {
        await prisma.sEO.update({
            where: { id },
            data: {
                metaTitle,
                metaDesc,
                slug,
            }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error("Slug must be unique");
        }
        throw error;
    }

    revalidatePath("/admin/seo");
    redirect("/admin/seo");
}
