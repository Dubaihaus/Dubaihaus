import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || 'all';
        const source = searchParams.get('source');
        const locale = searchParams.get('locale');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '20');

        let dateFilter = {};
        if (range !== 'all') {
            const now = new Date();
            if (range === '24h') dateFilter = { gte: new Date(now - 24 * 60 * 60 * 1000) };
            else if (range === '7d') dateFilter = { gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
            else if (range === '30d') dateFilter = { gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
        }

        const where = {
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
            ...(source && { source }),
            ...(locale && { locale }),
            ...(status && { status }),
        };

        const [totalItems, logs] = await Promise.all([
            prisma.aIUsageLog.count({ where }),
            prisma.aIUsageLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            })
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages: Math.ceil(totalItems / pageSize)
            }
        });
    } catch (error) {
        console.error("AI Usage Logs API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
