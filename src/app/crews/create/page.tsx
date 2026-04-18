'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import PillButton from '@/components/common/PillButton';
import KakaoSearch from '@/components/map/KakaoSearch';
import { getCourses } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import type { Course } from '@/data/courses';
import styles from './page.module.scss';

export default function CreateCrewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: '',
    date: '',
    time: '',
    pace: '',
    maxMembers: '8',
    location: '',
    tags: '',
    isRecurring: false,
    recurringDay: '',
  });

  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);

    const selectedCourse = courses.find((c) => c.id === form.courseId);
    const { error } = await supabase.from('crews').insert({
      title: form.title,
      description: form.description,
      course_id: form.courseId || null,
      date: form.date,
      time: form.time,
      pace: form.pace,
      distance: selectedCourse?.distance || 0,
      max_members: Number(form.maxMembers),
      location: form.location,
      region: selectedCourse?.region || '',
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'upcoming',
      is_recurring: form.isRecurring,
      recurring_day: form.isRecurring ? form.recurringDay : null,
    });

    setSaving(false);
    if (error) {
      setErrorMsg('생성 실패: ' + error.message);
    } else {
      router.push('/crews');
    }
  };

  return (
    <>
      <Header title="모임 만들기" showBack />
      <main id="main-content" className="page-content">
        <form className={styles.form} onSubmit={handleSubmit} aria-describedby="crew-form-error">
          <div className={styles.field}>
            <label className={styles.label} htmlFor="crew-title">모임 제목</label>
            <input
              id="crew-title"
              className={styles.input}
              name="title"
              placeholder="예: 여의도 저녁 러닝 같이해요!"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="crew-description">모임 설명</label>
            <textarea
              id="crew-description"
              className={styles.textarea}
              name="description"
              placeholder="모임에 대해 소개해주세요"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="crew-course">러닝 코스</label>
            <select id="crew-course" className={styles.select} name="courseId" value={form.courseId} onChange={handleChange} required>
              <option value="">코스를 선택해주세요</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.distance}km)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="crew-date">날짜</label>
              <input
                id="crew-date"
                className={styles.input}
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="crew-time">시간</label>
              <input
                id="crew-time"
                className={styles.input}
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="crew-pace">목표 페이스 (/km)</label>
              <input
                id="crew-pace"
                className={styles.input}
                name="pace"
                placeholder="6:00~6:30"
                value={form.pace}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="crew-max">최대 인원</label>
              <input
                id="crew-max"
                className={styles.input}
                name="maxMembers"
                type="number"
                min="2"
                max="50"
                value={form.maxMembers}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="crew-location">집합 장소</label>
            <KakaoSearch
              inputId="crew-location"
              placeholder="집합 장소를 검색하세요"
              onSelect={(result) => setForm({ ...form, location: `${result.name} (${result.address})` })}
            />
            {form.location && (
              <p className={styles.selectedLocation}>{form.location}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="crew-tags">태그 (쉼표로 구분)</label>
            <input
              id="crew-tags"
              className={styles.input}
              name="tags"
              placeholder="예: 초보환영, 저녁러닝, 한강"
              value={form.tags}
              onChange={handleChange}
            />
          </div>

          <div className={styles.checkRow}>
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={form.isRecurring}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <label htmlFor="isRecurring" className={styles.checkLabel}>정기 모임으로 설정</label>
          </div>

          {form.isRecurring && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="crew-recurring-day">반복 주기</label>
              <input
                id="crew-recurring-day"
                className={styles.input}
                name="recurringDay"
                placeholder="예: 매주 화요일"
                value={form.recurringDay}
                onChange={handleChange}
              />
            </div>
          )}

          <p
            id="crew-form-error"
            className={styles.errorMsg}
            role="alert"
            aria-live="polite"
            hidden={!errorMsg}
          >
            {errorMsg}
          </p>

          <PillButton variant="primary" fullWidth type="submit" disabled={saving}>
            {saving ? '생성 중...' : '모임 만들기'}
          </PillButton>
        </form>
      </main>
      <BottomNav />
    </>
  );
}
