'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import styles from './page.module.scss';

const quickTags = [
  { emoji: '🚰', label: '음수대' },
  { emoji: '⛰️', label: '오르막' },
  { emoji: '🌅', label: '좋은 풍경' },
  { emoji: '⚠️', label: '위험 구간' },
  { emoji: '🚻', label: '화장실' },
  { emoji: '🚦', label: '신호등' },
  { emoji: '🌳', label: '그늘' },
  { emoji: '🅿️', label: '주차장' },
];

export default function RunPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [reports, setReports] = useState<{ tag: string; time: number }[]>([]);
  const [voiceListening, setVoiceListening] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleQuickTag = (label: string) => {
    setReports((prev) => [...prev, { tag: label, time: seconds }]);
    setShowQuickReport(false);
  };

  // Web Speech API는 HTTPS 또는 localhost 환경에서만 동작
  const handleVoice = () => {
    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않아요. Chrome 또는 Safari를 사용해 주세요.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setVoiceListening(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      if (!transcript) return;
      setReports((prev) => [...prev, { tag: `🎙️ "${transcript}"`, time: seconds }]);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        alert('마이크 권한이 필요해요. 브라우저 설정에서 마이크를 허용해 주세요.');
      } else if (event.error === 'audio-capture') {
        alert('마이크 장치를 찾을 수 없어요.');
      }
    };

    recognition.onend = () => setVoiceListening(false);

    recognition.start();
  };

  // Mock running stats
  const distance = (seconds * 0.0028).toFixed(2);
  const pace = seconds > 0 ? `${Math.floor(seconds / 60 / Number(distance) || 0)}:${String(Math.floor((seconds / Number(distance)) % 60) || 0).padStart(2, '0')}` : '--:--';

  return (
    <>
      <Header title="러닝" showBack />
      <main className="page-content">
        {/* Timer & Stats */}
        <section className={styles.timerSection}>
          <span className={styles.timer}>{formatTime(seconds)}</span>
          <div className={styles.runStats}>
            <div className={styles.runStat}>
              <span className={styles.runStatValue}>{distance}</span>
              <span className={styles.runStatLabel}>km</span>
            </div>
            <div className={styles.runStat}>
              <span className={styles.runStatValue}>{isRunning ? pace : '--:--'}</span>
              <span className={styles.runStatLabel}>페이스</span>
            </div>
            <div className={styles.runStat}>
              <span className={styles.runStatValue}>{reports.length}</span>
              <span className={styles.runStatLabel}>리포트</span>
            </div>
          </div>
        </section>

        {/* Auto Detection Status */}
        <section className={styles.autoDetect}>
          <div className={styles.autoDetectHeader}>
            <span className={styles.autoDetectIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </span>
            <span className={styles.autoDetectLabel}>자동 감지</span>
            <span className={`${styles.statusDot} ${isRunning ? styles.active : ''}`} />
          </div>
          {isRunning && (
            <p className={styles.autoDetectMsg}>GPS 고도 · 가속도 센서 분석 중 — 오르막/내리막/정지 구간 자동 태깅</p>
          )}
        </section>

        {/* Report Log */}
        {reports.length > 0 && (
          <section className={styles.reportLog}>
            <h3 className={styles.reportLogTitle}>리포트 기록</h3>
            <div className={styles.reportList}>
              {reports.map((r, i) => (
                <div key={i} className={styles.reportItem}>
                  <span className={styles.reportTime}>{formatTime(r.time)}</span>
                  <span className={styles.reportTag}>{r.tag}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Controls */}
        <div className={styles.controls}>
          {!isRunning ? (
            <button className={styles.startBtn} onClick={() => setIsRunning(true)}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5V19L19 12L8 5Z"/></svg>
            </button>
          ) : (
            <>
              {/* Voice Report */}
              <button className={`${styles.controlBtn} ${voiceListening ? styles.listening : ''}`} onClick={handleVoice} disabled={voiceListening}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" stroke="currentColor" strokeWidth="2"/><path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 19V23M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <span>음성</span>
              </button>

              {/* Stop */}
              <button className={styles.stopBtn} onClick={() => setIsRunning(false)}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
              </button>

              {/* Quick Report */}
              <button className={styles.controlBtn} onClick={() => setShowQuickReport(!showQuickReport)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <span>태그</span>
              </button>
            </>
          )}
        </div>

        {/* Quick Report Tags */}
        {showQuickReport && (
          <div className={styles.quickTags}>
            {quickTags.map((tag) => (
              <button key={tag.label} className={styles.quickTagBtn} onClick={() => handleQuickTag(`${tag.emoji} ${tag.label}`)}>
                <span className={styles.quickTagEmoji}>{tag.emoji}</span>
                <span className={styles.quickTagLabel}>{tag.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Voice Listening Overlay */}
        {voiceListening && (
          <div className={styles.voiceOverlay}>
            <div className={styles.voicePulse} />
            <p>듣고 있어요...</p>
          </div>
        )}

        {/* Settings Link */}
        <div className={styles.settingsLink}>
          <Link href="/run/settings">리포팅 설정</Link>
        </div>
      </main>
    </>
  );
}
