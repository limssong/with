'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import Tag from '@/components/common/Tag';
import PillButton from '@/components/common/PillButton';
import { getCrew } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import type { Crew, CrewMember } from '@/data/crews';
import styles from './page.module.scss';

const weatherCodeToDesc: Record<number, string> = {
  0: '맑음', 1: '대체로 맑음', 2: '구름 조금', 3: '흐림',
  45: '안개', 48: '안개', 51: '이슬비', 53: '이슬비', 55: '이슬비',
  61: '비', 63: '비', 65: '강한 비', 71: '눈', 73: '눈', 75: '강한 눈',
  80: '소나기', 81: '소나기', 82: '강한 소나기', 95: '뇌우',
};

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  precipitation: number;
  description: string;
}

function getOutfitAdvice(weather: WeatherData, location: string): string {
  const isRiver = location.includes('한강') || location.includes('반포');
  const isMountain = location.includes('북한산') || location.includes('둘레길');
  const temp = weather.temp;

  let base = '';
  if (temp >= 25) base = '반팔 + 짧은 레깅스. 자외선 차단제와 캡모자 필수예요.';
  else if (temp >= 20) base = '반팔 티셔츠에 얇은 레깅스가 적당해요.';
  else if (temp >= 15) base = '긴팔 티셔츠에 얇은 레깅스가 적당해요.';
  else if (temp >= 10) base = '긴팔에 얇은 바람막이를 챙기세요.';
  else if (temp >= 5) base = '기모 레깅스에 바람막이 필수. 장갑도 추천해요.';
  else base = '방한 필수! 기모 상하의 + 목워머 + 장갑을 챙기세요.';

  if (isRiver && weather.wind > 3) base += ' 강변이라 바람이 세니 방풍 재킷을 추천합니다.';
  if (isMountain) base += ' 산길이라 고도별 기온차가 크니 레이어드가 중요해요.';
  if (weather.precipitation > 30) base += ` 강수 확률 ${weather.precipitation}%이니 방수 재킷을 준비하세요.`;

  return base;
}

