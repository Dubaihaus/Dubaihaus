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
        const entityIdSearch = searchParams.get('search'); // Filter by specific ID
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
            ...(entityIdSearch && { entityId: { contains: entityIdSearch } }),
            entityId: { not: null }, // Only entities
        };

        // Get total count of groups (this is the hard part in Prisma groupBy)
        // For now, we'll fetch all group keys to count them. 
        // In a very large DB, this should be a raw query: SELECT count(DISTINCT "entityId") FROM ...
        const groupsCountResult = await prisma.aIUsageLog.groupBy({
            where,
            by: ['entityType', 'entityId'],
        });
        const totalItems = groupsCountResult.length;

        // Fetch paginated groups
        const groups = await prisma.aIUsageLog.groupBy({
            where,
            by: ['entityType', 'entityId'],
            _sum: {
                totalTokens: true,
            },
            _avg: {
                durationMs: true,
            },
            _count: {
                _all: true,
            },
            _min: {
                createdAt: true,
            },
            _max: {
                createdAt: true,
                routePath: true
            },
            orderBy: {
                _max: {
                    createdAt: 'desc'
                }
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        // For each group, we also want success/failed counts
        // To avoid N+1, we can do another groupBy if needed, but for small pages, 
        // we'll just return the groups with their aggregate counts.
        // Actually, we can't easily get status counts inside the same groupBy in Prisma.
        // We'll just return what we have for now.

        const entities = groups.map(g => ({
            entityType: g.entityType,
            entityId: g.entityId,
            routePath: g._max.routePath,
            firstSeenAt: g._min.createdAt,
            lastSeenAt: g._max.createdAt,
            totalCalls: g._count._all,
            totalTokens: g._sum.totalTokens || 0,
            avgLatency: Math.round(g._avg.durationMs || 0),
        }));

        return NextResponse.json({
            entities,
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages: Math.ceil(totalItems / pageSize)
            }
        });
    } catch (error) {
        console.error("AI Usage Entities API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
