import { buildMetadata } from '@/lib/seo';
import { SHOP_SEO } from '@/constants/seoContent';

// The shop page itself is a client component, so its metadata lives here.
// Static copy — see constants/seoContent.js.
export const metadata = buildMetadata({
  title: SHOP_SEO.title,
  description: SHOP_SEO.description,
  keywords: SHOP_SEO.keywords,
  path: '/shop',
});

export default function ShopLayout({ children }) {
  return children;
}
