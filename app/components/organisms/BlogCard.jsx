// Server component now — the reveal and hover lift are CSS, so there's no
// reason to ship framer-motion for a card that only ever links somewhere.
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import imageUrl from '../../utils/imageUrl';

function BlogCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative glass border border-border-light rounded-2xl overflow-hidden hover-lift hover:border-primary/30 flex flex-col h-full"
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-overlay">
        <Image
          src={imageUrl(post.image)}
          alt={post.seo?.imageAlt || post.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 md:group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 glass-strong border border-border-light text-xs font-medium text-text px-3 py-1 rounded-full">
          {post.category}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <span className="text-xs text-text-muted">
          {post.date} • {post.readTime}
        </span>
        <h3 className="text-text font-semibold text-lg leading-tight mt-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-text-muted mt-2 flex-1 line-clamp-2">{post.excerpt}</p>
        <span className="text-sm text-text-muted mt-4">By {post.author}</span>
      </div>
    </Link>
  );
}

export default memo(BlogCard);
