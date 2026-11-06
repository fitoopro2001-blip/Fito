import LegalContent from '@/sections/legal/LegalContent';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { PRIVACY_SEO } from '@/constants/seoContent';
import { PRIVACY_SECTIONS } from '@/constants/legalContent';

export const metadata = buildMetadata({
  title: PRIVACY_SEO.title,
  description: PRIVACY_SEO.description,
  keywords: PRIVACY_SEO.keywords,
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', href: '/' },
          { name: 'Privacy Policy', href: '/privacy' },
        ])}
      />
      <LegalContent
        title="Privacy Policy"
        intro="A plain-language summary of how Fitoo collects, uses, and protects your information."
        sections={PRIVACY_SECTIONS}
      />
    </>
  );
}
