import { supabase } from './supabase';
import type { Course } from '@/data/courses';
import type { Crew } from '@/data/crews';

// DB row 타입
interface CourseRow {
  id: string;
  name: string;
  description: string | null;
  distance: number | string;
  difficulty: 'easy' | 'medium' | 'hard';
  elevation: number | null;
  location: string | null;
  region: string | null;
  image_url: string | null;
  rating: number;
  review_count: number;
  coordinates: { lat: number; lng: number }[];
  tags: string[];
  created_by: string;
}

interface CrewRow {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  course?: { name: string } | null;
  host?: { name: string; avatar_url: string | null } | null;
  date: string;
  time: string;
  pace: string | null;
  distance: number | string;
  max_members: number;
  member_count: number;
  location: string | null;
  region: string | null;
  tags: string[];
  status: 'upcoming' | 'full' | 'completed' | 'cancelled' | null;
  is_recurring: boolean;
  recurring_day: string | null;
}

// DB row → 프론트엔드 타입 변환
function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    distance: Number(row.distance),
    difficulty: row.difficulty,
    elevation: row.elevation || 0,
    location: row.location || '',
    region: row.region || '',
    imageUrl: row.image_url || '',
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count || 0,
    coordinates: row.coordinates || [],
    tags: row.tags || [],
    createdBy: row.created_by || '',
  };
}

function toCrew(row: CrewRow): Crew {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    courseId: row.course_id || '',
    courseName: row.course?.name || '',
    hostName: row.host?.name || '익명',
    hostImage: row.host?.avatar_url || '',
    date: row.date,
    time: row.time,
    pace: row.pace || '',
    distance: Number(row.distance) || 0,
    maxMembers: row.max_members || 8,
    currentMembers: row.member_count || 0,
    members: [],
    location: row.location || '',
    region: row.region || '',
    tags: row.tags || [],
    status: row.status || 'upcoming',
    isRecurring: row.is_recurring || false,
    recurringDay: row.recurring_day ?? undefined,
  };
}

// 코스 목록
export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(toCourse);
}

// 코스 상세
export async function getCourse(id: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return toCourse(data);
}

// 모임 목록
export async function getCrews(): Promise<Crew[]> {
  const { data, error } = await supabase
    .from('crews')
    .select(`
      *,
      course:courses(name),
      host:profiles(name, avatar_url)
    `)
    .order('date', { ascending: true });

  if (error || !data) return [];
  return data.map((row) => toCrew({
    ...row,
    course: row.course,
    host: row.host,
  }));
}

// 모임 상세
export async function getCrew(id: string): Promise<Crew | null> {
  const { data, error } = await supabase
    .from('crews')
    .select(`
      *,
      course:courses(name, coordinates),
      host:profiles(name, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return toCrew(data);
}

// 코스별 모임
export async function getCrewsByCourse(courseId: string): Promise<Crew[]> {
  const { data, error } = await supabase
    .from('crews')
    .select(`
      *,
      course:courses(name),
      host:profiles(name, avatar_url)
    `)
    .eq('course_id', courseId);

  if (error || !data) return [];
  return data.map((row) => toCrew({ ...row, course: row.course, host: row.host }));
}
