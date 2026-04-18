'use client';

import { useState, useEffect, useRef, use } from 'react';
import Header from '@/components/common/Header';
import { supabase } from '@/lib/supabase';
import styles from './page.module.scss';

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profile?: { name: string } | null;
}

export default function CrewChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });

    // 기존 메시지 로드
    supabase
      .from('chat_messages')
      .select('id, user_id, message, created_at, profile:profiles(name)')
      .eq('crew_id', id)
      .order('created_at', { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError('메시지를 불러올 수 없습니다');
          return;
        }
        if (data) setMessages(data.map((d) => {
          const p = Array.isArray(d.profile) ? d.profile[0] : d.profile;
          return {
            id: d.id,
            user_id: d.user_id,
            message: d.message,
            created_at: d.created_at,
            profile: p as { name: string } | null,
          };
        }));
      });

    // 실시간 구독
    const channel = supabase
      .channel(`chat-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `crew_id=eq.${id}`,
      }, async (payload) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', payload.new.user_id)
          .maybeSingle();

        const newMsg: Message = {
          id: payload.new.id,
          user_id: payload.new.user_id,
          message: payload.new.message,
          created_at: payload.new.created_at,
          profile,
        };
        setMessages((prev) => [...prev, newMsg]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;
    const msg = input.trim();
    setInput('');

    await supabase.from('chat_messages').insert({
      crew_id: id,
      user_id: userId,
      message: msg,
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <>
      <Header title="모임 채팅" showBack />
      <main className={styles.chatPage}>
        <div className={styles.messageList}>
          {error && (
            <p className={styles.empty} style={{ color: '#ff6b6b' }}>{error}</p>
          )}
          {!error && messages.length === 0 && (
            <p className={styles.empty}>아직 메시지가 없습니다. 첫 메시지를 보내보세요!</p>
          )}
          {messages.map((msg) => {
            const isMine = msg.user_id === userId;
            return (
              <div key={msg.id} className={`${styles.message} ${isMine ? styles.mine : styles.others}`}>
                {!isMine && (
                  <span className={styles.senderName}>{msg.profile?.name || '러너'}</span>
                )}
                <div className={styles.bubble}>
                  <p>{msg.message}</p>
                  <span className={styles.time}>{formatTime(msg.created_at)}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className={styles.inputBar}>
          <input
            className={styles.chatInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={userId ? '메시지를 입력하세요' : '로그인이 필요합니다'}
            disabled={!userId}
          />
          <button className={styles.sendBtn} onClick={sendMessage} disabled={!userId || !input.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z"/>
            </svg>
          </button>
        </div>
      </main>
    </>
  );
}
