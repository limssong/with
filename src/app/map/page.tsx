'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import Tag from '@/components/common/Tag';
import MapboxMap from '@/components/map/MapboxMap';
import { getCourses } from '@/lib/data';
import type { Course } from '@/data/courses';
import styles from './page.module.scss';

export default function MapPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  const selected = courses.find((c) => c.id === selectedCourse);

  return (
    <>
      <Header />
      <main className={styles.mapPage}>
        {/* Map Area */}
        <div className={styles.mapArea}>
          <MapboxMap
            courses={courses.map((c) => ({
              id: c.id,
              name: c.name,
              coordinates: c.coordinates,
            }))}
            selectedCourseId={selectedCourse}
            onCourseClick={(id) => setSelectedCourse(id === selectedCourse ? null : id)}
            className={styles.mapContainer}
          />
        </div>

        {/* Course List Overlay */}
        <div className={styles.overlay}>
          <div className={styles.handle} />
          <h3 className={styles.overlayTitle}>근처 러닝 코스</h3>
          <div className={styles.courseList}>
            {courses.map((course) => (
              <button
                key={course.id}
                className={`${styles.courseItem} ${selectedCourse === course.id ? styles.selected : ''}`}
                onClick={() => setSelectedCourse(course.id === selectedCourse ? null : course.id)}
              >
                <div className={styles.courseInfo}>
                  <span className={styles.courseName}>{course.name}</span>
                  <span className={styles.courseMeta}>{course.distance}km · {course.region}</span>
                </div>
                <div className={styles.courseRating}>★ {course.rating}</div>
              </button>
            ))}
          </div>

          {/* Selected Course Detail */}
          {selected && (
            <div className={styles.selectedDetail}>
              <h4 className={styles.selectedName}>{selected.name}</h4>
              <p className={styles.selectedDesc}>{selected.description}</p>
              <div className={styles.selectedTags}>
                {selected.tags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
