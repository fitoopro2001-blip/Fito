// schema.org payloads. Rich results (price, stock, star rating) only show up if
// the Product/Offer/AggregateRating shape is valid, so keep these in sync with
// https://developers.google.com/search/docs/appearance/structured-data/product
import { SITE_NAME, SITE_URL, CURRENCY, DEFAULT_OG_IMAGE, absoluteUrl } from '@/config/siteConfig';
import imageUrl from '@/utils/imageUrl';
import stripHtml from '@/utils/stripHtml';

const AVAILABILITY = {
  inStock: 'https://schema.org/InStock',
  outOfStock: 'https://schema.org/OutOfStock',
  preOrder: 'https://schema.org/PreOrder',
};

export const productJsonLd = (product) => {
  if (!product) return null;

  const url = absoluteUrl(`/product/${product.slug || product.id}`);
  const images = (product.images?.length ? product.images : [product.image])
    .filter(Boolean)
    .map(imageUrl);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seo?.metaDescription || stripHtml(product.description),
    image: images,
    sku: String(product.id),
    category: product.category,
    brand: { '@type': 'Brand', name: SITE_NAME },
    url,
    offers: {
      '@type': 'Offer',
      url,
      price: Number(product.price ?? 0).toFixed(2),
      priceCurrency: CURRENCY,
      availability:
        product.status === 'coming_soon'
          ? AVAILABILITY.preOrder
          : product.stock > 0
            ? AVAILABILITY.inStock
            : AVAILABILITY.outOfStock,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };

  // Google rejects an AggregateRating with zero reviews, so only attach it once
  // real reviews exist.
  const reviewCount = Number(product.reviewCount ?? product.reviews ?? 0);
  if (reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating ?? 0).toFixed(1),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return jsonLd;
};

export const articleJsonLd = (post) => {
  if (!post) return null;

  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: [post.image].filter(Boolean).map(imageUrl),
    articleSection: post.category,
    keywords: (post.seo?.keywords ?? []).join(', ') || undefined,
    wordCount: post.seo?.wordCount || undefined,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
    // Required by Google so the article can't be attributed to the wrong page.
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
};

export const breadcrumbJsonLd = (trail = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.href ?? '/'),
  })),
});

// `categories` is FAQ_CATEGORIES from constants/faqContent.js — flattened
// since FAQPage expects a single mainEntity list, not grouped sections.
export const faqPageJsonLd = (categories = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: categories.flatMap((group) =>
    group.questions.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: { '@type': 'Answer', text: qa.answer },
    }))
  ),
});

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
});

// Declares the site's search endpoint so Google can offer a sitelinks
// searchbox. The URL template has to match the shop page's query param.
export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

// Homepage graph: Organization + WebSite + founder Persons, cross-linked by
// @id so Google resolves "who publishes this site" and "who founded it" as
// the same entities referenced elsewhere (e.g. AboutPage's mainEntity).
export const homeJsonLd = () => {
  const orgId = absoluteUrl('/#organization');
  const umerId = absoluteUrl('/#umer-shabbir');
  const basitId = absoluteUrl('/#abdul-basit-khan');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: SITE_NAME,
        url: absoluteUrl('/'),
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.fitoo.pro/_next/static/media/fitoo-logo.10mhihfns0xdb.svg',
        },
        description:
          'Certified nutrition coaching and third-party lab-tested supplements, built by one team. Personalized plans for fat loss, muscle gain, PCOS and performance.',
        sameAs: [
          'https://www.facebook.com/share/1B2UCHJ3cB/',
          'https://www.instagram.com/fitoo.pro',
        ],
        founder: [{ '@id': umerId }, { '@id': basitId }],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            telephone: '+92-324-1461893',
            areaServed: 'PK',
          },
          {
            '@type': 'ContactPoint',
            contactType: 'sales',
            telephone: '+92-309-1442268',
            areaServed: 'PK',
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        url: absoluteUrl('/'),
        name: SITE_NAME,
        publisher: { '@id': orgId },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/shop?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Person',
        '@id': umerId,
        name: 'Umer Shabbir',
        jobTitle: 'Founder | Clinical Dietitian & UK-Certified Fitness Trainer',
        description:
          'Specialist in Diabetes Management, PCOS, and body recomposition. 1,000+ clients transformed over 8 years.',
        image:
          'https://www.fitoo.pro/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fowner1.1806mz4fqowxs.webp',
        sameAs: [
          'https://www.facebook.com/share/1H76fXNLjV/',
          'https://www.instagram.com/umers1017',
          'https://www.linkedin.com/in/umer-shabbir-66804521b',
        ],
        worksFor: { '@id': orgId },
      },
      {
        '@type': 'Person',
        '@id': basitId,
        name: 'Abdul Basit Khan',
        jobTitle: 'Certified Fitness Trainer | Former Mr. Lahore, Mr. Punjab & Mr. Pakistan',
        description: 'Specialist in competition prep and physique conditioning.',
        image:
          'https://www.fitoo.pro/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fowner2.3wfj22it029_x.webp',
        sameAs: [
          'https://www.facebook.com/khanbasit012',
          'https://www.instagram.com/fitoofitness',
        ],
        worksFor: { '@id': orgId },
      },
    ],
  };
};

