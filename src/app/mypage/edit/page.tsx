'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import PillButton from '@/components/common/PillButton';
import { supabase } from '@/lib/supabase';
import styles from './page.module.scss';

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userId, setUserId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    nickname: '',
    pace: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace('/login');
        return;
      }
      setUserId(session.user.id);
      supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
        .then(({ data: p }) => {
          setForm({
            nickname: p?.name || session.user?.user_metadata?.full_name || '',
            pace: p?.pace || '',
          });
          setAvatarUrl(p?.avatar_url || session.user?.user_metadata?.avatar_url || null);
          setLoading(false);
        });
    });
  }, [router]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('PNG, JPG, WebP 형식만 지원합니다');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    setErrorMsg('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.nickname.trim()) return;
    setErrorMsg('');
    setSaving(true);

    let newAvatarUrl = avatarUrl;

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const path = `avatars/${userId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      } else {
        setErrorMsg('사진 업로드 실패: ' + uploadError.message);
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase.from('profiles')
      .upsert({
        id: userId,
        name: form.nickname.trim(),
        pace: form.pace,
        avatar_url: newAvatarUrl,
      });

    setSaving(false);
    if (error) {
      setErrorMsg('저장 실패: ' + error.message);
    } else {
      router.push('/mypage');
    }
  };

  if (loading) {
    return (
      <>
        <Header title="프로필 수정" showBack />
        <main className="page-content">
          <p className={styles.loadingText}>불러오는 중...</p>
        </main>
        <BottomNav />
      </>
    );
  }

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <>
      <Header title="프로필 수정" showBack />
      <main id="main-content" className="page-content">
        <div className={styles.form}>
          <div className={styles.avatarSection}>
            <button
              type="button"
              className={styles.avatarBtn}
              onClick={() => fileInputRef.current?.click()}
              aria-label="프로필 사진 변경"
            >
              {displayAvatar ? (
                <Image src={displayAvatar} alt="현재 프로필 사진" width={80} height={80} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarPlaceholder} aria-hidden="true">
                  {form.nickname.charAt(0) || '?'}
                </div>
              )}
              <span className={styles.avatarEdit} aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"/>
                </svg>
              </span>
            </button>
            <input
              ref={fileInputRef}
              id="avatar-file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
              hidden
            />
            <p className={styles.avatarHint}>사진을 탭하여 변경</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-nickname">닉네임</label>
            <input
              id="profile-nickname"
              className={styles.input}
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              placeholder="닉네임을 입력하세요"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-pace">평균 페이스 (/km)</label>
            <input
              id="profile-pace"
              className={styles.input}
              value={form.pace}
              onChange={(e) => setForm({ ...form, pace: e.target.value })}
              placeholder="예: 5:30"
            />
          </div>

          <p
            className={styles.errorMsg}
            role="alert"
            aria-live="polite"
            hidden={!errorMsg}
          >
            {errorMsg}
          </p>

          <PillButton variant="primary" fullWidth onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장하기'}
          </PillButton>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
