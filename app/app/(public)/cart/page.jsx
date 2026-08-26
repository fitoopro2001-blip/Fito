'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { H2, Text } from '../../../components/atoms/Typography';
import Button from '../../../components/atoms/Button';
import Icon from '../../../components/atoms/Icon';
import QuantitySelector from '../../../components/molecules/QuantitySelector';
import NotAvailableNotice from '../../../components/molecules/NotAvailableNotice';
import useCart from '../../../hooks/useCart';
import { useCountry } from '../../../context/CountryContext';

export default function CartPage() {
  const { items, totalPrice, removeFromCart, updateQuantity } = useCart();
  const { productsAvailable } = useCountry();

  if (!productsAvailable) {
    return <NotAvailableNotice />;
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="w-16 h-16 rounded-full bg-overlay flex items-center justify-center text-text-muted mx-auto mb-6">
            <Icon name="cart" className="w-7 h-7" />
          </div>
          <H2>Your Cart is Empty</H2>
          <Text muted className="mt-2">
            Looks like you haven&apos;t added anything yet.
          </Text>
          <Link href="/shop">
            <Button variant="primary" size="lg" className="mt-6">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <H2 className="mb-8">Your Cart</H2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const lineId = item.lineId ?? item.id;
                return (
                  <motion.div
                    key={lineId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-4 bg-overlay border border-border-light rounded-2xl p-4"
                  >
                    <Link href={`/product/${item.id}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-overlay shrink-0">
                      <Image src={item.image} alt={item.name} fill unoptimized className="object-cover" />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.id}`} className="text-text font-semibold truncate hover:text-primary transition-colors block">
                        {item.name}
                      </Link>
                      {item.variantName && (
                        <div className="text-text-muted text-xs">{item.variantName}</div>
                      )}
                      <div className="text-text-muted text-sm">PKR {item.price.toFixed(2)}</div>
                    </div>

                    <QuantitySelector
                      value={item.quantity}
                      onChange={(qty) => updateQuantity(lineId, qty)}
                    />

                    <div className="text-text font-semibold w-24 text-right shrink-0 hidden sm:block">
                      PKR {(item.price * item.quantity).toFixed(2)}
                    </div>

                    <button
                      onClick={() => removeFromCart(lineId)}
                      aria-label={`Remove ${item.name}`}
                      className="text-text-muted hover:text-danger transition-colors shrink-0"
                    >
                      <Icon name="close" className="w-5 h-5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="bg-overlay border border-border-light rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <h3 className="text-lg font-semibold text-text mb-4">Order Summary</h3>
            <div className="flex justify-between text-text-secondary text-sm mb-2">
              <span>Subtotal</span>
              <span>PKR {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-secondary text-sm mb-4">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between text-text font-semibold text-lg border-t border-border-light pt-4 mb-6">
              <span>Total</span>
              <span>PKR {totalPrice.toFixed(2)}</span>
            </div>
            <Link href="/checkout">
              <Button variant="primary" size="lg" fullWidth>
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