// `mainEntity` points back at the Organization so the About page is understood
// as being about the company rather than as a standalone article.
export const aboutPageJsonLd = ({ description, teamMembers = [] } = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: `About ${SITE_NAME}`,
  description,
  url: absoluteUrl('/about'),
  mainEntity: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    employee: teamMembers.map((member) => ({
      '@type': 'Person',
      name: member.name,
      jobTitle: member.title,
    })),
  },
});

// Six coaching offers on /programs, each pointing back at the Organization
// from homeJsonLd via @id so they're understood as services of the same
// business rather than standalone entities.
const PROGRAMS = [
  {
    name: 'Fat Loss Program',
    goal: 'fat-loss',
    description:
      'Personalized nutrition and training plan to reduce body fat without harming metabolism, with regular coach-led adjustments.',
    serviceType: 'Nutrition and fitness coaching',
  },
  {
    name: 'Muscle Gain Program',
    goal: 'muscle-gain',
    description:
      'Progressive strength coaching paired with a tailored nutrition surplus and recovery-based training split.',
    serviceType: 'Nutrition and fitness coaching',
  },
  {
    name: 'Body Recomposition Program',
    goal: 'body-recomposition',
    description:
      'Clinical-nutrition-guided plan to build muscle and lose fat simultaneously through gradual calorie and training adjustments.',
    serviceType: 'Nutrition and fitness coaching',
  },
  {
    name: 'PCOS Program',
    goal: 'pcos',
    description:
      "Hormonal-health-first nutrition guidance from a clinical dietitian to manage PCOS symptoms and improve insulin sensitivity.",
    serviceType: 'Clinical nutrition coaching',
  },
  {
    name: 'Diabetes Management Program',
    goal: 'diabetes',
    description:
      "Clinical nutrition program to stabilize blood sugar and improve metabolic markers alongside a patient's doctor.",
    serviceType: 'Clinical nutrition coaching',
  },
  {
    name: 'Busy Moms Program',
    goal: 'mother-wellness',
    description:
      'Stage-aware nutrition and fitness support for postpartum recovery and breastfeeding.',
    serviceType: 'Nutrition and fitness coaching',
  },
];

export const programsJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': absoluteUrl('/programs#itemlist'),
  itemListElement: PROGRAMS.map((program, index) => ({
    '@type': 'Service',
    position: index + 1,
    name: program.name,
    url: absoluteUrl(`/consultation?goal=${program.goal}`),
    description: program.description,
    provider: { '@id': absoluteUrl('/#organization') },
    serviceType: program.serviceType,
    areaServed: 'PK',
  })),
});

// WebPage + Service pair for /consultation. Title/description are pulled
// from CONSULTATION_SEO so this stays in sync with the meta tags.
export const consultationJsonLd = ({ title, description } = {}) => {
  const url = absoluteUrl('/consultation');
  const serviceId = `${url}#service`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { '@id': absoluteUrl('/#website') },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: DEFAULT_OG_IMAGE,
        },
        mainEntity: { '@id': serviceId },
      },
      {
        '@type': 'Service',
        '@id': serviceId,
        name: 'Free Diet & Supplement Consultation',
        description:
          "A custom diet and supplement plan tailored to your goals, guided by Fitoo's expert nutritionists. Initial consultation is free.",
        provider: { '@id': absoluteUrl('/#organization') },
        serviceType: 'Nutrition consultation',
        areaServed: 'PK',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: CURRENCY,
          description: 'Free initial consultation',
        },
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: url,
          availableLanguage: ['en'],
        },
      },
    ],
  };
};

export default productJsonLd;
