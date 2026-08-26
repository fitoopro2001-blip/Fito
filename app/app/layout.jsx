import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import MainLayout from '@/components/layouts/MainLayout';
import JsonLd from '@/components/shared/JsonLd';
import { organizationJsonLd } from '@/lib/jsonld';
import { buildMetadata } from '@/lib/seo';
import { SITE_NAME } from '@/config/siteConfig';
import { CountryProvider } from '@/context/CountryContext';
import { getServerCountry } from '@/utils/serverCountry';

// The theme already declared --font-geist-sans/--font-geist-mono but nothing
// ever defined them, so body fell back to Arial. next/font self-hosts the
// files, emits a preload, and sets `font-display: swap`, so there's no
// render-blocking network request and no layout shift when the font lands.
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

// Uploads are served from the API origin, so warm up the connection during
// HTML parse rather than paying DNS + TCP + TLS when the first image is hit.
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(
  /\/api\/?$/,
  ''
);

// Page-level metadata merges over this; `template` keeps the brand suffix
// consistent for pages that only set their own title.
export const metadata = {
  ...buildMetadata({ title: SITE_NAME }),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
};

export default async function RootLayout({ children }) {
  const { country } = await getServerCountry();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href={API_ORIGIN} />
        <link rel="dns-prefetch" href={API_ORIGIN} />
      </head>
      <body>
        <JsonLd data={organizationJsonLd()} />
        <CountryProvider initialCountry={country}>
          <MainLayout>{children}</MainLayout>
        </CountryProvider>
      </body>
    </html>
  );
}
