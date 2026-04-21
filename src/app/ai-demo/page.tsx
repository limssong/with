'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import styles from './page.module.scss';

// ────────────────────────────────────────────
// 더미 러너 데이터
// ────────────────────────────────────────────
const PACE_OPTIONS   = ['~5:00', '5:00~5:30', '5:30~6:00', '6:00~6:30', '6:30~7:00', '7:00~'];
const DIST_OPTIONS   = ['~3km', '3~5km', '5~7km', '7~10km', '10km~'];
const TIME_OPTIONS   = ['새벽', '아침', '점심', '저녁', '밤'];
const REGION_OPTIONS = ['마포구', '영등포구', '서초구', '강남구', '송파구', '종로구'];

interface Runner {
  id: number;
  name: string;
  avatar: string;
  paceVec: number[];   // 6-dim one-hot
  distVec: number[];   // 5-dim one-hot (multi-hot)
  timeVec: number[];   // 5-dim one-hot (multi-hot)
  regionVec: number[]; // 6-dim one-hot (multi-hot)
  bio: string;
}

const RUNNERS: Runner[] = [
  { id: 1, name: '김민준', avatar: '🏃', bio: '퇴근 후 마포 상암 코스 즐겨요',
    paceVec: [0,0,1,0,0,0], distVec: [0,0,1,1,0], timeVec: [0,0,0,1,1], regionVec: [1,0,0,0,0,0] },
  { id: 2, name: '이지수', avatar: '🏃‍♀️', bio: '주말 아침 한강 단골',
    paceVec: [0,1,1,0,0,0], distVec: [0,1,1,0,0], timeVec: [0,1,0,0,0], regionVec: [1,1,0,0,0,0] },
  { id: 3, name: '박서연', avatar: '🧑‍🦱', bio: '서초 반포 저녁 러닝 즐겨요',
    paceVec: [0,0,0,1,0,0], distVec: [0,0,1,0,0], timeVec: [0,0,0,1,0], regionVec: [0,0,1,0,0,0] },
  { id: 4, name: '최준혁', avatar: '👤', bio: '강남 새벽 러너 5년차',
    paceVec: [1,1,0,0,0,0], distVec: [0,0,0,1,1], timeVec: [1,0,0,0,0], regionVec: [0,0,0,1,0,0] },
  { id: 5, name: '정예린', avatar: '🙋‍♀️', bio: '종로 야경 러닝 좋아해요',
    paceVec: [0,0,0,0,1,0], distVec: [1,1,0,0,0], timeVec: [0,0,0,0,1], regionVec: [0,0,0,0,0,1] },
  { id: 6, name: '한동훈', avatar: '🧑', bio: '송파 올림픽공원 주변',
    paceVec: [0,0,1,1,0,0], distVec: [0,0,1,1,0], timeVec: [0,1,0,1,0], regionVec: [0,0,0,0,1,0] },
];

