'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UploadOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { H2, H4, Text } from '../../../components/atoms/Typography';
import Card from '../../../components/atoms/Card';
import Input from '../../../components/atoms/Input';
import Radio from '../../../components/atoms/Radio';
import Upload from '../../../components/atoms/Upload';
import Button from '../../../components/atoms/Button';
import Icon from '../../../components/atoms/Icon';
import useCart from '../../../hooks/useCart';
import { createOrder } from '../../../services/order.service';
import { validatePromoCode } from '../../../services/promoCode.service';
import { WHATSAPP_NUMBER } from '../../../utils/siteConfig';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE_MB } from '../../../utils/uploadValidation';
import { useCountry } from '../../../context/CountryContext';
import NotAvailableNotice from '../../../components/molecules/NotAvailableNotice';

function buildWhatsAppMessage(order) {
  const lines = [
    `New Order #${order.orderNumber || order.id}`,
    '',
    'Items:',
    ...order.items.map(
      (item) =>
        `- ${item.name}${item.variantName ? ` (${item.variantName})` : ''} x${item.quantity} — PKR ${(item.price * item.quantity).toFixed(2)}`
    ),
    '',
    ...(order.discountAmount
      ? [
          `Subtotal: PKR ${order.subtotal.toFixed(2)}`,
          `Promo ${order.promoCode?.code} (${order.promoCode?.discountPercent}% off): -PKR ${order.discountAmount.toFixed(2)}`,
        ]
      : []),
    `Total: PKR ${order.total.toFixed(2)}`,
    `Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Bank Transfer)'}`,
    '',
    `Name: ${order.shipping.name}`,
    `Phone: ${order.shipping.phone}`,
    `Address: ${order.shipping.address}, ${order.shipping.city}`,
  ];
  if (order.paymentMethod === 'online') {
    lines.push('', '(Payment screenshot attached in this chat)');
  }
  return lines.join('\n');
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { productsAvailable } = useCountry();

  const [shipping, setShipping] = useState({ name: '', email: '', phone: '', address: '', city: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState([]);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  // Set once a code previews as valid — the server re-checks it when the
  // order is placed, so this is display state, not the source of truth.
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  if (!productsAvailable) {
    return <NotAvailableNotice />;
  }

  const updateShipping = (field) => (e) =>
    setShipping((prev) => ({ ...prev, [field]: e.target.value }));

  // Recomputed from the current cart rather than reusing the amount the
  // preview returned, so the summary stays right if the cart changes after
  // the code was applied. The server does the same sum on its own items.
  const discountAmount = promo
    ? Math.round(totalPrice * (promo.discountPercent / 100) * 100) / 100
    : 0;
  const payableTotal = Math.round((totalPrice - discountAmount) * 100) / 100;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    setPromoError('');
    try {
      const result = await validatePromoCode(promoInput.trim(), totalPrice);
      setPromo(result);
      message.success(`${result.discountPercent}% off applied`);
    } catch (err) {
      setPromo(null);
      // The API's messages are already customer-facing ("already been used",
      // "has expired", …) — show them rather than a generic failure.
      setPromoError(err?.response?.data?.message || 'Could not apply this promo code.');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shipping.name.trim() || !shipping.phone.trim() || !shipping.address.trim() || !shipping.city.trim()) {
      setError('Please fill in all shipping details.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const createdOrder = await createOrder({
        // The order schema has no separate variant field, so the variant
        // name (if any) is folded into the line item's name.
        items: items.map((item) => ({
          name: item.variantName ? `${item.name} (${item.variantName})` : item.name,
          qty: item.quantity,
          price: item.price,
        })),
        // No `total` — the server sums the line items and applies the promo
        // discount itself, so the amounts on the order are always its own.
        paymentMethod,
        transactionId,
        screenshotAttached: screenshot.length > 0,
        shipping,
        promoCode: promo?.code,
      });

      setOrder({
        id: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        placedAt: createdOrder.placedAt,
        items,
        subtotal: createdOrder.subtotal,
        discountAmount: createdOrder.discountAmount,
        promoCode: createdOrder.promoCode,
        total: createdOrder.total,
        paymentMethod: createdOrder.paymentMethod,
        transactionId: createdOrder.transactionId,
        shipping: createdOrder.shipping,
      });

      clearCart();
    } catch (err) {
      if (err?.response?.status === 403) {
        setError('Not available in your country.');
        message.error('Not available in your country');
      } else if (promo && err?.response?.data?.message) {
        // The promo could have expired or been redeemed elsewhere between
        // previewing it and placing the order — the server's message says
        // which, and the code is dropped so the order can be retried.
        setPromo(null);
        setPromoError(err.response.data.message);
        setError('Your promo code could no longer be applied. Review the total and try again.');
        message.error(err.response.data.message);
      } else {
        setError('Something went wrong while placing your order. Please try again.');
        message.error('Failed to place order');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendToWhatsApp = () => {
    if (!order) return;
    const text = encodeURIComponent(buildWhatsAppMessage(order));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  if (order) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success mx-auto mb-6">
            <Icon name="check" className="w-8 h-8" />
          </div>
          <H2>Order Placed!</H2>
          <Text muted className="mt-2">
            Order #{order.orderNumber || order.id} —{' '}
            {order.paymentMethod === 'cod'
              ? 'pay on delivery.'
              : "we'll confirm once payment is verified."}
          </Text>

          <Text muted className="mt-3 text-sm">
            Save your order number — you can use it with your phone number to{' '}
            <Link href="/track-order" className="text-primary underline">
              track your order
            </Link>{' '}
            anytime.
            {order.shipping.email && ' We’ve also emailed your confirmation to ' + order.shipping.email + '.'}
          </Text>

          {order.paymentMethod === 'online' && (
            <Text muted className="mt-3 text-sm">
              A wa.me link can&apos;t carry a file attachment — tap below to open WhatsApp with
              your order details pre-filled, then attach the payment screenshot yourself in that
              chat.
            </Text>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button
              variant="primary"
              size="lg"
              icon={<Icon name="whatsapp" className="w-4 h-4" />}
              onClick={handleSendToWhatsApp}
            >
              Send Order to WhatsApp
            </Button>
            <Link href="/shop">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <H2>Nothing to Check Out</H2>
          <Text muted className="mt-2">
            Your cart is empty.
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
        <H2 className="mb-8">Checkout</H2>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="bg-surface border border-border">
              <H4 className="mb-4">Shipping Details</H4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Jane Doe"
                  value={shipping.name}
                  onChange={updateShipping('name')}
                />
                <Input
                  label="Phone Number"
                  placeholder="03XX-XXXXXXX"
                  value={shipping.phone}
                  onChange={updateShipping('phone')}
                />
                <Input
                  type="email"
                  label="Email (Optional)"
                  placeholder="you@example.com"
                  value={shipping.email}
                  onChange={updateShipping('email')}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Address"
                    placeholder="House #, Street, Area"
                    value={shipping.address}
                    onChange={updateShipping('address')}
                  />
                </div>
                <Input
                  label="City"
                  placeholder="Lahore"
                  value={shipping.city}
                  onChange={updateShipping('city')}
                />
              </div>
            </Card>

            <Card className="bg-surface border border-border">
              <H4 className="mb-4">Payment Method</H4>
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="flex-col gap-3"
              >
                <Radio value="cod">Cash on Delivery</Radio>
                <Radio value="online">Online Payment (Bank Transfer)</Radio>
              </Radio.Group>
            </Card>

            {paymentMethod === 'online' && (
              <Card className="bg-surface border border-border">
                <H4 className="mb-3">Bank Details</H4>
                <div className="space-y-3 mb-5">
                  <div>
                    <Text muted>Bank Name</Text>
                    <div className="text-text font-medium">Bank Alfalah</div>
                  </div>
                  <div>
                    <Text muted>Account Title</Text>
                    <div className="text-text font-medium">FITOO</div>
                  </div>
                  <div>
                    <Text muted>Account Number</Text>
                    <div className="text-text font-medium">55215002851811</div>
                  </div>
                  <div>
                    <Text muted>IBAN</Text>
                    <div className="text-text font-medium">PK73ALFH5521005002851811</div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm text-text-secondary mb-1.5">
                    Transaction ID (Optional)
                  </label>
                  <Input
                    placeholder="Enter transaction reference"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">
                    Payment Screenshot
                  </label>
                  <Upload
                    value={screenshot}
                    onChange={setScreenshot}
                    picture
                    accept="image/*"
                    allowedTypes={ALLOWED_IMAGE_TYPES}
                    maxSizeMB={MAX_UPLOAD_SIZE_MB}
                  >
                    <UploadOutlined />
                    <span className="ml-2">Upload Screenshot</span>
                  </Upload>
                  <Text muted className="text-xs mt-2">
                    Kept with your order for reference. You&apos;ll also get a WhatsApp link after
                    placing the order — attach it there too so we can verify faster.
                  </Text>
                </div>
              </Card>
            )}

            {error && <Text className="text-danger text-sm">{error}</Text>}
          </div>

          <div className="bg-overlay border border-border-light rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <h3 className="text-lg font-semibold text-text mb-4">Order Summary</h3>
            <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.lineId ?? item.id} className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    {item.name}
                    {item.variantName ? ` (${item.variantName})` : ''} × {item.quantity}
                  </span>
                  <span className="text-text">PKR {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border-light pt-4 mb-4">
              <label className="block text-sm text-text-secondary mb-1.5">Promo Code</label>
              {promo ? (
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-success/10 border border-success/30">
                  <span className="text-sm text-text font-mono tracking-wider">{promo.code}</span>
                  <span className="text-sm text-success">−{promo.discountPercent}%</span>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs text-text-secondary underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="FITO-XXXXXX"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    // Enter inside the checkout form would otherwise submit
                    // the order instead of applying the code.
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;
                      e.preventDefault();
                      handleApplyPromo();
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyPromo}
                    loading={applyingPromo}
                    disabled={!promoInput.trim()}
                  >
                    Apply
                  </Button>
                </div>
              )}
              {promoError && <Text className="text-danger text-xs mt-1.5">{promoError}</Text>}
            </div>

            <div className="flex justify-between text-sm text-text-secondary mb-2">
              <span>Subtotal</span>
              <span>PKR {totalPrice.toFixed(2)}</span>
            </div>
            {promo && (
              <div className="flex justify-between text-sm text-success mb-2">
                <span>Promo discount ({promo.discountPercent}%)</span>
                <span>− PKR {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-text font-semibold text-lg border-t border-border-light pt-4 mb-6">
              <span>Total</span>
              <span>PKR {payableTotal.toFixed(2)}</span>
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
              Place Order
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
