'use client';

import { useState } from 'react';
import CourseCard from '@/components/course/CourseCard';
import type { Course } from '@/data/courses';
import styles from './page.module.scss';

const filters = ['전체', '한강', '공원', '트레일', '초급', '중급', '고급'];

export default function CoursesView({ courses }: { courses: Course[] }) {
  const [activeFilter, setActiveFilter] = useState('전체');

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
    </>
  );
}
