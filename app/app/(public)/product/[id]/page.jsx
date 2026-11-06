import ProductTemplate from '@/components/templates/ProductTemplate';
import JsonLd from '@/components/shared/JsonLd';
import NotAvailableNotice from '@/components/molecules/NotAvailableNotice';
import { getProductForSeo } from '@/services/seo.server';
import { buildProductMetadata } from '@/lib/seo';
import { productJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import formatCategory from '@/utils/formatCategory';
import { getServerCountry } from '@/utils/serverCountry';

// Metadata comes straight from the SEO block the backend generates when the
// admin saves a product, so nothing here needs to be maintained per product.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductForSeo(id);
  return buildProductMetadata(product);
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const { productsAvailable } = await getServerCountry();

  if (!productsAvailable) {
    return <NotAvailableNotice />;
  }

  // Same request as generateMetadata, deduped by fetch caching. Passing it down
  // means the markup crawlers see already contains the product content.
  const product = await getProductForSeo(id);

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product),
          product &&
          breadcrumbJsonLd([
            { name: 'Home', href: '/' },
            { name: 'Shop', href: '/shop' },
            {
              name: formatCategory(product.category),
              href: `/shop?category=${encodeURIComponent(product.category)}`,
            },
            { name: product.name, href: `/product/${product.slug || product.id}` },
          ]),
        ].filter(Boolean)}
      />
      <ProductTemplate id={id} initialProduct={product} />
    </>
  );
}
