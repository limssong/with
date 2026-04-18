'use client';

import styles from './ElevationChart.module.scss';

interface ElevationChartProps {
  distance: number; // km
  elevation: number; // max elevation in m
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function ElevationChart({ distance, elevation, difficulty }: ElevationChartProps) {
  // Deterministic pseudo-random noise based on index (avoids hydration mismatch)
  const noise = (i: number, scale: number) => Math.sin(i * 12.9898 + 78.233) * 43758.5453 % 1 * scale;

  const points = 20;
  const baseElevation = 20;
  const elevationData: number[] = [];

  for (let i = 0; i <= points; i++) {
    const t = i / points;
    let elev: number;
    if (difficulty === 'easy') {
      elev = baseElevation + Math.sin(t * Math.PI) * elevation * 0.3 + noise(i, 5);
    } else if (difficulty === 'medium') {
      elev = baseElevation + Math.sin(t * Math.PI * 1.5) * elevation * 0.5 + Math.sin(t * Math.PI * 3) * elevation * 0.15;
    } else {
      elev = baseElevation + (t < 0.4 ? t * 2.5 * elevation : (1 - t) * 1.67 * elevation) + noise(i, 10);
    }
    elevationData.push(Math.max(0, elev));
  }

  const maxElev = Math.max(...elevationData);
  const minElev = Math.min(...elevationData);
  const range = maxElev - minElev || 1;

  // Build SVG path
  const width = 300;
  const height = 80;
  const padding = { top: 5, bottom: 5, left: 0, right: 0 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const pathPoints = elevationData.map((elev, i) => {
    const x = padding.left + (i / points) * chartW;
    const y = padding.top + chartH - ((elev - minElev) / range) * chartH;
    return `${x},${y}`;
  });

  const linePath = `M${pathPoints.join(' L')}`;
  const areaPath = `${linePath} L${padding.left + chartW},${padding.top + chartH} L${padding.left},${padding.top + chartH} Z`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>고도 프로필</span>
        <span className={styles.stats}>
          {Math.round(minElev)}m ~ {Math.round(maxElev)}m · 총 {elevation}m 상승
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.chart} preserveAspectRatio="none">
        <defs>
          <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FCFF74" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FCFF74" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#elevGrad)" />
        <path d={linePath} fill="none" stroke="#FCFF74" strokeWidth="2" />
      </svg>
      <div className={styles.xAxis}>
        <span>0 km</span>
        <span>{(distance / 2).toFixed(1)} km</span>
        <span>{distance} km</span>
      </div>
    </div>
  );
}
