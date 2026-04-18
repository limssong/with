import Link from 'next/link';
import type { Course } from '@/data/courses';
import Tag from '@/components/common/Tag';
import styles from './CourseCard.module.scss';

interface CourseCardProps {
  course: Course;
}

const difficultyLabel = {
  easy: '초급',
  medium: '중급',
  hard: '고급',
};

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className={styles.card}>
      <div className={styles.thumbnail}>
        <div className={styles.placeholder}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className={styles.distance}>{course.distance}km</span>
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{course.name}</h3>
        <p className={styles.location}>{course.region}</p>
        <div className={styles.meta}>
          <span className={styles.rating}>★ {course.rating}</span>
          <span className={styles.reviews}>({course.reviewCount})</span>
        </div>
        <div className={styles.tags}>
          <Tag label={difficultyLabel[course.difficulty]} variant={course.difficulty === 'easy' ? 'accent' : 'default'} />
          {course.tags.slice(0, 2).map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </div>
    </Link>
  );
}
