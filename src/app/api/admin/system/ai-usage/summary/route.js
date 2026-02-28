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

        let dateFilter = {};
        const now = new Date();
        if (range === '24h') dateFilter = { gte: new Date(now - 24 * 60 * 60 * 1000) };
        else if (range === '7d') dateFilter = { gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        else if (range === '30d') dateFilter = { gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };

        const where = {
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
            ...(source && { source }),
            ...(locale && { locale }),
            ...(status && { status }),
        };

        // Aggregates
        const [usageStats, totalLogs] = await Promise.all([
            prisma.aIUsageLog.aggregate({
                where,
                _sum: {
                    inputTokens: true,
                    outputTokens: true,
                    totalTokens: true,
                },
                _avg: {
                    durationMs: true,
                },
                _count: {
                    _all: true
                }
            }),
            prisma.aIUsageLog.count({ where })
        ]);

        // Success rate
        const successCount = await prisma.aIUsageLog.count({
            where: { ...where, status: 'success' }
        });

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

        // Time series counts for cards
        const [count24h, count7d] = await Promise.all([
            prisma.aIUsageLog.count({ where: { ...where, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
            prisma.aIUsageLog.count({ where: { ...where, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
        ]);

        return NextResponse.json({
            totals: {
                count: totalLogs,
                successCount,
                successRate: totalLogs > 0 ? (successCount / totalLogs) * 100 : 100,
                inputTokens: usageStats._sum.inputTokens || 0,
                outputTokens: usageStats._sum.outputTokens || 0,
                totalTokens: usageStats._sum.totalTokens || 0,
                avgDurationMs: Math.round(usageStats._avg.durationMs || 0),
                count24h,
                count7d
            },
            breakdowns: {
                source: sourceBreakdown,
                locale: localeBreakdown
            }
        });
    } catch (error) {
        console.error("AI Usage Summary API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
