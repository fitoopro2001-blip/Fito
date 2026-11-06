import ProgramsContent from '@/sections/programs/ProgramsContent';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, programsJsonLd } from '@/lib/jsonld';
import { PROGRAMS_SEO } from '@/constants/seoContent';

export const metadata = buildMetadata({
  title: PROGRAMS_SEO.title,
  description: PROGRAMS_SEO.description,
  keywords: PROGRAMS_SEO.keywords,
  path: '/programs',
});

export default function ProgramsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', href: '/' },
            { name: 'Programs', href: '/programs' },
          ]),
          programsJsonLd(),
        ]}
      />
      <ProgramsContent />
    </>
  );
}
