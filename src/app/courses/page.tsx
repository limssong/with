import Link from 'next/link';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import PillButton from '@/components/common/PillButton';
import { getCourses } from '@/lib/data';
import CoursesView from './CoursesView';
import styles from './page.module.scss';

export const revalidate = 60;

export default async function CoursesPage() {
  const courses = await getCourses();

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

        <CoursesView courses={courses} />
      </main>
      <BottomNav />
    </>
  );
}
