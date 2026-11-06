import TrackOrderContent from '@/sections/track-order/TrackOrderContent';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { TRACK_ORDER_SEO } from '@/constants/seoContent';

export const metadata = buildMetadata({
  title: TRACK_ORDER_SEO.title,
  description: TRACK_ORDER_SEO.description,
  keywords: TRACK_ORDER_SEO.keywords,
  path: '/track-order',
});

export default function TrackOrderPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', href: '/' },
          { name: 'Track Order', href: '/track-order' },
        ])}
      />
      <TrackOrderContent />
    </>
  );
}