export default function CrewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [crew, setCrew] = useState<Crew | null>(null);
  const [applied, setApplied] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [courseCoords, setCourseCoords] = useState<{ lat: number; lng: number }[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  useEffect(() => {
    getCrew(id).then((data) => {
      if (!data) setError(true);
      setCrew(data);
      setLoading(false);
    }).catch(() => {
      setError(true);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!crew?.courseId) return;
    supabase.from('courses').select('coordinates').eq('id', crew.courseId).single()
      .then(({ data }) => {
        if (data?.coordinates) setCourseCoords(data.coordinates);
      });
  }, [crew?.courseId]);

  useEffect(() => {
    if (!courseCoords?.length) return;
    const lat = courseCoords[0]?.lat;
    const lng = courseCoords[0]?.lng;
    if (!lat || !lng) return;

    fetch(`/api/weather?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            feelsLike: Math.round(data.current.apparent_temperature),
            humidity: data.current.relative_humidity_2m,
            wind: data.current.windspeed_10m,
            precipitation: Math.round(data.current.precipitation * 100),
            description: weatherCodeToDesc[data.current.weathercode] || '맑음',
          });
        }
      })
      .catch(() => {});
  }, [courseCoords]);

  if (loading) return <><Header title="모임 상세" showBack /><main className="page-content"><p style={{ textAlign: 'center', color: '#8a8a8a', padding: '40px 0' }}>불러오는 중...</p></main><BottomNav /></>;
  if (error || !crew) return <><Header title="모임 상세" showBack /><main className="page-content"><p style={{ textAlign: 'center', color: '#ff6b6b', padding: '40px 0' }}>모임 정보를 불러올 수 없습니다</p></main><BottomNav /></>;

  const dateObj = new Date(crew.date);
  const dateStr = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()]})`;

  const handleApply = () => {
    setApplied(true);
  };

  return (
    <>
      <Header title="모임 상세" showBack />
      <main className="page-content">
        {/* Host Info */}
        <div className={styles.host}>
          <div className={styles.hostAvatar}>
            {crew.hostName.charAt(0)}
          </div>
          <div>
            <p className={styles.hostName}>{crew.hostName}</p>
            <p className={styles.hostLabel}>모임장</p>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className={styles.title}>{crew.title}</h1>
        <p className={styles.description}>{crew.description}</p>

        {/* Tags */}
        <div className={styles.tags}>
          {crew.tags.map((tag: string) => (
            <Tag key={tag} label={tag} />
          ))}
          {crew.isRecurring && <Tag label={crew.recurringDay || '정기'} variant="accent" />}
        </div>

        {/* Info Cards */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <span className={styles.infoLabel}>일시</span>
            <span className={styles.infoValue}>{dateStr}</span>
            <span className={styles.infoSub}>{crew.time}</span>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.03 7.03 1 12 1C16.97 1 21 5.03 21 10Z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className={styles.infoLabel}>장소</span>
            <span className={styles.infoValue}>{crew.location}</span>
            <span className={styles.infoSub}>{crew.region}</span>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <span className={styles.infoLabel}>페이스</span>
            <span className={styles.infoValue}>{crew.pace}</span>
            <span className={styles.infoSub}>/km</span>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className={styles.infoLabel}>거리</span>
            <span className={styles.infoValue}>{crew.distance}km</span>
            <span className={styles.infoSub}>{crew.courseName}</span>
          </div>
        </div>

        {/* Weather & Outfit Guide */}
        <section className={styles.weatherSection}>
          <div className={styles.weatherHeader}>
            <h2 className={styles.sectionTitle}>날씨 & 옷차림</h2>
            <span className={styles.aiBadge}>AI</span>
          </div>
          <div className={styles.weatherCard}>
            {weather ? (
              <>
                <div className={styles.weatherMain}>
                  <div className={styles.weatherIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 2V4M12 20V22M4 12H2M22 12H20M5.64 5.64L4.22 4.22M19.78 4.22L18.36 5.64M5.64 18.36L4.22 19.78M19.78 19.78L18.36 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className={styles.weatherInfo}>
                    <span className={styles.weatherTemp}>{weather.temp}°C</span>
                    <span className={styles.weatherDesc}>{weather.description} · 체감 {weather.feelsLike}°C</span>
                  </div>
                  <div className={styles.weatherDetails}>
                    <span>습도 {weather.humidity}%</span>
                    <span>바람 {weather.wind}m/s</span>
                    <span>강수 {weather.precipitation}%</span>
                  </div>
                </div>
                <div className={styles.outfitGuide}>
                  <p className={styles.outfitTitle}>AI 옷차림 추천</p>
                  <p className={styles.outfitText}>{getOutfitAdvice(weather, crew.location)}</p>
                </div>
              </>
            ) : (
              <div className={styles.weatherLoading}>날씨 정보를 불러오는 중...</div>
            )}
          </div>
        </section>

        {/* Members */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>참여 멤버</h2>
            <span className={styles.memberCount}>{crew.currentMembers}/{crew.maxMembers}명</span>
          </div>
          <div className={styles.memberList}>
            {crew.members.length > 0 ? (
              crew.members.map((member: CrewMember) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>{member.name.charAt(0)}</div>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{member.name}</span>
                    <span className={styles.memberPace}>페이스 {member.pace}/km</span>
                  </div>
                  <span className={`${styles.memberStatus} ${styles[member.status]}`}>
                    {member.status === 'accepted' ? '참여확정' : member.status === 'pending' ? '대기중' : '거절'}
                  </span>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>멤버 정보가 없습니다</p>
            )}
          </div>
        </section>

        {/* Action Links */}
        <div className={styles.actionLinks}>
          <Link href={`/crews/${id}/chat`} className={styles.actionLink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.55 20.78 16.05 20.41 16.41C20.05 16.78 19.55 17 19 17H7L3 21V5C3 4.45 3.22 3.95 3.59 3.59C3.95 3.22 4.45 3 5 3H19C19.55 3 20.05 3.22 20.41 3.59C20.78 3.95 21 4.45 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            모임 채팅
          </Link>
          <Link href={`/crews/${id}/manage`} className={styles.actionLink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21V19C23 17.14 21.73 15.57 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            참석 관리
          </Link>
        </div>

        {/* Apply Button */}
        <div className={styles.actions}>
          {crew.status === 'full' ? (
            <PillButton variant="secondary" fullWidth disabled>모집 마감</PillButton>
          ) : applied ? (
            <PillButton variant="outlined" fullWidth disabled>참석 신청 완료</PillButton>
          ) : (
            <PillButton variant="primary" fullWidth onClick={handleApply}>참석 신청하기</PillButton>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
