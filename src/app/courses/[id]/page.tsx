'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import Tag from '@/components/common/Tag';
import PillButton from '@/components/common/PillButton';
import MapboxMap from '@/components/map/MapboxMap';
import ElevationChart from '@/components/map/ElevationChart';
import { getCourse, getCrewsByCourse } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import CrewCard from '@/components/crew/CrewCard';
import type { Course } from '@/data/courses';
import type { Crew } from '@/data/crews';
import styles from './page.module.scss';

const difficultyLabel: Record<string, string> = { easy: '초급', medium: '중급', hard: '고급' };

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [relatedCrews, setRelatedCrews] = useState<Crew[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([getCourse(id), getCrewsByCourse(id)]).then(([c, crews]) => {
      setCourse(c);
      setRelatedCrews(crews);
      setLoading(false);
    });

    // 관리자 권한 확인
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').select('role').eq('id', data.user.id).single()
          .then(({ data: profile }) => {
            if (profile?.role === 'admin') setIsAdmin(true);
          });
      }
    });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('이 코스를 삭제하시겠습니까?')) return;
    setDeleting(true);
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
      alert('삭제 실패: ' + error.message);
      setDeleting(false);
    } else {
      router.push('/courses');
    }
  };

  if (loading) return <><Header title="코스 상세" showBack /><main className="page-content"><p style={{ textAlign: 'center', color: '#8a8a8a', padding: '40px 0' }}>불러오는 중...</p></main><BottomNav /></>;
  if (!course) return notFound();

  return (
    <>
      <Header title={course.name} showBack />
      <main className="page-content">
        {/* Course Map */}
        <div className={styles.mapWrapper}>
          <MapboxMap
            center={[course.coordinates[0]?.lng || 126.978, course.coordinates[0]?.lat || 37.5665]}
            zoom={14}
            courses={[{ id: course.id, name: course.name, coordinates: course.coordinates }]}
            selectedCourseId={course.id}
            showUserLocation={false}
            className={styles.courseMap}
          />
        </div>

        {/* Elevation Chart */}
        <div className={styles.elevationWrapper}>
          <ElevationChart
            distance={course.distance}
            elevation={course.elevation}
            difficulty={course.difficulty}
          />
        </div>

        {/* Course Info */}
        <section className={styles.info}>
          <h1 className={styles.name}>{course.name}</h1>
          <p className={styles.region}>{course.region}</p>
          <p className={styles.description}>{course.description}</p>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{course.distance}km</span>
              <span className={styles.statLabel}>거리</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{course.elevation}m</span>
              <span className={styles.statLabel}>고도</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>★ {course.rating}</span>
              <span className={styles.statLabel}>평점</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{course.reviewCount}</span>
              <span className={styles.statLabel}>리뷰</span>
            </div>
          </div>

          <div className={styles.tags}>
            <Tag label={difficultyLabel[course.difficulty]} variant="accent" />
            {course.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        </section>

        {/* AI Course Preview */}
        <section className={styles.preview}>
          <div className={styles.previewHeader}>
            <h2 className={styles.sectionTitle}>AI 코스 미리보기</h2>
            <span className={styles.aiBadge}>AI</span>
          </div>
          <p className={styles.previewDesc}>러너들의 실시간 리포트와 후기를 AI가 분석했어요</p>
          <div className={styles.previewGrid}>
            <div className={styles.previewCard}>
              <span className={styles.previewIcon}>📍</span>
              <span className={styles.previewLabel}>구간별 특징</span>
              <p className={styles.previewText}>
                {course.difficulty === 'hard'
                  ? '초반 2km는 완만한 오르막, 4km 지점에서 급경사 시작. 6km 지점에 음수대 있음'
                  : course.elevation > 20
                    ? `${(course.distance / 3).toFixed(1)}km 지점에 완만한 오르막 구간, 중간에 음수대 1곳`
                    : '전 구간 평지, 1km 간격으로 거리 표시. 중간 지점에 음수대 있음'}
              </p>
            </div>
            <div className={styles.previewCard}>
              <span className={styles.previewIcon}>👥</span>
              <span className={styles.previewLabel}>추천 대상</span>
              <p className={styles.previewText}>
                {course.difficulty === 'easy'
                  ? '초보자 만족도 높음. 평탄해서 페이스 유지가 쉬움'
                  : course.difficulty === 'medium'
                    ? '중급 러너에게 적합. 적당한 변화가 있어 지루하지 않음'
                    : '경험자 추천. 체력 소모가 크니 충분한 준비 필요'}
              </p>
            </div>
            <div className={styles.previewCard}>
              <span className={styles.previewIcon}>🗓️</span>
              <span className={styles.previewLabel}>시간대별 팁</span>
              <p className={styles.previewText}>
                {course.tags.includes('야경')
                  ? '저녁 러닝 추천. 야경이 좋다는 후기 다수. 여름 저녁에는 모기 주의'
                  : course.tags.includes('트레일')
                    ? '오전 러닝 추천. 오후에는 그늘이 줄어 체감온도 높음'
                    : '아침·저녁 모두 적합. 주말 오전에 러너가 많아 활기 있음'}
              </p>
            </div>
            <div className={styles.previewCard}>
              <span className={styles.previewIcon}>🏪</span>
              <span className={styles.previewLabel}>주변 편의시설</span>
              <p className={styles.previewText}>
                {course.tags.includes('한강')
                  ? '편의점·화장실 접근 용이. 주차장 있으나 주말 혼잡. 지하철 도보 10분'
                  : course.tags.includes('공원')
                    ? '공원 내 화장실·매점 있음. 대중교통 접근성 좋음'
                    : '주차장 협소, 대중교통 접근 추천. 근처 편의점까지 도보 5분'}
              </p>
            </div>
          </div>
        </section>

        {/* Related Crews */}
        {relatedCrews.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>이 코스의 모임</h2>
            <div className={styles.list}>
              {relatedCrews.map((crew) => (
                <CrewCard key={crew.id} crew={crew} />
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Link href={`/courses/${id}/review`} style={{ width: '100%' }}>
            <PillButton variant="outlined" fullWidth>리뷰 작성하기</PillButton>
          </Link>
          <PillButton variant="primary" fullWidth>이 코스로 모임 만들기</PillButton>
          {isAdmin && (
            <button className={styles.deleteBtn} onClick={handleDelete} disabled={deleting}>
              {deleting ? '삭제 중...' : '코스 삭제 (관리자)'}
            </button>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
