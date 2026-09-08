import { Suspense } from 'react';
import ConsultationFlow from '@/components/organisms/consultations/ConsultationFlow';
import FeaturedProducts from '../../../components/organisms/FeaturedProducts';
import { buildMetadata } from '@/lib/seo';
import { CONSULTATION_SEO } from '@/constants/seoContent';

// Static copy — see constants/seoContent.js.
export const metadata = buildMetadata({
  title: CONSULTATION_SEO.title,
  description: CONSULTATION_SEO.description,
  keywords: CONSULTATION_SEO.keywords,
  path: '/consultation',
});

export default function ConsultationPage() {
  return (
    <div className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-text">Start Your Personalized Consultation</h1>
        <p className="text-text-muted text-lg mt-3 max-w-2xl mx-auto">
          Get a custom diet and supplement plan tailored to your goals – guided by our expert nutritionists.
        </p>
      </div>
      <Suspense fallback={null}>
        <ConsultationFlow />
      </Suspense>
      <div className="mt-20">
        <FeaturedProducts />
      </div>
    </div>
  );
}
