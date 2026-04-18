'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './Header.module.scss';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({ title = 'With Running', showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false)
        .then(({ count }) => {
          setUnreadCount(count || 0);
        });
    });
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBack ? (
          <button className={styles.backBtn} onClick={() => router.back()} aria-label="뒤로가기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <Link href="/" className={styles.logo} aria-label="With Running 홈">
            <Image src="/logo.png" alt="" width={24} height={24} className={styles.logoIcon} aria-hidden="true" />
            <span>ith</span>
          </Link>
        )}
      </div>
      {showBack ? (
        <p className={styles.title}>{title}</p>
      ) : (
        <h1 className={styles.srOnly}>With Running - 함께 달리는 러닝 커뮤니티</h1>
      )}
      <div className={styles.right}>
        {rightAction || (
          <Link href="/notifications" className={styles.bellBtn} aria-label="알림">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </Link>
        )}
      </div>
    </header>
  );
}
