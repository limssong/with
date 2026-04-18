'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './KakaoSearch.module.scss';

interface SearchResult {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name?: string;
  x: string;
  y: string;
}

interface KakaoSearchProps {
  placeholder?: string;
  inputId?: string;
  onSelect?: (result: { name: string; address: string; lat: number; lng: number }) => void;
}

export default function KakaoSearch({ placeholder = '장소를 검색하세요', inputId, onSelect }: KakaoSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = async (keyword: string) => {
    if (!keyword.trim()) return;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setResults(data.documents || []);
      setShowResults(true);
    } catch {
      setResults([]);
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(value), 300);
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.place_name);
    setShowResults(false);
    onSelect?.({
      name: result.place_name,
      address: result.road_address_name || result.address_name,
      lat: Number(result.y),
      lng: Number(result.x),
    });
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={styles.searchIcon}>
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          id={inputId}
          className={styles.input}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </div>
      {showResults && results.length > 0 && (
        <ul className={styles.results}>
          {results.map((r) => (
            <li key={r.id} className={styles.resultItem} onMouseDown={() => handleSelect(r)}>
              <span className={styles.resultName}>{r.place_name}</span>
              <span className={styles.resultAddr}>{r.road_address_name || r.address_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
