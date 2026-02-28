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
        const range = searchParams.get('range') || 'all'; // all, 24h, 7d, 30d
        const source = searchParams.get('source');

        let dateFilter = {};
        const now = new Date();
        if (range === '24h') dateFilter = { gte: new Date(now - 24 * 60 * 60 * 1000) };
        else if (range === '7d') dateFilter = { gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        else if (range === '30d') dateFilter = { gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };

        const where = {
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
            ...(source && { source }),
        };

        // Aggregates
        const [totalCount, usageStats, recentLogs] = await Promise.all([
            prisma.aIUsageLog.count({ where }),
            prisma.aIUsageLog.aggregate({
                where,
                _sum: {
                    inputTokens: true,
                    outputTokens: true,
                    totalTokens: true,
                },
                _avg: {
                    durationMs: true,
                }
            }),
            prisma.aIUsageLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: 20
            })
        ]);

        // Breakdowns
        const sourceBreakdown = await prisma.aIUsageLog.groupBy({
            where,
            by: ['source'],
            _count: { _all: true },
            _sum: { totalTokens: true }
        });

        const localeBreakdown = await prisma.aIUsageLog.groupBy({
            where,
            by: ['locale'],
            _count: { _all: true },
        });

        // Time series for cards (even if main filter is 'all')
        const today = new Date(now.setHours(0, 0, 0, 0));
        const [count24h, count7d, count30d] = await Promise.all([
            prisma.aIUsageLog.count({ where: { ...where, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
            prisma.aIUsageLog.count({ where: { ...where, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
            prisma.aIUsageLog.count({ where: { ...where, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
        ]);

        return NextResponse.json({
            totals: {
                count: totalCount,
                inputTokens: usageStats._sum.inputTokens || 0,
                outputTokens: usageStats._sum.outputTokens || 0,
                totalTokens: usageStats._sum.totalTokens || 0,
                avgDurationMs: Math.round(usageStats._avg.durationMs || 0),
                count24h,
                count7d,
                count30d
            },
            breakdowns: {
                source: sourceBreakdown,
                locale: localeBreakdown
            },
            recentLogs
        });
    } catch (error) {
        console.error("AI Usage API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
