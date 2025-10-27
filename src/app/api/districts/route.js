// src/app/api/districts/route.js
import { listDistricts } from '@/lib/reellyApi';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || '';
  const search = searchParams.get('search') || '';

  // Prefer name → falls back to search
  const q = name || search || '';
  try {
    const rows = await listDistricts(q);
    return Response.json(rows || []);
  } catch (e) {
    console.error('districts api error', e);
    return Response.json([], { status: 200 });
  }
}
