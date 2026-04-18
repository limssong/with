'use client';

import { useState } from 'react';
import Header from '@/components/common/Header';
import styles from './page.module.scss';

interface ReportSetting {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const reportSettings: ReportSetting[] = [
  {
    key: 'autoDetect',
    label: '자동 감지',
    description: 'GPS 고도 + 가속도 센서로 오르막/내리막/정지 구간 자동 태깅',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'voice',
    label: '음성 리포트',
    description: '"위드, 음수대" 같은 짧은 음성 명령으로 핸즈프리 리포팅',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'quickTap',
    label: '원탭 퀵 리포트',
    description: '플로팅 버튼 → 태그 선택, 2탭이면 리포팅 완료',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'watch',
    label: '스마트워치 연동',
    description: '워치 화면에서 퀵 태그 버튼 탭으로 기록 — 폰 꺼낼 필요 없음',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="2" width="12" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 10V12L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function RunSettingsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    autoDetect: true,
    voice: true,
    quickTap: true,
    watch: true,
  });

  const toggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Header title="리포팅 설정" showBack />
      <main className="page-content">
        <p className={styles.description}>
          러닝 중 코스 정보를 기록하는 4가지 방식을 각각 켜고 끌 수 있어요.
          기본값은 모두 ON입니다.
        </p>

        <div className={styles.settingsList}>
          {reportSettings.map((item) => (
            <div key={item.key} className={styles.settingItem}>
              <div className={styles.settingIcon}>{item.icon}</div>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>{item.label}</span>
                <span className={styles.settingDesc}>{item.description}</span>
              </div>
              <button
                className={`${styles.toggle} ${settings[item.key] ? styles.on : ''}`}
                onClick={() => toggle(item.key)}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.note}>
          <p>리포팅 데이터는 AI 코스 미리보기의 원천 데이터로 활용됩니다.</p>
          <p>여러 러너의 리포트가 누적될수록 코스 정보의 정확도가 높아집니다.</p>
        </div>
      </main>
    </>
  );
}