// 코사인 유사도
function cosineSim(a: number[], b: number[]): number {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// 사용자 조건 → 벡터
function condToVec(selected: string[], options: string[]): number[] {
  return options.map((o) => (selected.includes(o) ? 1 : 0));
}

// 매칭 이유 생성
function getReasons(userPace: string[], userDist: string[], userTime: string[], userRegion: string[], runner: Runner): string[] {
  const reasons: string[] = [];
  const pace   = condToVec(userPace,   PACE_OPTIONS);
  const dist   = condToVec(userDist,   DIST_OPTIONS);
  const time   = condToVec(userTime,   TIME_OPTIONS);
  const region = condToVec(userRegion, REGION_OPTIONS);

  if (pace.some((v, i)   => v && runner.paceVec[i]))   reasons.push('페이스 일치');
  if (dist.some((v, i)   => v && runner.distVec[i]))   reasons.push('거리 일치');
  if (time.some((v, i)   => v && runner.timeVec[i]))   reasons.push('시간대 일치');
  if (region.some((v, i) => v && runner.regionVec[i])) reasons.push('지역 일치');
  return reasons;
}

// NL 검색 파싱 (더미 로직)
const NL_EXAMPLES = [
  { query: '주말 아침에 5km 정도 같이 뛸 사람', pace: ['5:30~6:00'], dist: ['3~5km', '5~7km'], time: ['아침'], region: [] },
  { query: '강남 저녁에 빠른 페이스로 달리고 싶어', pace: ['~5:00', '5:00~5:30'], dist: ['5~7km', '7~10km'], time: ['저녁'], region: ['강남구'] },
  { query: '마포 퇴근 후 가볍게 조깅', pace: ['6:00~6:30', '6:30~7:00'], dist: ['3~5km'], time: ['저녁', '밤'], region: ['마포구'] },
];

type Step = 'idle' | 'processing' | 'done';

export default function AiDemoPage() {
  // ── 사용자 조건 상태 ──
  const [selPace,   setSelPace]   = useState<string[]>(['5:30~6:00']);
  const [selDist,   setSelDist]   = useState<string[]>(['3~5km', '5~7km']);
  const [selTime,   setSelTime]   = useState<string[]>(['저녁']);
  const [selRegion, setSelRegion] = useState<string[]>(['마포구']);

  // ── AI 처리 단계 ──
  const [step,    setStep]    = useState<Step>('idle');
  const [stepIdx, setStepIdx] = useState(0); // 0~3
  const [results, setResults] = useState<{ runner: Runner; score: number; reasons: string[] }[]>([]);

  // ── 자연어 검색 ──
  const [nlQuery,      setNlQuery]      = useState('');
  const [nlParsed,     setNlParsed]     = useState<typeof NL_EXAMPLES[0] | null>(null);
  const [nlProcessing, setNlProcessing] = useState(false);
  const [nlDone,       setNlDone]       = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleOption = (
    value: string,
    sel: string[],
    setSel: (v: string[]) => void,
  ) => {
    setSel(sel.includes(value) ? sel.filter((v) => v !== value) : [...sel, value]);
    setStep('idle');
    setResults([]);
    setStepIdx(0);
  };

  const runMatching = () => {
    if (!selPace.length && !selDist.length && !selTime.length && !selRegion.length) return;
    setStep('processing');
    setStepIdx(0);
    setResults([]);

    const timer = (delay: number, fn: () => void) => setTimeout(fn, delay);

    timer(600,  () => setStepIdx(1));
    timer(1300, () => setStepIdx(2));
    timer(2000, () => setStepIdx(3));
    timer(2700, () => {
      const uPace   = condToVec(selPace,   PACE_OPTIONS);
      const uDist   = condToVec(selDist,   DIST_OPTIONS);
      const uTime   = condToVec(selTime,   TIME_OPTIONS);
      const uRegion = condToVec(selRegion, REGION_OPTIONS);

      const scored = RUNNERS.map((r) => {
        const sim =
          cosineSim(uPace, r.paceVec)   * 0.35 +
          cosineSim(uDist, r.distVec)   * 0.25 +
          cosineSim(uTime, r.timeVec)   * 0.25 +
          cosineSim(uRegion, r.regionVec) * 0.15;
        return {
          runner:  r,
          score:   Math.round(sim * 100),
          reasons: getReasons(selPace, selDist, selTime, selRegion, r),
        };
      })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);

      setResults(scored);
      setStep('done');
    });
  };

  const handleNlSearch = () => {
    if (!nlQuery.trim()) return;
    setNlProcessing(true);
    setNlDone(false);
    setNlParsed(null);

    setTimeout(() => {
      const match =
        NL_EXAMPLES.find((e) => nlQuery.includes('강남'))   ? NL_EXAMPLES[1] :
        NL_EXAMPLES.find((e) => nlQuery.includes('마포'))   ? NL_EXAMPLES[2] :
        NL_EXAMPLES[0];
      setNlParsed(match);
      setNlProcessing(false);
      setNlDone(true);
    }, 1800);
  };

  const applyNlResult = () => {
    if (!nlParsed) return;
    setSelPace(nlParsed.pace);
    setSelDist(nlParsed.dist);
    setSelTime(nlParsed.time);
    setSelRegion(nlParsed.region);
    setStep('idle');
    setResults([]);
    setStepIdx(0);
    setNlDone(false);
    setNlQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const PROCESS_STEPS = [
    { label: '조건 벡터화',    desc: '페이스·거리·시간대·지역 → 수치 벡터 변환' },
    { label: '코사인 유사도',  desc: '내 벡터 × 전체 러너 벡터 → 유사도 계산' },
    { label: '가중치 적용',    desc: '페이스 35% / 거리 25% / 시간 25% / 지역 15%' },
    { label: '결과 정렬',      desc: '점수 높은 순 정렬 → 상위 추천' },
  ];

  const scoreColor = (s: number) =>
    s >= 70 ? '#FCFF74' : s >= 40 ? '#ffa42b' : '#8a8a8a';

  return (
    <>
      <Header title="AI 매칭 시스템" showBack />
      <main className="page-content">

        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroIcon}>🤖</div>
          <h2 className={styles.heroTitle}>AI 러닝 메이트 매칭</h2>
          <p className={styles.heroDesc}>
            내 러닝 조건을 벡터로 변환해<br />
            가장 잘 맞는 러너를 찾아드려요
          </p>
        </section>

        {/* ── 자연어 검색 ── */}
        <section className={styles.nlSection}>
          <div className={styles.sectionLabel}>
            <span className={styles.aiBadge}>AI</span>
            자연어 검색
          </div>
          <p className={styles.sectionDesc}>글로 설명하면 AI가 조건을 자동으로 뽑아줘요</p>
          <div className={styles.nlInputRow}>
            <input
              ref={inputRef}
              className={styles.nlInput}
              value={nlQuery}
              onChange={(e) => { setNlQuery(e.target.value); setNlDone(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleNlSearch()}
              placeholder="예: 마포 퇴근 후 가볍게 조깅할 사람"
            />
            <button
              className={styles.nlBtn}
              onClick={handleNlSearch}
              disabled={nlProcessing}
            >
              {nlProcessing ? '…' : '분석'}
            </button>
          </div>

          {nlProcessing && (
            <div className={styles.nlProcessing}>
              <span className={styles.pulse} />
              <span>LLM이 의도를 파악하고 있어요</span>
            </div>
          )}

          {nlDone && nlParsed && (
            <div className={styles.nlResult}>
              <p className={styles.nlResultTitle}>파싱 결과</p>
              <div className={styles.nlTags}>
                {nlParsed.pace.map((v) => <span key={v} className={`${styles.nlTag} ${styles.tagPace}`}>페이스 {v}</span>)}
                {nlParsed.dist.map((v) => <span key={v} className={`${styles.nlTag} ${styles.tagDist}`}>거리 {v}</span>)}
                {nlParsed.time.map((v) => <span key={v} className={`${styles.nlTag} ${styles.tagTime}`}>시간 {v}</span>)}
                {nlParsed.region.map((v) => <span key={v} className={`${styles.nlTag} ${styles.tagRegion}`}>지역 {v}</span>)}
              </div>
              <button className={styles.applyBtn} onClick={applyNlResult}>
                이 조건으로 매칭 ↓
              </button>
            </div>
          )}
        </section>

        {/* ── INPUT: 조건 설정 ── */}
        <section className={styles.inputSection}>
          <div className={styles.sectionLabel}>
            <span className={styles.stepBadge}>INPUT</span>
            내 러닝 조건
          </div>

          <div className={styles.condGroup}>
            <p className={styles.condLabel}>페이스 (분/km)</p>
            <div className={styles.toggleRow}>
              {PACE_OPTIONS.map((o) => (
                <button
                  key={o}
                  className={`${styles.toggleBtn} ${selPace.includes(o) ? styles.active : ''}`}
                  onClick={() => toggleOption(o, selPace, setSelPace)}
                >{o}</button>
              ))}
            </div>
          </div>

          <div className={styles.condGroup}>
            <p className={styles.condLabel}>거리</p>
            <div className={styles.toggleRow}>
              {DIST_OPTIONS.map((o) => (
                <button
                  key={o}
                  className={`${styles.toggleBtn} ${selDist.includes(o) ? styles.active : ''}`}
                  onClick={() => toggleOption(o, selDist, setSelDist)}
                >{o}</button>
              ))}
            </div>
          </div>

          <div className={styles.condGroup}>
            <p className={styles.condLabel}>시간대</p>
            <div className={styles.toggleRow}>
              {TIME_OPTIONS.map((o) => (
                <button
                  key={o}
                  className={`${styles.toggleBtn} ${selTime.includes(o) ? styles.active : ''}`}
                  onClick={() => toggleOption(o, selTime, setSelTime)}
                >{o}</button>
              ))}
            </div>
          </div>

          <div className={styles.condGroup}>
            <p className={styles.condLabel}>선호 지역</p>
            <div className={styles.toggleRow}>
              {REGION_OPTIONS.map((o) => (
                <button
                  key={o}
                  className={`${styles.toggleBtn} ${selRegion.includes(o) ? styles.active : ''}`}
                  onClick={() => toggleOption(o, selRegion, setSelRegion)}
                >{o}</button>
              ))}
            </div>
          </div>

          <button
            className={styles.matchBtn}
            onClick={runMatching}
            disabled={step === 'processing'}
          >
            {step === 'processing' ? 'AI 분석 중…' : '🤖 AI 매칭 시작'}
          </button>
        </section>

        {/* ── PROCESS: 처리 단계 시각화 ── */}
        {(step === 'processing' || step === 'done') && (
          <section className={styles.processSection}>
            <div className={styles.sectionLabel}>
              <span className={styles.stepBadge}>PROCESS</span>
              AI 처리 과정
            </div>
            <div className={styles.processList}>
              {PROCESS_STEPS.map((ps, i) => {
                const done    = stepIdx > i;
                const current = stepIdx === i && step === 'processing';
                return (
                  <div
                    key={i}
                    className={`${styles.processItem} ${done ? styles.processDone : ''} ${current ? styles.processCurrent : ''}`}
                  >
                    <div className={styles.processIcon}>
                      {done ? '✓' : current ? <span className={styles.spinner} /> : String(i + 1)}
                    </div>
                    <div className={styles.processText}>
                      <p className={styles.processLabel}>{ps.label}</p>
                      <p className={styles.processDesc}>{ps.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 가중치 시각화 */}
            {step === 'done' && (
              <div className={styles.weightViz}>
                <p className={styles.weightTitle}>가중치 구성</p>
                <div className={styles.weightBar}>
                  <div className={styles.weightSeg} style={{ width: '35%', background: '#FCFF74' }}>
                    <span>페이스 35%</span>
                  </div>
                  <div className={styles.weightSeg} style={{ width: '25%', background: '#ffa42b' }}>
                    <span>거리 25%</span>
                  </div>
                  <div className={styles.weightSeg} style={{ width: '25%', background: '#539df5' }}>
                    <span>시간 25%</span>
                  </div>
                  <div className={styles.weightSeg} style={{ width: '15%', background: '#8a8a8a' }}>
                    <span>지역 15%</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── OUTPUT: 매칭 결과 ── */}
        {step === 'done' && results.length > 0 && (
          <section className={styles.outputSection}>
            <div className={styles.sectionLabel}>
              <span className={styles.stepBadge}>OUTPUT</span>
              매칭 결과
            </div>
            <p className={styles.sectionDesc}>{results.length}명의 러너를 찾았어요</p>
            <div className={styles.resultList}>
              {results.map((r, rank) => (
                <div key={r.runner.id} className={`${styles.resultCard} ${rank === 0 ? styles.topCard : ''}`}>
                  {rank === 0 && <div className={styles.topBadge}>최고 매칭</div>}
                  <div className={styles.resultLeft}>
                    <span className={styles.resultAvatar}>{r.runner.avatar}</span>
                    <div>
                      <p className={styles.resultName}>{r.runner.name}</p>
                      <p className={styles.resultBio}>{r.runner.bio}</p>
                      <div className={styles.reasonTags}>
                        {r.reasons.map((reason) => (
                          <span key={reason} className={styles.reasonTag}>{reason}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={styles.scoreCol}>
                    <svg width="52" height="52" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="22" fill="none" stroke="#2a2a2a" strokeWidth="4" />
                      <circle
                        cx="26" cy="26" r="22" fill="none"
                        stroke={scoreColor(r.score)} strokeWidth="4"
                        strokeDasharray={`${(r.score / 100) * 138.2} 138.2`}
                        strokeLinecap="round"
                        transform="rotate(-90 26 26)"
                        style={{ transition: 'stroke-dasharray 0.8s ease' }}
                      />
                      <text x="26" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill={scoreColor(r.score)}>
                        {r.score}%
                      </text>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 'done' && results.length === 0 && (
          <div className={styles.noResult}>
            <p>😢 조건에 맞는 러너가 없어요</p>
            <p>조건을 조금 넓혀보세요</p>
          </div>
        )}

        {/* ── AI 모델 방향 ── */}
        <section className={styles.modelSection}>
          <div className={styles.sectionLabel}>
            <span className={styles.aiBadge}>AI</span>
            사용 모델 & 향후 고도화
          </div>
          <div className={styles.modelCards}>
            <div className={styles.modelCard}>
              <div className={styles.modelPhase}>현재 (MVP)</div>
              <p className={styles.modelName}>규칙 기반 + 코사인 유사도</p>
              <p className={styles.modelDesc}>조건 토글 → 다차원 벡터 → 가중 코사인 유사도로 빠른 매칭. 학습 데이터 없이도 즉시 동작.</p>
              <div className={styles.modelTags}>
                <span>벡터 연산</span><span>가중치 튜닝</span>
              </div>
            </div>
            <div className={styles.modelCard}>
              <div className={styles.modelPhase}>중기</div>
              <p className={styles.modelName}>협업 필터링 (CF)</p>
              <p className={styles.modelDesc}>같이 달린 이력 · 평점 · 재참가율 기반으로 "이 러너랑 잘 맞는 사람" 패턴 학습. Surprise / LightFM 활용.</p>
              <div className={styles.modelTags}>
                <span>협업 필터링</span><span>Matrix Factorization</span>
              </div>
            </div>
            <div className={styles.modelCard}>
              <div className={styles.modelPhase}>장기</div>
              <p className={styles.modelName}>LLM (Gemini) 자연어 매칭</p>
              <p className={styles.modelDesc}>자연어 쿼리 → Gemini로 의도 파싱 → 조건 자동 추출 → 매칭. 프로필 설명도 임베딩 벡터로 유사도 비교.</p>
              <div className={styles.modelTags}>
                <span>Gemini API</span><span>임베딩</span><span>RAG</span>
              </div>
            </div>
          </div>

          {/* 데이터 흐름 다이어그램 */}
          <div className={styles.dataFlow}>
            <p className={styles.dataFlowTitle}>학습 데이터 파이프라인</p>
            <div className={styles.flowRow}>
              <div className={styles.flowBox}>러닝 기록<br/><span>GPS, 페이스, 거리</span></div>
              <div className={styles.flowArrow}>→</div>
              <div className={styles.flowBox}>모임 참여<br/><span>수락/거절, 재참가</span></div>
              <div className={styles.flowArrow}>→</div>
              <div className={styles.flowBox}>피드백<br/><span>리뷰, 별점</span></div>
              <div className={styles.flowArrow}>→</div>
              <div className={`${styles.flowBox} ${styles.flowBoxAccent}`}>AI 모델<br/><span>매칭 정확도 향상</span></div>
            </div>
          </div>
        </section>

      </main>
      <BottomNav />
    </>
  );
}
