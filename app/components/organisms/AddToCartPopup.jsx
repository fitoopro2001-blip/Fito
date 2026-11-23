'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import useCart from '../../hooks/useCart';
import imageUrl from '../../utils/imageUrl';

export default function AddToCartPopup() {
  const { recentlyAdded, totalItems, dismissRecentlyAdded } = useCart();

  useEffect(() => {
    if (!recentlyAdded) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') dismissRecentlyAdded();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [recentlyAdded, dismissRecentlyAdded]);

  return (
    <AnimatePresence>
      {recentlyAdded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) dismissRecentlyAdded();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-popup-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-primary/40 bg-background shadow-[0_24px_100px_rgba(0,0,0,0.65)]"
          >
            <div className="h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <button
              type="button"
              onClick={dismissRecentlyAdded}
              aria-label="Close cart confirmation"
              className="absolute right-4 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border-light bg-surface text-text-secondary transition-colors hover:text-text"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3 pr-10">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon name={recentlyAdded.alreadyInCart ? 'cart' : 'check-circle'} className="h-6 w-6" />
                </span>
                <div>
                  <h2 id="cart-popup-title" className="text-xl font-bold text-text sm:text-2xl">
                    {recentlyAdded.alreadyInCart ? 'Already in your cart' : 'Added to your cart'}
                  </h2>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {recentlyAdded.alreadyInCart
                      ? 'This item is in your cart. You can review it now.'
                      : 'Your item is ready whenever you are.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-border-light bg-surface/70 p-3 sm:p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-overlay sm:h-24 sm:w-24">
                  <Image
                    src={imageUrl(recentlyAdded.image)}
                    alt={recentlyAdded.name}
                    fill
                    sizes="96px"
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold text-text">{recentlyAdded.name}</p>
                  {recentlyAdded.variantName && (
                    <p className="mt-1 text-sm text-text-secondary">{recentlyAdded.variantName}</p>
                  )}
                  <p className="mt-2 text-sm text-text-secondary">
                    Qty: {recentlyAdded.quantity}
                    <span className="mx-2 text-text-muted">·</span>
                    <span className="font-semibold text-primary">
                      PKR {(recentlyAdded.price * recentlyAdded.quantity).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Items in your cart</span>
                <span className="rounded-full bg-primary/15 px-3 py-1 font-semibold text-primary">
                  {totalItems}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  href="/cart"
                  size="lg"
                  fullWidth
                  onClick={dismissRecentlyAdded}
                  icon={<Icon name="cart" className="h-5 w-5" />}
                >
                  View Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={dismissRecentlyAdded}
                >
                  Continue Shopping
                </Button>
              </div>
              <Link
                href="/checkout"
                onClick={dismissRecentlyAdded}
                className="mt-4 block text-center text-sm font-medium text-text-secondary transition-colors hover:text-primary"
              >
                Go straight to checkout
              </Link>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
