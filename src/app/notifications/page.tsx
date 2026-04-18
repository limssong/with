'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import { supabase } from '@/lib/supabase';
import styles from './page.module.scss';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const typeIcon: Record<string, string> = {
  match: '🤝',
  crew_join: '🏃',
  crew_accepted: '✅',
  crew_rejected: '❌',
  crew_reminder: '⏰',
  weather: '🌤️',
  ai_recommend: '🤖',
  review: '⭐',
  system: '📢',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setNotifications(data || []);
          setLoading(false);

          // 읽음 처리
          if (data?.some((n) => !n.is_read)) {
            supabase
              .from('notifications')
              .update({ is_read: true })
              .eq('user_id', session.user.id)
              .eq('is_read', false)
              .then(() => {});
          }
        });
    });
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  if (loading) {
    return (
      <>
        <Header title="알림" showBack />
        <main className="page-content">
          <p className={styles.loading}>불러오는 중...</p>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header title="알림" showBack />
      <main className="page-content">
        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>알림이 없습니다</p>
            <span>매칭 알림, 모임 리마인더 등이 여기에 표시됩니다</span>
          </div>
        ) : (
          <div className={styles.list}>
            {notifications.map((n) => {
              const content = (
                <div className={`${styles.item} ${!n.is_read ? styles.unread : ''}`}>
                  <span className={styles.icon}>{typeIcon[n.type] || '📌'}</span>
                  <div className={styles.content}>
                    <p className={styles.title}>{n.title}</p>
                    {n.message && <p className={styles.message}>{n.message}</p>}
                    <span className={styles.time}>{formatDate(n.created_at)}</span>
                  </div>
                </div>
              );

              return n.link ? (
                <Link key={n.id} href={n.link}>{content}</Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
