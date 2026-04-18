'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import CourseCard from '@/components/course/CourseCard';
import PillButton from '@/components/common/PillButton';
import { getCourses } from '@/lib/data';
import type { Course } from '@/data/courses';
import styles from './page.module.scss';

const filters = ['전체', '한강', '공원', '트레일', '초급', '중급', '고급'];

export default function CoursesPage() {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  const filtered = activeFilter === '전체'
    ? courses
    : courses.filter((c) => {
        if (activeFilter === '초급') return c.difficulty === 'easy';
        if (activeFilter === '중급') return c.difficulty === 'medium';
        if (activeFilter === '고급') return c.difficulty === 'hard';
        return c.tags.some((t) => t.includes(activeFilter));
      });

  return (
    <>
      <Header />
      <main className="page-content">
        <div className={styles.topBar}>
          <h2 className={styles.pageTitle}>러닝 코스</h2>
          <Link href="/courses/create">
            <PillButton variant="primary" size="sm">코스 등록</PillButton>
          </Link>
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
            filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <p className={styles.empty}>해당 조건의 코스가 없습니다</p>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
