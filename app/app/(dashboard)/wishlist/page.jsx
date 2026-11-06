'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { H2, Text } from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import imageUrl from '@/utils/imageUrl';
import formatCategory from '@/utils/formatCategory';
import useAuth from '@/hooks/useAuth';
import useWishlist from '@/hooks/useWishlist';
import useCart from '@/hooks/useCart';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <H2>Wishlist</H2>
        <Text muted className="mt-2">
          Sign in to view your wishlist.
        </Text>
        <Link href="/login">
          <Button variant="primary" size="lg" className="mt-6">
            Log In
          </Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <H2>Wishlist</H2>
        <Text muted className="mt-2">
          Save products you love and they&apos;ll show up here.
        </Text>
        <Link href="/shop">
          <Button variant="primary" size="lg" className="mt-6">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <H2 className="mb-6">Wishlist</H2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const inCart = isInCart(item.id);
            const price = item.discountedPrice ?? item.price;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="relative bg-surface border border-border rounded-2xl p-4 flex flex-col"
              >
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  aria-label={`Remove ${item.name} from wishlist`}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full glass-strong flex items-center justify-center text-text-muted hover:text-danger transition-colors border border-border-light"
                >
                  <Icon name="close" className="w-4 h-4" />
                </button>

                <Link
                  href={`/product/${item.slug || item.id}`}
                  className="relative w-full aspect-square rounded-xl overflow-hidden bg-overlay mb-4"
                >
                  <Image src={imageUrl(item.image)} alt={item.name} fill className="object-cover" />
                </Link>

                <Link
                  href={`/product/${item.slug || item.id}`}
                  className="text-text font-semibold truncate hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
                {item.category && (
                  <span className="text-sm text-text-muted">{formatCategory(item.category)}</span>
                )}

                <div className="flex items-center justify-between mt-3">
                  <span className="text-text font-semibold">PKR {price.toFixed(2)}</span>
                  <Button
                    variant={inCart ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => !inCart && addToCart(item)}
                    disabled={inCart}
                    className="rounded-full px-4 py-1.5 text-xs"
                  >
                    {inCart ? 'In Cart' : 'Add to Cart'}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
