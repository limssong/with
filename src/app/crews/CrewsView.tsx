'use client';

import { useState } from 'react';
import CrewCard from '@/components/crew/CrewCard';
import type { Crew } from '@/data/crews';
import styles from './page.module.scss';

const filters = ['전체', '모집중', '초보환영', '정기모임', '주말', '새벽', '저녁'];
const DAY_INDEX = ['일', '월', '화', '수', '목', '금', '토'];

export default function CrewsView({ crews }: { crews: Crew[] }) {
  const [query, setQuery] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('전체');

  const filtered = activeFilter === '전체'
    ? crews
    : crews.filter((c) => {
        if (activeFilter === '모집중') return c.status === 'upcoming';
        if (activeFilter === '초보환영') return c.tags.includes('초보환영');
        if (activeFilter === '정기모임') return c.isRecurring;
        if (activeFilter === '주말') {
          if (!c.date) return false;
          const d = DAY_INDEX[new Date(c.date).getDay()];
          return d === '토' || d === '일';
        }
        if (activeFilter === '새벽') return parseInt(c.time) < 7;
        if (activeFilter === '저녁') return parseInt(c.time) >= 18;
        return true;
      });

  const handleSearch = () => {
    if (!query.trim()) return;
    setAiResult(`"${query}" 조건에 맞는 모임을 찾고 있어요...`);
    setTimeout(() => {
      setAiResult(`"${query}" 조건에 맞는 모임 ${crews.filter((c) => c.status === 'upcoming').length}개를 찾았어요!`);
    }, 1000);
  };

  return (
    <>
      <div className={styles.aiSearch}>
        <div className={styles.aiSearchHeader}>
          <span className={styles.aiSearchLabel}>AI 검색</span>
          <span className={styles.aiBadge}>AI</span>
        </div>
        <div className={styles.aiSearchBar}>
          <input
            type="text"
            className={styles.aiSearchInput}
            placeholder="이번 주 토요일 저녁 한강에서 5km 같이 뛸 사람"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className={styles.aiSearchBtn} onClick={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {aiResult && <p className={styles.aiSearchResult}>{aiResult}</p>}
      </div>

      <div className={styles.filters}>
        {filters.map((f) => (
          <button
            key={f}
            className={`${styles.filterPill} ${activeFilter === f ? styles.active : ''}`}
            onClick={() => setActiveFilter(f)}
          >{f}</button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.length > 0 ? (
          filtered.map((crew) => (
            <CrewCard key={crew.id} crew={crew} />
          ))
        ) : (
          <p className={styles.empty}>해당 조건의 모임이 없습니다</p>
        )}
      </div>
    </>
  );
}
