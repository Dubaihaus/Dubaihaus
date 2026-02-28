import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { type: entityType, id: entityId } = await params;
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || 'all';
        const source = searchParams.get('source');

        let dateFilter = {};
        if (range !== 'all') {
            const now = new Date();
            if (range === '24h') dateFilter = { gte: new Date(now - 24 * 60 * 60 * 1000) };
            else if (range === '7d') dateFilter = { gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
            else if (range === '30d') dateFilter = { gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
        }

        const where = {
            entityType,
            entityId,
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
            ...(source && { source }),
        };

        // Aggregates for this entity
        const [usageStats, recentLogs, fieldBreakdown] = await Promise.all([
            prisma.aIUsageLog.aggregate({
                where,
                _sum: {
                    totalTokens: true,
                    inputTokens: true,
                    outputTokens: true,
                },
                _avg: {
                    durationMs: true,
                },
                _count: {
                    _all: true
                },
                _min: {
                    createdAt: true
                },
                _max: {
                    createdAt: true
                }
            }),
            prisma.aIUsageLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: 50
            }),
            prisma.aIUsageLog.groupBy({
                where,
                by: ['fieldKey'],
                _count: { _all: true },
                _sum: { totalTokens: true },
                _avg: { durationMs: true }
            })
        ]);

        return NextResponse.json({
            totals: {
                count: usageStats._count._all,
                totalTokens: usageStats._sum.totalTokens || 0,
                avgDurationMs: Math.round(usageStats._avg.durationMs || 0),
                firstSeenAt: usageStats._min.createdAt,
                lastSeenAt: usageStats._max.createdAt,
            },
            fieldBreakdown: fieldBreakdown.map(f => ({
                fieldKey: f.fieldKey || 'unknown',
                count: f._count._all,
                totalTokens: f._sum.totalTokens || 0,
                avgDurationMs: Math.round(f._avg.durationMs || 0)
            })),
            recentLogs
        });
    } catch (error) {
        console.error("AI Usage Entity Detail API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
