import Link from 'next/link';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import CourseCard from '@/components/course/CourseCard';
import CrewCard from '@/components/crew/CrewCard';
import PillButton from '@/components/common/PillButton';
import { getCourses, getCrews } from '@/lib/data';
import styles from './page.module.scss';

// AI 추천 이유 더미 데이터
const CREW_REASONS = [
  ['페이스 일치', '지역 일치', '시간대 일치'],
  ['페이스 일치', '거리 일치'],
];
const COURSE_REASONS = [
  ['난이도 적합', '선호 지역', '미방문 코스'],
  ['선호 거리', '높은 평점'],
];

export const revalidate = 60;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'With Running',
  description: '러닝 메이트를 찾고, 코스를 공유하고, 크루와 함께 달리세요. AI 기반 러닝 파트너 매칭 서비스.',
  applicationCategory: 'SportsApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  featureList: ['AI 러닝 메이트 매칭', '러닝 코스 공유 및 리뷰', '러닝 크루 모집 및 관리'],
  inLanguage: 'ko',
};

export default async function Home() {
  const [courses, crews] = await Promise.all([getCourses(), getCrews()]);
  const upcomingCrews = crews.filter((c) => c.status === 'upcoming').slice(0, 3);
  const popularCourses = [...courses].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="page-content">
        {/* Hero */}
        <section className={styles.hero} aria-labelledby="hero-title">
          <h2 className={styles.heroTitle} id="hero-title">
            오늘도<br />
            <span className={styles.accent}>함께</span> 달려볼까요?
          </h2>
          <p className={styles.heroSub}>나에게 맞는 러닝 메이트를 찾아보세요</p>
          <div className={styles.heroActions}>
            <Link href="/crews/create">
              <PillButton variant="primary">모임 만들기</PillButton>
            </Link>
            <Link href="/courses">
              <PillButton variant="outlined">코스 둘러보기</PillButton>
            </Link>
          </div>
        </section>

        {/* Quick Stats */}
        <section className={styles.stats} aria-label="서비스 통계">
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{courses.length}</span>
            <span className={styles.statLabel}>코스</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{crews.length}</span>
            <span className={styles.statLabel}>모임</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{crews.reduce((sum, c) => sum + c.currentMembers, 0)}</span>
            <span className={styles.statLabel}>러너</span>
          </div>
        </section>

        {/* AI Recommended Crews */}
        <section className={styles.section} aria-labelledby="ai-crews-title">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle} id="ai-crews-title">AI 추천 모임</h2>
              <span className={styles.aiBadge}>AI</span>
            </div>
            <Link href="/crews" className={styles.seeAll}>전체보기</Link>
          </div>
          <p className={styles.aiDescription}>페이스와 일정이 비슷한 모임을 찾았어요</p>
          <div className={styles.list}>
            {upcomingCrews.slice(0, 2).map((crew, i) => (
              <div key={crew.id} className={styles.aiCard}>
                <div className={styles.aiMatchScore}>
                  <span className={styles.aiMatchNumber}>{i === 0 ? 94 : 87}%</span>
                  <span className={styles.aiMatchLabel}>매칭</span>
                </div>
                <div className={styles.aiCardContent}>
                  <CrewCard crew={crew} />
                  <div className={styles.aiReasonRow}>
                    {CREW_REASONS[i].map((r) => (
                      <span key={r} className={styles.aiReasonTag}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.aiFooter}>
            <p className={styles.aiHint}>약속이 잡히면 함께 뛰는 책임감이 생겨요</p>
            <Link href="/ai-demo" className={styles.aiDemoLink}>매칭 원리 보기 →</Link>
          </div>
        </section>

        {/* AI Recommended Courses */}
        <section className={styles.section} aria-labelledby="ai-courses-title">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle} id="ai-courses-title">AI 추천 코스</h2>
              <span className={styles.aiBadge}>AI</span>
            </div>
            <Link href="/courses" className={styles.seeAll}>전체보기</Link>
          </div>
          <p className={styles.aiDescription}>아직 가보지 않은 코스 중 마음에 들 코스예요</p>
          <div className={styles.list}>
            {popularCourses.slice(0, 2).map((course, i) => (
              <div key={course.id} className={styles.aiCourseWrap}>
                <CourseCard course={course} />
                <div className={styles.aiReasonRow}>
                  {COURSE_REASONS[i].map((r) => (
                    <span key={r} className={styles.aiReasonTag}>{r}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Crews */}
        <section className={styles.section} aria-labelledby="upcoming-crews-title">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="upcoming-crews-title">다가오는 모임</h2>
            <Link href="/crews" className={styles.seeAll}>전체보기</Link>
          </div>
          <div className={styles.list}>
            {upcomingCrews.map((crew) => (
              <CrewCard key={crew.id} crew={crew} />
            ))}
          </div>
        </section>

        {/* Popular Courses */}
        <section className={styles.section} aria-labelledby="popular-courses-title">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="popular-courses-title">인기 코스</h2>
            <Link href="/courses" className={styles.seeAll}>전체보기</Link>
          </div>
          <div className={styles.list}>
            {popularCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
