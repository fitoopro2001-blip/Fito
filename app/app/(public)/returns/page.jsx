import Icon from '@/components/atoms/Icon';
import { H2, H4, Text } from '@/components/atoms/Typography';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { RETURNS_SEO } from '@/constants/seoContent';
import { CONTACT_EMAIL, WHATSAPP_DISPLAY } from '@/utils/siteConfig';

export const metadata = buildMetadata({
  title: RETURNS_SEO.title,
  description: RETURNS_SEO.description,
  keywords: RETURNS_SEO.keywords,
  path: '/returns',
});

const ELIGIBLE = [
  'Item arrived damaged, defective, or incorrect',
  'Unopened product with an intact seal, within 7 days of delivery',
  'Wrong size, flavor, or variant shipped by mistake',
];

const NOT_ELIGIBLE = [
  'Opened or used supplements, unless the item itself was faulty',
  'Requests made more than 7 days after delivery',
  'Products without their original packaging',
];

export default function ReturnsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', href: '/' },
          { name: 'Returns', href: '/returns' },
        ])}
      />

      <div className="pt-24 pb-20 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <H2>Returns & Refunds</H2>
            <Text muted className="mt-3 max-w-xl mx-auto">
              Not quite right? Here&apos;s how returns, exchanges and refunds work.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl border border-border-light bg-surface p-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="check-circle" className="w-5 h-5 text-primary" />
                <H4 className="text-base">Eligible for return</H4>
              </div>
              <ul className="space-y-2">
                {ELIGIBLE.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Icon name="check" className="w-3.5 h-3.5 text-primary mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border-light bg-surface p-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="close" className="w-5 h-5 text-text-muted" />
                <H4 className="text-base">Not eligible</H4>
              </div>
              <ul className="space-y-2">
                {NOT_ELIGIBLE.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Icon name="close" className="w-3.5 h-3.5 text-text-muted mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-border-light bg-surface p-6 mb-8">
            <H4 className="mb-4">How to request a return</H4>
            <ol className="space-y-3">
              {[
                `Email ${CONTACT_EMAIL} or WhatsApp us at ${WHATSAPP_DISPLAY} with your order ID and reason for the return.`,
                'Our team confirms eligibility and shares pickup or drop-off instructions.',
                'Once we receive and inspect the item, your refund or exchange is processed.',
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-border-light bg-surface p-6">
            <H4 className="mb-3">Refund timeline</H4>
            <Text muted className="text-sm leading-relaxed">
              Refunds are issued to your original payment method within 5-7 business days of us
              receiving and inspecting the returned item. Cash-on-delivery orders are refunded via
              bank transfer.
            </Text>
          </div>

          <Text muted className="text-sm text-center mt-10">
            Need shipping details instead?{' '}
            <a href="/shipping" className="text-primary hover:text-primary-hover">
              Shipping Info
            </a>
          </Text>
        </div>
      </div>
    </>
  );
}
