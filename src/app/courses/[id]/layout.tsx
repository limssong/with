import type { Metadata } from 'next';
import { getCourse } from '@/lib/data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    return { title: '코스를 찾을 수 없습니다 | With Running' };
  }

  return {
    title: `${course.name} | With Running`,
    description: course.description || `${course.name} - ${course.distance}km ${course.difficulty} 코스`,
    openGraph: {
      title: `${course.name} | With Running`,
      description: course.description || `${course.distance}km ${course.difficulty} 러닝 코스`,
    },
  };
}

export default function CourseDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
