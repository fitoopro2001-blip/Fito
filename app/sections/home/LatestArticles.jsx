'use client';

// Still a client component because it fetches on mount, but all the
// scroll-time animation work is gone.
import Image from 'next/image';
import Link from 'next/link';
import { H2, Text } from '../../components/atoms/Typography';
import Icon from '../../components/atoms/Icon';
import Spinner from '../../components/atoms/Spinner';
import useApiResource from '../../hooks/useApiResource';
import { getBlogs } from '../../services/blog.service';
import imageUrl from '../../utils/imageUrl';

const LIMIT = 3;

export default function LatestArticles() {
  const { data: apiPosts, loading } = useApiResource(() => getBlogs({ limit: LIMIT }), [], {
    fallback: [],
  });

  const articles = apiPosts ?? [];

  return (
    <section className="relative py-20 section-defer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <H2>Latest Articles</H2>
          <Text muted className="mt-3 max-w-xl mx-auto">
            Stay informed with expert insights on nutrition, supplements, and fitness.
          </Text>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="w-8 h-8" />
          </div>
        ) : articles.length === 0 ? (
          <Text muted className="text-center py-10">
            No articles published yet.
          </Text>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
            {articles.map((article) => (
              <article
                key={article.id ?? article.slug}
                className="group glass border border-border-light rounded-2xl overflow-hidden hover-lift hover:border-primary/30 flex flex-col"
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <Image
                    src={imageUrl(article.image)}
                    alt={article.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 md:group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-primary/90 text-text-inverse text-xs font-semibold px-3 py-1.5 rounded-full">
                    {article.category}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center text-xs text-text-muted gap-3 mb-2">
                    <span>{article.author}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                    {article.readTime && (
                      <>
                        <span>•</span>
                        <span>{article.readTime}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-text leading-tight mb-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${article.slug}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </h3>

                  <p className="text-sm text-text-secondary flex-1 leading-relaxed">
                    {article.excerpt}
                  </p>

                  <div className="mt-4 pt-3 border-t border-border-light">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors group-hover:gap-2 gap-1.5"
                    >
                      Read Full Article
                      <span className="transition-transform md:group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12 reveal">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors border border-border-light hover:border-primary/30 px-6 py-3 rounded-xl hover:bg-primary/5 group"
          >
            View All Articles
            <Icon
              name="arrowRight"
              className="w-4 h-4 transition-transform md:group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
