import LegalContent from '@/sections/legal/LegalContent';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { TERMS_SEO } from '@/constants/seoContent';
import { TERMS_SECTIONS } from '@/constants/legalContent';

export const metadata = buildMetadata({
  title: TERMS_SEO.title,
  description: TERMS_SEO.description,
  keywords: TERMS_SEO.keywords,
  path: '/terms',
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', href: '/' },
          { name: 'Terms & Conditions', href: '/terms' },
        ])}
      />
      <LegalContent
        title="Terms & Conditions"
        intro="A plain-language summary of the terms that govern your use of Fitoo."
        sections={TERMS_SECTIONS}
      />
    </>
  );
}
