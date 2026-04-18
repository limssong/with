'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import PillButton from '@/components/common/PillButton';
import KakaoSearch from '@/components/map/KakaoSearch';
import { supabase } from '@/lib/supabase';
import styles from './page.module.scss';

export default function CreateCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    distance: '',
    difficulty: 'easy',
    elevation: '',
    location: '',
    region: '',
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);

    const { error } = await supabase.from('courses').insert({
      name: form.name,
      description: form.description,
      distance: Number(form.distance),
      difficulty: form.difficulty,
      elevation: Number(form.elevation) || 0,
      location: form.location,
      region: form.region,
      coordinates: coords ? [{ lat: coords.lat, lng: coords.lng }] : [],
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setSaving(false);
    if (error) {
      setErrorMsg('등록 실패: ' + error.message);
    } else {
      router.push('/courses');
    }
  };

  return (
    <>
      <Header title="코스 등록" showBack />
      <main id="main-content" className="page-content">
        <form className={styles.form} onSubmit={handleSubmit} aria-describedby="course-form-error">
          <div className={styles.field}>
            <label className={styles.label} htmlFor="course-name">코스 이름</label>
            <input
              id="course-name"
              className={styles.input}
              name="name"
              placeholder="예: 여의도 한강공원 코스"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="course-description">설명</label>
            <textarea
              id="course-description"
              className={styles.textarea}
              name="description"
              placeholder="코스에 대한 설명을 입력해주세요"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="course-distance">거리 (km)</label>
              <input
                id="course-distance"
                className={styles.input}
                name="distance"
                type="number"
                step="0.1"
                placeholder="5.0"
                value={form.distance}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="course-elevation">고도 (m)</label>
              <input
                id="course-elevation"
                className={styles.input}
                name="elevation"
                type="number"
                placeholder="0"
                value={form.elevation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="course-difficulty">난이도</label>
            <select id="course-difficulty" className={styles.select} name="difficulty" value={form.difficulty} onChange={handleChange}>
              <option value="easy">초급</option>
              <option value="medium">중급</option>
              <option value="hard">고급</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="course-location">위치 검색</label>
            <KakaoSearch
              inputId="course-location"
              placeholder="장소명 또는 주소를 검색하세요"
              onSelect={(result) => { setForm({ ...form, location: result.name, region: result.address }); setCoords({ lat: result.lat, lng: result.lng }); }}
            />
            {form.location && (
              <p className={styles.selectedLocation}>{form.location} · {form.region}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="course-tags">태그 (쉼표로 구분)</label>
            <input
              id="course-tags"
              className={styles.input}
              name="tags"
              placeholder="예: 평지, 한강, 야경"
              value={form.tags}
              onChange={handleChange}
            />
          </div>

          <p
            id="course-form-error"
            className={styles.errorMsg}
            role="alert"
            aria-live="polite"
            hidden={!errorMsg}
          >
            {errorMsg}
          </p>

          {/* Map Placeholder */}
          <div className={styles.mapPlaceholder}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.03 7.03 1 12 1C16.97 1 21 5.03 21 10Z" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>지도에서 코스를 그려주세요</span>
            <span className={styles.mapSub}>지도 연동 후 코스 경로를 직접 그릴 수 있습니다</span>
          </div>

          <PillButton variant="primary" fullWidth type="submit" disabled={saving}>
            {saving ? '등록 중...' : '코스 등록하기'}
          </PillButton>
        </form>
      </main>
      <BottomNav />
    </>
  );
}
