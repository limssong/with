'use client';

import { useState, useEffect, use } from 'react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import { supabase } from '@/lib/supabase';
import styles from './page.module.scss';

interface Member {
  id: string;
  user_id: string;
  status: string;
  profile: { name: string; avatar_url: string | null } | null;
}

export default function ManageCrewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [crew, setCrew] = useState<{ title: string; host_id: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('crews').select('title, host_id').eq('id', id).single(),
      supabase.from('crew_members').select('id, user_id, status, profile:profiles(name, avatar_url)').eq('crew_id', id),
    ]).then(([crewRes, membersRes]) => {
      if (crewRes.error) {
        setError('모임 정보를 불러올 수 없습니다');
        setLoading(false);
        return;
      }
      setCrew(crewRes.data);
      setMembers((membersRes.data || []).map((d) => {
        const p = Array.isArray(d.profile) ? d.profile[0] : d.profile;
        return {
          id: d.id,
          user_id: d.user_id,
          status: d.status,
          profile: p as { name: string; avatar_url: string | null } | null,
        };
      }));
      setLoading(false);
    }).catch(() => {
      setError('데이터를 불러오는 중 오류가 발생했습니다');
      setLoading(false);
    });
  }, [id]);

  const updateStatus = async (memberId: string, status: 'accepted' | 'rejected') => {
    await supabase.from('crew_members').update({ status }).eq('id', memberId);
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, status } : m));
  };

  if (loading) {
    return (
      <>
        <Header title="참석 관리" showBack />
        <main className="page-content">
          <p className={styles.loadingText}>불러오는 중...</p>
        </main>
        <BottomNav />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="참석 관리" showBack />
        <main className="page-content">
          <p className={styles.loadingText} style={{ color: '#ff6b6b' }}>{error}</p>
        </main>
        <BottomNav />
      </>
    );
  }

  const pending = members.filter((m) => m.status === 'pending');
  const accepted = members.filter((m) => m.status === 'accepted');
  const rejected = members.filter((m) => m.status === 'rejected');

  return (
    <>
      <Header title="참석 관리" showBack />
      <main className="page-content">
        <h1 className={styles.crewTitle}>{crew?.title}</h1>

        {/* Pending */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>대기 중 ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className={styles.empty}>대기 중인 신청이 없습니다</p>
          ) : (
            <div className={styles.list}>
              {pending.map((m) => (
                <div key={m.id} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>{m.profile?.name?.charAt(0) || '?'}</div>
                  <span className={styles.memberName}>{m.profile?.name || '익명'}</span>
                  <div className={styles.actions}>
                    <button className={styles.acceptBtn} onClick={() => updateStatus(m.id, 'accepted')}>수락</button>
                    <button className={styles.rejectBtn} onClick={() => updateStatus(m.id, 'rejected')}>거절</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Accepted */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>참여 확정 ({accepted.length})</h2>
          {accepted.length === 0 ? (
            <p className={styles.empty}>확정된 멤버가 없습니다</p>
          ) : (
            <div className={styles.list}>
              {accepted.map((m) => (
                <div key={m.id} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>{m.profile?.name?.charAt(0) || '?'}</div>
                  <span className={styles.memberName}>{m.profile?.name || '익명'}</span>
                  <span className={styles.statusAccepted}>참여확정</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Rejected */}
        {rejected.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>거절 ({rejected.length})</h2>
            <div className={styles.list}>
              {rejected.map((m) => (
                <div key={m.id} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>{m.profile?.name?.charAt(0) || '?'}</div>
                  <span className={styles.memberName}>{m.profile?.name || '익명'}</span>
                  <span className={styles.statusRejected}>거절됨</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <BottomNav />
    </>
  );
}
