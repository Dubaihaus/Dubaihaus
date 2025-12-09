
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { syncProjects } from "@/lib/reellySync";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Trigger sync
        const result = await syncProjects();

        const lastSyncedAt = await prisma.reellyProject.aggregate({
            _max: { lastSyncedAt: true }
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            lastSyncedAt: lastSyncedAt._max.lastSyncedAt,
        });
    } catch (error) {
        console.error("Sync API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
