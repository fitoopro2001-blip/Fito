'use client';

import Link from 'next/link';
import { H2, Text } from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

// Shown in place of shop/product/cart/checkout content for visitors outside
// Pakistan — physical products only ship domestically (see useCountry()).
export default function NotAvailableNotice() {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <div className="w-16 h-16 rounded-full bg-overlay flex items-center justify-center text-text-muted mx-auto mb-6">
          <Icon name="cart" className="w-7 h-7" />
        </div>
        <H2>Not Available in Your Country</H2>
        <Text muted className="mt-2">
          Physical products currently ship within Pakistan only. Our consultation programs, however,
          are available worldwide.
        </Text>
        <Link href="/programs">
          <Button variant="primary" size="lg" className="mt-6">
            Explore Consultations
          </Button>
        </Link>
      </div>
    </div>
  );
}
