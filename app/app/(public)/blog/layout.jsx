import { buildMetadata } from '@/lib/seo';
import { BLOG_SEO } from '@/constants/seoContent';

// The blog listing page is a client component, so its metadata lives here.
// Individual posts set their own metadata in blog/[slug]. Static copy — see
// constants/seoContent.js.
export const metadata = buildMetadata({
  title: BLOG_SEO.title,
  description: BLOG_SEO.description,
  keywords: BLOG_SEO.keywords,
  path: '/blog',
});

export default function BlogLayout({ children }) {
  return children;
}
