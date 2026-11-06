import BlogTemplate from '@/components/templates/BlogTemplate';
import JsonLd from '@/components/shared/JsonLd';
import { getBlogForSeo } from '@/services/seo.server';
import { buildBlogMetadata } from '@/lib/seo';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';

// Metadata comes from the SEO block the backend generates when the admin saves
// a post, so nothing here needs maintaining per article.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBlogForSeo(slug);
  return buildBlogMetadata(data?.blog);
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  // Same request as generateMetadata, deduped by fetch caching.
  const data = await getBlogForSeo(slug);
  const post = data?.blog;

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(post),
          post &&
          breadcrumbJsonLd([
            { name: 'Home', href: '/' },
            { name: 'Blog', href: '/blog' },
            { name: post.category, href: `/blog?category=${encodeURIComponent(post.category)}` },
            { name: post.title, href: `/blog/${post.slug}` },
          ]),
        ].filter(Boolean)}
      />
      <BlogTemplate slug={slug} initialData={data} />
    </>
  );
}
