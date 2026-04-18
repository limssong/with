'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // 프로필이 없으면 자동 생성
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!existing) {
          await supabase.from('profiles').insert({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '러너',
            avatar_url: session.user.user_metadata?.avatar_url || null,
          });
        }

        router.push('/');
      }
    });
  }, [router]);

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', color: '#8a8a8a' }}>
      <p>로그인 처리 중...</p>
    </main>
  );
}
