import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import Footer from '~/components/Footer';
import PageViewTracker from '~/app/_components/PageViewTracker';
import { GA_TRACKING_ID, existsGaId } from '~/lib/ga/ga';
import '~/styles/_app/destyle.css';
import '~/styles/_app/globals.scss';

const SITE_URL = process.env.NEXT_PUBLIC_LOCATION || 'https://shunbiboroku.com';
const SITE_NAME = 'Shun Bibo Roku';
const DEFAULT_DESCRIPTION =
  'UI/UXデザインから、フロントエンド、時にバックエンドなど、個人開発に役立つ些細な気づきを記事として残していきます。本ブログのソースコードも公開中。';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: '%s | ' + SITE_NAME },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/favicons/icon-192x192.png', sizes: '192x192' }],
    apple: [{ url: '/favicons/apple-touch-icon-180x180.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    title: 'myapp',
    statusBarStyle: 'default',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: ['/img/icon.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@DVq0Hp0iU6itt4N',
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: ['/img/icon.jpeg'],
  },
  other: {
    'msapplication-square70x70logo': '/favicons/site-tile-70x70.png',
    'msapplication-square150x150logo': '/favicons/site-tile-150x150.png',
    'msapplication-wide310x150logo': '/favicons/site-tile-310x150.png',
    'msapplication-square310x310logo': '/favicons/site-tile-310x310.png',
    'msapplication-TileColor': '#eff1f4',
  },
};

export const viewport: Viewport = {
  themeColor: '#eff1f4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat&family=Roboto&display=swap"
          rel="stylesheet"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4145338195858150"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {existsGaId && (
          <>
            <Script
              src={'https://www.googletagmanager.com/gtag/js?id=' + GA_TRACKING_ID}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname });
              `}
            </Script>
            <Suspense fallback={null}>
              <PageViewTracker />
            </Suspense>
          </>
        )}
        {children}
        <Footer />
      </body>
    </html>
  );
}
