import type { Metadata, Viewport } from 'next';
import '@/styles/globals.scss';
import ServiceWorkerRegister from '@/components/common/ServiceWorkerRegister';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://withrunning.com'),
  title: {
    default: 'With Running - 함께 달리는 즐거움 | 러닝 메이트 매칭',
    template: '%s | With Running',
  },
  description: '러닝 메이트를 찾고, 코스를 공유하고, 크루와 함께 달리세요. AI가 나에게 맞는 러닝 파트너와 코스를 추천해드립니다. 서울 러닝 크루 모집, 러닝 코스 리뷰.',
  keywords: ['러닝', '러닝 메이트', '러닝 크루', '러닝 코스', '달리기', '조깅', '러닝 모임', '함께 달리기', 'AI 러닝 추천', '서울 러닝'],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'With Running',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'With Running',
    title: 'With Running - 함께 달리는 즐거움',
    description: '러닝 메이트를 찾고, 코스를 공유하고, 크루와 함께 달리세요. AI가 나에게 맞는 러닝 파트너와 코스를 추천해드립니다.',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'With Running' }],
  },
  twitter: {
    card: 'summary',
    title: 'With Running - 함께 달리는 즐거움',
    description: '러닝 메이트를 찾고, 코스를 공유하고, 크루와 함께 달리세요.',
    images: ['/icons/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#121212',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <a href="#main-content" className="skip-link">본문으로 이동</a>
        <div className="app-container">
          {children}
        </div>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
