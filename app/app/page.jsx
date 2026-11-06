import Hero from '@/sections/home/Hero';
import Certificates from '@/components/organisms/Certificates';
import GoalsSection from '@/sections/home/GoalsSection';
import FeaturedProducts from '@/components/organisms/FeaturedProducts';
import WhyChooseFitoo from '@/sections/home/WhyChooseFitoo';
import ConsultationCTA from '@/sections/home/ConsultationCTA';
import MeetYourCoaches from '@/sections/home/MeetYourCoaches';
import TransformationStories from '@/sections/home/TransformationStories';
import LatestArticles from '@/sections/home/LatestArticles';
import NewsLetterCTA from '@/sections/home/NewsLetter';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { homeJsonLd } from '@/lib/jsonld';
import { HOME_SEO } from '@/constants/seoContent';

// Static copy, unlike products and blogs which generate theirs on save.
export const metadata = buildMetadata({
  title: HOME_SEO.title,
  description: HOME_SEO.description,
  keywords: HOME_SEO.keywords,
  path: '/',
});

// Navbar deliberately not rendered here — MainLayout already provides it for
// every non-auth route. This page was mounting a second one on top of it,
// which meant two fixed headers, two cart subscriptions, and two scroll
// listeners stacked at z-50.
export default function HomePage() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <Hero />
      <Certificates />
      <GoalsSection />
      <FeaturedProducts />
      <WhyChooseFitoo />
      <ConsultationCTA />
      <MeetYourCoaches />
      <TransformationStories />
      <LatestArticles />
      <NewsLetterCTA />
    </>
  );
}
