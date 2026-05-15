import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PACE_OPTIONS   = ['~5:00', '5:00~5:30', '5:30~6:00', '6:00~6:30', '6:30~7:00', '7:00~'];
const DIST_OPTIONS   = ['~3km', '3~5km', '5~7km', '7~10km', '10km~'];
const TIME_OPTIONS   = ['새벽', '아침', '점심', '저녁', '밤'];
const REGION_OPTIONS = ['마포구', '영등포구', '서초구', '강남구', '송파구', '종로구'];

const W_PACE   = 0.35;
const W_DIST   = 0.25;
const W_TIME   = 0.25;
const W_REGION = 0.15;

interface MatchRequest {
  pace?: string[];
  dist?: string[];
  time?: string[];
  region?: string[];
  currentUserId?: string | null;
}

interface ProfileRow {
  id: string;
  name: string | null;
  avatar_url: string | null;
  pace: string | null;
  preferred_distance: string[] | null;
  preferred_time: string[] | null;
  preferred_region: string[] | null;
}

function condToVec(selected: string[], options: string[]): number[] {
  return options.map((o) => (selected.includes(o) ? 1 : 0));
}

function singleToVec(value: string | null, options: string[]): number[] {
  return options.map((o) => (value === o ? 1 : 0));
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function hasOverlap(a: number[], b: number[]): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] && b[i]) return true;
  }
  return false;
}

export async function POST(request: NextRequest) {
  let body: MatchRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const userPace   = Array.isArray(body.pace)   ? body.pace.slice(0, 20)   : [];
  const userDist   = Array.isArray(body.dist)   ? body.dist.slice(0, 20)   : [];
  const userTime   = Array.isArray(body.time)   ? body.time.slice(0, 20)   : [];
  const userRegion = Array.isArray(body.region) ? body.region.slice(0, 20) : [];
  const excludeId  = body.currentUserId ?? null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'supabase env missing' }, { status: 500 });
  }

  const supabase = createClient(url, key);

  let query = supabase
    .from('profiles')
    .select('id, name, avatar_url, pace, preferred_distance, preferred_time, preferred_region');
  if (excludeId) query = query.neq('id', excludeId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const profiles = (data ?? []) as ProfileRow[];

  const uPace   = condToVec(userPace,   PACE_OPTIONS);
  const uDist   = condToVec(userDist,   DIST_OPTIONS);
  const uTime   = condToVec(userTime,   TIME_OPTIONS);
  const uRegion = condToVec(userRegion, REGION_OPTIONS);

  const results = profiles
    .map((p) => {
      const pPace   = singleToVec(p.pace, PACE_OPTIONS);
      const pDist   = condToVec(p.preferred_distance ?? [], DIST_OPTIONS);
      const pTime   = condToVec(p.preferred_time     ?? [], TIME_OPTIONS);
      const pRegion = condToVec(p.preferred_region   ?? [], REGION_OPTIONS);

      const sim =
        cosineSim(uPace,   pPace)   * W_PACE +
        cosineSim(uDist,   pDist)   * W_DIST +
        cosineSim(uTime,   pTime)   * W_TIME +
        cosineSim(uRegion, pRegion) * W_REGION;

      const score = Math.round(sim * 100);

      const reasons: string[] = [];
      if (hasOverlap(uPace,   pPace))   reasons.push('페이스 일치');
      if (hasOverlap(uDist,   pDist))   reasons.push('거리 일치');
      if (hasOverlap(uTime,   pTime))   reasons.push('시간대 일치');
      if (hasOverlap(uRegion, pRegion)) reasons.push('지역 일치');

      return {
        id: p.id,
        name: p.name ?? '러너',
        avatar_url: p.avatar_url,
        pace: p.pace,
        preferred_distance: p.preferred_distance ?? [],
        preferred_time:     p.preferred_time     ?? [],
        preferred_region:   p.preferred_region   ?? [],
        score,
        reasons,
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({ results });
}
