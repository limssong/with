'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface CourseRoute {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number }[];
  color?: string;
}

interface MapboxMapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  courses?: CourseRoute[];
  selectedCourseId?: string | null;
  onCourseClick?: (id: string) => void;
  className?: string;
  showUserLocation?: boolean;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapboxMap({
  center = [126.978, 37.5665], // 서울 시청
  zoom = 12,
  courses = [],
  selectedCourseId,
  onCourseClick,
  className,
  showUserLocation = true,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom,
    });

    const m = map.current;

    if (showUserLocation) {
      m.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'bottom-right'
      );
    }

    m.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    m.on('load', () => setMapLoaded(true));

    return () => m.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync courses and selection to the map
  useEffect(() => {
    const m = map.current;
    if (!m || !mapLoaded) return;

    courses.forEach((course) => {
      const sourceId = `course-${course.id}`;
      const layerId = `course-line-${course.id}`;
      const isSelected = course.id === selectedCourseId;
      const coords = course.coordinates.map((c) => [c.lng, c.lat] as [number, number]);

      // Add source/layer if missing
      if (!m.getSource(sourceId)) {
        m.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { id: course.id, name: course.name },
            geometry: { type: 'LineString', coordinates: coords },
          },
        });
        m.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': isSelected ? '#FCFF74' : (course.color || '#FCFF74'),
            'line-width': isSelected ? 5 : 3,
            'line-opacity': isSelected ? 1 : 0.5,
          },
        });

        if (coords.length > 0) {
          const el = document.createElement('div');
          el.style.cssText = 'width:12px;height:12px;border-radius:50%;background:#FCFF74;border:2px solid #fff;cursor:pointer;';
          const marker = new mapboxgl.Marker(el).setLngLat(coords[0]).addTo(m);
          if (onCourseClick) {
            el.addEventListener('click', () => onCourseClick(course.id));
          }
          const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
            .setHTML(`<div style="color:#000;font-size:12px;font-weight:600;">${course.name}</div>`);
          marker.setPopup(popup);
        }
      }

      // Update styling
      try {
        m.setPaintProperty(layerId, 'line-width', isSelected ? 5 : 3);
        m.setPaintProperty(layerId, 'line-opacity', isSelected ? 1 : 0.5);
      } catch {
        // layer not yet ready
      }
    });

    if (selectedCourseId) {
      const selected = courses.find((c) => c.id === selectedCourseId);
      if (selected?.coordinates.length) {
        const bounds = new mapboxgl.LngLatBounds();
        selected.coordinates.forEach((c) => bounds.extend([c.lng, c.lat]));
        m.fitBounds(bounds, { padding: 60, duration: 800 });
      }
    }
  }, [selectedCourseId, courses, onCourseClick, mapLoaded]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#181818', color: '#8a8a8a', fontSize: '14px', gap: '8px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.03 7.03 1 12 1C16.97 1 21 5.03 21 10Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
        <span>Mapbox 토큰을 .env.local에 설정해주세요</span>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} style={{ width: '100%', height: '100%' }} />;
}
