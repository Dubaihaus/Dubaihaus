"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
}

export async function toggleReellyFeatured(id, currentStatus) {
    await checkAdmin();

    await prisma.reellyProject.update({
        where: { id },
        data: { isFeatured: !currentStatus }
    });

    revalidatePath("/admin/reelly-projects");
    revalidatePath("/featured-properties");
}
