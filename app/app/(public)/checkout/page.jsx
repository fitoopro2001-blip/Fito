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

  if (!productsAvailable) {
    return <NotAvailableNotice />;
  }

  const updateShipping = (field) => (e) =>
    setShipping((prev) => ({ ...prev, [field]: e.target.value }));

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
        total: totalPrice,
        paymentMethod,
        transactionId,
        screenshotAttached: screenshot.length > 0,
        shipping,
      });

      setOrder({
        id: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        placedAt: createdOrder.placedAt,
        items,
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
            <div className="flex justify-between text-text font-semibold text-lg border-t border-border-light pt-4 mb-6">
              <span>Total</span>
              <span>PKR {totalPrice.toFixed(2)}</span>
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
