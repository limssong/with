import Link from 'next/link';
import type { Crew } from '@/data/crews';
import Tag from '@/components/common/Tag';
import styles from './CrewCard.module.scss';

interface CrewCardProps {
  crew: Crew;
}

const statusLabel: Record<string, string> = {
  upcoming: '모집중',
  full: '마감',
  completed: '완료',
  cancelled: '취소',
};

export default function CrewCard({ crew }: CrewCardProps) {
  const dateObj = new Date(crew.date);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];

  return (
    <Link href={`/crews/${crew.id}`} className={styles.card}>
      <div className={styles.dateBox}>
        <span className={styles.month}>{month}월</span>
        <span className={styles.day}>{day}</span>
        <span className={styles.weekday}>{weekday}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{crew.title}</h3>
          <span className={`${styles.status} ${crew.status === 'full' ? styles.statusFull : ''}`}>
            {statusLabel[crew.status]}
          </span>
        </div>
        <p className={styles.meta}>
          {crew.time} · {crew.distance}km · 페이스 {crew.pace}
        </p>
        <p className={styles.location}>{crew.location}</p>
        <div className={styles.footer}>
          <div className={styles.members}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21" stroke="currentColor" strokeWidth="2"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{crew.currentMembers}/{crew.maxMembers}</span>
          </div>
          <div className={styles.tags}>
            {crew.tags.slice(0, 2).map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
