import type { Metadata } from 'next';
import { getCrew } from '@/lib/data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const crew = await getCrew(id);

  if (!crew) {
    return { title: '모임을 찾을 수 없습니다 | With Running' };
  }

  return {
    title: `${crew.title} | With Running`,
    description: crew.description || `${crew.title} - ${crew.date} ${crew.time} ${crew.location}`,
    openGraph: {
      title: `${crew.title} | With Running`,
      description: crew.description || `${crew.distance}km 러닝 모임`,
    },
  };
}

export default function CrewDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
