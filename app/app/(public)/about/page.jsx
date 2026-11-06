import AboutContent from '@/sections/about/AboutContent';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { aboutPageJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import { ABOUT_SEO } from '@/constants/seoContent';
import { TEAM_MEMBERS } from '@/constants/aboutContent';

// Static copy — see constants/seoContent.js.
export const metadata = buildMetadata({
  title: ABOUT_SEO.title,
  description: ABOUT_SEO.description,
  keywords: ABOUT_SEO.keywords,
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          aboutPageJsonLd({ description: ABOUT_SEO.description, teamMembers: TEAM_MEMBERS }),
          breadcrumbJsonLd([
            { name: 'Home', href: '/' },
            { name: 'About', href: '/about' },
          ]),
        ]}
      />
      <AboutContent />
    </>
  );
}
