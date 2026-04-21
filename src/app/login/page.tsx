'use client';

import { useState } from 'react';
// import { signInWithKakao, signInWithGoogle } from '@/lib/auth';
import { signInWithGoogle } from '@/lib/auth';
import styles from './page.module.scss';

// type Provider = 'kakao' | 'google';
type Provider = 'google';

export default function LoginPage() {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSignIn(provider: Provider) {
    setErrorMsg(null);
    setLoading(provider);
    try {
      // if (provider === 'kakao') await signInWithKakao();
      // else await signInWithGoogle();
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      console.error('[login] signIn error:', err);
      setLoading(null);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.logo}>
        <h1 className={styles.title}>With</h1>
        <p className={styles.subtitle}>함께 달리는 즐거움</p>
      </div>

      <div className={styles.buttons}>
        {/*
        <button
          className={styles.kakaoBtn}
          onClick={() => handleSignIn('kakao')}
          disabled={loading !== null}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.67 1.77 5.02 4.44 6.34-.2.72-.7 2.6-.8 3.01-.13.5.18.49.38.36.16-.1 2.54-1.73 3.58-2.43.78.11 1.59.17 2.4.17 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"/>
          </svg>
          {loading === 'kakao' ? '로그인 중...' : '카카오로 시작하기'}
        </button>
        */}

        <button
          className={styles.googleBtn}
          onClick={() => handleSignIn('google')}
          disabled={loading !== null}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading === 'google' ? '로그인 중...' : 'Google로 시작하기'}
        </button>
      </div>

      {errorMsg && (
        <p className={styles.error} role="alert">{errorMsg}</p>
      )}

      <p className={styles.footer}>로그인하면 서비스 이용약관에 동의하게 됩니다</p>
    </main>
  );
}
