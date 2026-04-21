import Link from 'next/link';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import PillButton from '@/components/common/PillButton';
import { getCrews } from '@/lib/data';
import CrewsView from './CrewsView';
import styles from './page.module.scss';

export const revalidate = 60;

export default async function CrewsPage() {
  const crews = await getCrews();

  return (
    <>
      <Header />
      <main className="page-content">
        <div className={styles.topBar}>
          <h2 className={styles.pageTitle}>러닝 모임</h2>
          <Link href="/crews/create">
            <PillButton variant="primary" size="sm">모임 만들기</PillButton>
          </Link>
        </div>

        <CrewsView crews={crews} />
      </main>
      <BottomNav />
    </>
  );
}
