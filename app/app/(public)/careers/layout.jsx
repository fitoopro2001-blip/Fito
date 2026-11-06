import { buildMetadata } from '@/lib/seo';
import { CAREERS_SEO } from '@/constants/seoContent';

// The careers page is a client component, so its metadata lives here.
// Static copy — see constants/seoContent.js.
export const metadata = buildMetadata({
  title: CAREERS_SEO.title,
  description: CAREERS_SEO.description,
  keywords: CAREERS_SEO.keywords,
  path: '/careers',
});

export default function CareersLayout({ children }) {
  return children;
}
