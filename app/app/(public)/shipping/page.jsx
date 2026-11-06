import Icon from '@/components/atoms/Icon';
import { H2, H4, Text } from '@/components/atoms/Typography';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { SHIPPING_SEO } from '@/constants/seoContent';

export const metadata = buildMetadata({
  title: SHIPPING_SEO.title,
  description: SHIPPING_SEO.description,
  keywords: SHIPPING_SEO.keywords,
  path: '/shipping',
});

const DELIVERY_TIMES = [
  { area: 'Karachi, Lahore, Islamabad', time: '2-4 business days' },
  { area: 'Other major cities', time: '3-5 business days' },
  { area: 'Remote / rural areas', time: '5-7 business days' },
];

const SHIPPING_STEPS = [
  {
    icon: 'check',
    title: 'Order processed',
    description: 'Orders placed before 4 PM are processed the same business day.',
  },
  {
    icon: 'package',
    title: 'Packed & handed to courier',
    description: 'You\'ll get a notification once your order ships with your tracking details.',
  },
  {
    icon: 'truck',
    title: 'Out for delivery',
    description: 'Use the Track Order page any time with your order ID and phone number.',
  },
  {
    icon: 'check-circle',
    title: 'Delivered',
    description: 'Cash on delivery or prepaid — either way, inspect your order on arrival.',
  },
];

export default function ShippingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', href: '/' },
          { name: 'Shipping Info', href: '/shipping' },
        ])}
      />

      <div className="pt-24 pb-20 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <H2>Shipping Information</H2>
            <Text muted className="mt-3 max-w-xl mx-auto">
              How we get your order from our warehouse to your door.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {SHIPPING_STEPS.map((step) => (
              <div
                key={step.title}
                className="flex items-start gap-3 rounded-2xl border border-border-light bg-surface p-5"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
                  <Icon name={step.icon} className="w-5 h-5" />
                </span>
                <div>
                  <H4 className="text-base mb-1">{step.title}</H4>
                  <Text muted className="text-sm">
                    {step.description}
                  </Text>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border-light bg-surface p-6 mb-8">
            <H4 className="mb-4">Estimated Delivery Times</H4>
            <div className="flex flex-col divide-y divide-border-light">
              {DELIVERY_TIMES.map((row) => (
                <div key={row.area} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-text-secondary">{row.area}</span>
                  <span className="text-text font-medium">{row.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border-light bg-surface p-6">
            <H4 className="mb-3">Shipping Costs</H4>
            <Text muted className="text-sm leading-relaxed">
              Shipping cost is calculated at checkout based on your delivery location and order
              size, and is shown before you confirm your order. We occasionally run promotions
              that waive shipping on qualifying orders — check the banner at checkout.
            </Text>
          </div>

          <Text muted className="text-sm text-center mt-10">
            Questions about a specific order? Visit{' '}
            <a href="/track-order" className="text-primary hover:text-primary-hover">
              Track Order
            </a>{' '}
            or see our{' '}
            <a href="/contact" className="text-primary hover:text-primary-hover">
              Contact page
            </a>
            .
          </Text>
        </div>
      </div>
    </>
  );
}
