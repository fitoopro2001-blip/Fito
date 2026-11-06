import FaqContent from '@/sections/faq/FaqContent';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { faqPageJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import { FAQ_SEO } from '@/constants/seoContent';
import { FAQ_CATEGORIES } from '@/constants/faqContent';

// Static copy — see constants/seoContent.js and constants/faqContent.js.
export const metadata = buildMetadata({
  title: FAQ_SEO.title,
  description: FAQ_SEO.description,
  keywords: FAQ_SEO.keywords,
  path: '/faq',
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          faqPageJsonLd(FAQ_CATEGORIES),
          breadcrumbJsonLd([
            { name: 'Home', href: '/' },
            { name: 'FAQ', href: '/faq' },
          ]),
        ]}
      />
      <FaqContent />
    </>
  );
}
