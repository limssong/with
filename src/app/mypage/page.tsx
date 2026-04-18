'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import PillButton from '@/components/common/PillButton';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import styles from './page.module.scss';

interface Profile {
  id: string;
  name: string;
  pace: string | null;
  avatar_url: string | null;
  role: string;
  total_distance: number;
  total_runs: number;
}

const paceOptions = ['~5:00', '5:00~5:30', '5:30~6:00', '6:00~6:30', '6:30~7:00', '7:00~'];
const distanceOptions = ['~3km', '3~5km', '5~7km', '7~10km', '10km~'];
const timeSlotOptions = ['새벽', '아침', '점심', '저녁', '밤'];
const allRegions = [
  '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
  '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
  '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구',
];

export default function MyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
          .then(({ data: p, error }) => {
            if (error) console.error('프로필 로드 실패:', error.message);
            if (p) setProfile(p as Profile);
            setNickname(p?.name || session.user?.user_metadata?.full_name || '');
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
    router.replace('/login');
  };

  const handleSaveNickname = async () => {
    if (!nickname.trim() || !authUser) return;

    if (profile) {
      await supabase.from('profiles').update({ name: nickname.trim() }).eq('id', authUser.id);
    } else {
      await supabase.from('profiles').insert({ id: authUser.id, name: nickname.trim() });
    }

    setProfile((prev) => prev ? { ...prev, name: nickname.trim() } : prev);
    setEditingNickname(false);
  };

  const displayName = profile?.name || authUser?.user_metadata?.full_name || '';

  const [conditions, setConditions] = useState<Record<string, string[]>>({
    pace: ['~5:00', '5:00~5:30', '5:30~6:00', '6:00~6:30', '6:30~7:00', '7:00~'],
    distance: ['~3km', '3~5km', '5~7km', '7~10km', '10km~'],
    timeSlot: ['새벽', '아침', '점심', '저녁', '밤'],
  });

  const [selectedRegions, setSelectedRegions] = useState<string[]>(['영등포구', '마포구', '서초구']);

  const toggleCondition = (category: string, value: string) => {
    setConditions((prev) => {
      const current = prev[category] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: next };
    });
  };

  const handleRegionChange = (index: number, value: string) => {
    setSelectedRegions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const toggleAll = (category: string, options: string[]) => {
    setConditions((prev) => {
      const allSelected = options.every((o) => prev[category]?.includes(o));
      return { ...prev, [category]: allSelected ? [] : [...options] };
    });
  };

  const activeConditionCount = Object.values(conditions).flat().length + selectedRegions.filter(Boolean).length;

  // 스켈레톤 UI
  if (loading) {
    return (
      <>
        <Header />
        <main className="page-content">
          <section className={styles.profile}>
            <div className={`${styles.avatar} ${styles.skeleton}`} />
            <div className={styles.profileInfo}>
              <div className={`${styles.skeletonText} ${styles.skeletonWide}`} />
              <div className={`${styles.skeletonText} ${styles.skeletonNarrow}`} />
            </div>
          </section>
          <div className={`${styles.skeletonBlock}`} />
          <div className={`${styles.skeletonBlock} ${styles.skeletonShort}`} />
        </main>
        <BottomNav />
      </>
    );
  }

  // 비로그인
  if (!authUser) {
    return (
      <>
        <Header />
        <main className="page-content">
          <div className={styles.loginPrompt}>
            <h2>로그인이 필요합니다</h2>
            <p>러닝 메이트를 찾고, 모임에 참여하려면 로그인하세요</p>
            <Link href="/login">
              <PillButton variant="primary">로그인하기</PillButton>
            </Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="page-content">
        {/* Profile */}
        <section className={styles.profile}>
          {profile?.avatar_url || authUser?.user_metadata?.avatar_url ? (
            <Image src={profile?.avatar_url || authUser?.user_metadata?.avatar_url} alt="프로필" width={64} height={64} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatar}>{displayName.charAt(0)}</div>
          )}
          <div className={styles.profileInfo}>
            {!editingNickname ? (
              <>
                <h2 className={styles.name}>{displayName}</h2>
                <p className={styles.level}>Lv.1 러너</p>
              </>
            ) : (
              <input
                className={styles.nicknameInput}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임 입력"
                autoFocus
              />
            )}
          </div>
          <Link href="/mypage/edit">
            <PillButton variant="outlined" size="sm">프로필 수정</PillButton>
          </Link>
        </section>

        {/* Running Profile - AI 매칭 조건 */}
        <section className={styles.runProfile}>
          <div className={styles.runProfileHeader}>
            <div className={styles.runProfileTitleGroup}>
              <h3 className={styles.sectionTitle}>내 러닝 조건</h3>
              <span className={styles.aiBadge}>AI 매칭</span>
            </div>
          </div>
          <p className={styles.runProfileDesc}>조건을 켜면 하나라도 겹치는 러닝 메이트를 추천해요</p>

          <div className={styles.conditionGroup}>
            <div className={styles.conditionHeader}>
              <span className={styles.conditionLabel}>페이스 (/km)</span>
              <button className={`${styles.bulkBtn} ${conditions.pace.length === paceOptions.length ? styles.bulkOn : ''}`} onClick={() => toggleAll('pace', paceOptions)}>ALL</button>
            </div>
            <div className={styles.chipRow}>
              {paceOptions.map((opt) => (
                <button key={opt} className={`${styles.chip} ${conditions.pace.includes(opt) ? styles.chipOn : ''}`} onClick={() => toggleCondition('pace', opt)}>{opt}</button>
              ))}
            </div>
          </div>

          <div className={styles.conditionGroup}>
            <div className={styles.conditionHeader}>
              <span className={styles.conditionLabel}>선호 거리</span>
              <button className={`${styles.bulkBtn} ${conditions.distance.length === distanceOptions.length ? styles.bulkOn : ''}`} onClick={() => toggleAll('distance', distanceOptions)}>ALL</button>
            </div>
            <div className={styles.chipRow}>
              {distanceOptions.map((opt) => (
                <button key={opt} className={`${styles.chip} ${conditions.distance.includes(opt) ? styles.chipOn : ''}`} onClick={() => toggleCondition('distance', opt)}>{opt}</button>
              ))}
            </div>
          </div>

          <div className={styles.conditionGroup}>
            <div className={styles.conditionHeader}>
              <span className={styles.conditionLabel}>선호 시간</span>
              <button className={`${styles.bulkBtn} ${conditions.timeSlot.length === timeSlotOptions.length ? styles.bulkOn : ''}`} onClick={() => toggleAll('timeSlot', timeSlotOptions)}>ALL</button>
            </div>
            <div className={styles.chipRow}>
              {timeSlotOptions.map((opt) => (
                <button key={opt} className={`${styles.chip} ${conditions.timeSlot.includes(opt) ? styles.chipOn : ''}`} onClick={() => toggleCondition('timeSlot', opt)}>{opt}</button>
              ))}
            </div>
          </div>

          <div className={styles.conditionGroup}>
            <span className={styles.conditionLabel}>선호 지역 (최대 3개)</span>
            {[0, 1, 2].map((idx) => (
              <div key={idx} className={styles.regionRow}>
                <span className={styles.regionRank}>{idx + 1}</span>
                <select
                  className={styles.regionSelect}
                  value={selectedRegions[idx] || ''}
                  onChange={(e) => handleRegionChange(idx, e.target.value)}
                >
                  <option value="">선택 안 함</option>
                  {allRegions.map((r) => (
                    <option key={r} value={r} disabled={selectedRegions.includes(r) && selectedRegions[idx] !== r}>{r}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <p className={styles.matchHint}>
            {activeConditionCount > 0
              ? `${activeConditionCount}개 조건 ON \u2014 하나라도 겹치는 러너를 추천합니다`
              : '조건을 선택하면 맞는 러닝 메이트를 추천해 드려요'}
          </p>
        </section>

        {/* Stats */}
        <section className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{profile?.total_distance || 0}</span>
            <span className={styles.statUnit}>km</span>
            <span className={styles.statLabel}>총 거리</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{profile?.total_runs || 0}</span>
            <span className={styles.statUnit}>회</span>
            <span className={styles.statLabel}>러닝 횟수</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>0</span>
            <span className={styles.statUnit}>개</span>
            <span className={styles.statLabel}>참여 모임</span>
          </div>
        </section>

        {/* Menu */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>설정</h3>
          <div className={styles.list}>
            <Link href="/run/settings" className={styles.menuItem}>리포팅 설정</Link>
            <button className={styles.menuItem}>알림 설정</button>
            <button className={styles.menuItem}>앱 정보</button>
            <button className={`${styles.menuItem} ${styles.logout}`} onClick={handleLogout}>로그아웃</button>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
