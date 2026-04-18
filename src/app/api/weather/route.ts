import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get('lat');
  const lng = request.nextUrl.searchParams.get('lng');
  const date = request.nextUrl.searchParams.get('date'); // YYYY-MM-DD

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat, lng required' }, { status: 400 });
  }

  // Open-Meteo API (무료, 키 불필요)
  const url = date
    ? `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,windspeed_10m_max,weathercode&start_date=${date}&end_date=${date}&timezone=Asia/Seoul`
    : `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,windspeed_10m,precipitation,weathercode&timezone=Asia/Seoul`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
