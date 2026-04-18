'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import PillButton from '@/components/common/PillButton';
import { supabase } from '@/lib/supabase';
import styles from './page.module.scss';

export default function CourseReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setErrorMsg('별점을 선택해주세요');
      return;
    }

    setErrorMsg('');
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      setErrorMsg('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('course_reviews').insert({
      course_id: id,
      user_id: session.user.id,
      rating,
      content: content.trim() || null,
    });

    setSaving(false);
    if (error) {
      setErrorMsg('리뷰 등록 실패: ' + error.message);
    } else {
      router.push(`/courses/${id}`);
    }
  };

  return (
    <>
      <Header title="리뷰 작성" showBack />
      <main id="main-content" className="page-content">
        <div className={styles.form}>
          <div className={styles.ratingSection} role="radiogroup" aria-label="별점">
            <p className={styles.ratingLabel}>이 코스 어땠나요?</p>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star}점`}
                  className={`${styles.star} ${(hoverRating || rating) >= star ? styles.starActive : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'} aria-hidden="true">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
            <p className={styles.ratingText}>
              {rating === 0 ? '별점을 선택해주세요' : ['', '별로예요', '그저 그래요', '괜찮아요', '좋아요', '최고예요!'][rating]}
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="review-content">후기 (선택)</label>
            <textarea
              id="review-content"
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="이 코스를 달려본 경험을 공유해주세요. 다른 러너에게 큰 도움이 됩니다!"
              rows={6}
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

          <PillButton variant="primary" fullWidth onClick={handleSubmit} disabled={saving || rating === 0}>
            {saving ? '등록 중...' : '리뷰 등록하기'}
          </PillButton>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
