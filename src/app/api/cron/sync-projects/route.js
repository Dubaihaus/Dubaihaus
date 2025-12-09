// src/app/api/cron/sync-projects/route.js
import { syncProjects } from '@/lib/reellySync';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Simple protection - optional
    if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await syncProjects();
        return NextResponse.json({
            success: true,
            synced: result.count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Sync failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
