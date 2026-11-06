import { buildMetadata } from '@/lib/seo';
import { CONTACT_SEO } from '@/constants/seoContent';

// The contact page is a client component, so its metadata lives here.
// Static copy — see constants/seoContent.js.
export const metadata = buildMetadata({
  title: CONTACT_SEO.title,
  description: CONTACT_SEO.description,
  keywords: CONTACT_SEO.keywords,
  path: '/contact',
});

export default function ContactLayout({ children }) {
  return children;
}
