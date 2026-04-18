import type { MetadataRoute } from 'next';
import { getCourses, getCrews } from '@/lib/data';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://withrunning.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/courses`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/crews`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/map`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/ai-demo`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const [courses, crews] = await Promise.all([
    getCourses().catch(() => []),
    getCrews().catch(() => []),
  ]);

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${BASE_URL}/courses/${c.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const crewRoutes: MetadataRoute.Sitemap = crews.map((c) => ({
    url: `${BASE_URL}/crews/${c.id}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticRoutes, ...courseRoutes, ...crewRoutes];
}
