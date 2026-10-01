import { buildMetadata } from '@/lib/seo';
import { ACADEMY_SEO } from '@/constants/seoContent';

// The academy page is a client component, so its metadata lives here.
// Static copy — see constants/seoContent.js. Course detail pages override
// this with their own generateMetadata.
export const metadata = buildMetadata({
  title: ACADEMY_SEO.title,
  description: ACADEMY_SEO.description,
  keywords: ACADEMY_SEO.keywords,
  path: '/academy',
});

export default function AcademyLayout({ children }) {
  return children;
}
