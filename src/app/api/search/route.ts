import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.json({ documents: [] });

  const KAKAO_KEY = process.env.KAKAO_REST_KEY;
  if (!KAKAO_KEY) return NextResponse.json({ documents: [] }, { status: 500 });

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`,
    { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` } }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
