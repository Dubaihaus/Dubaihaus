// src/app/api/developers/route.js
import { NextResponse } from 'next/server';
import { listDevelopers } from '@/lib/reellyApi'; // OK: this runs on the server only

export const dynamic = 'force-dynamic'; // don't cache during dev

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? 50);
  const offset = Number(searchParams.get('offset') ?? 0);

  const rows = await listDevelopers({ limit, offset });
  return NextResponse.json({ results: rows ?? [] });
}
