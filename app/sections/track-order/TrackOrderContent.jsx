'use client';

import { useState } from 'react';
import { H2, H4, Text } from '@/components/atoms/Typography';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Tag from '@/components/atoms/Tag';
import { trackOrder } from '@/services/order.service';

const STEPS = ['processing', 'shipped', 'delivered'];

const STATUS_LABEL = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function StatusTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-danger text-sm font-medium">
        <Icon name="close" className="w-4 h-4" />
        This order was cancelled.
      </div>
    );
  }

  const activeIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i <= activeIndex;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${
                  done
                    ? 'bg-primary border-primary text-text-inverse'
                    : 'border-border text-text-muted'
                }`}
              >
                <Icon name="check" className="w-4 h-4" />
              </span>
              <Text className={`text-xs font-medium ${done ? 'text-text' : 'text-text-muted'}`}>
                {STATUS_LABEL[step]}
              </Text>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 ${i < activeIndex ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TrackOrderContent() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      setError('Enter both your order ID and phone number.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const result = await trackOrder(orderId.trim(), phone.trim());
      setOrder(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find that order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <H2>Track Your Order</H2>
          <Text muted className="mt-3">
            Enter your order number and the phone number used at checkout.
          </Text>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-border-light bg-surface p-6"
        >
          <Input
            id="track-order-id"
            label="Order Number"
            placeholder="e.g. FT-A1B2C3D4"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <Input
            id="track-order-phone"
            type="tel"
            label="Phone Number"
            placeholder="03XX XXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {error && <Text className="text-danger text-sm">{error}</Text>}
          <Button type="submit" variant="primary" size="lg" loading={loading} icon={<Icon name="search" className="w-4 h-4" />}>
            Track Order
          </Button>
        </form>

        {order && (
          <div className="mt-8 rounded-2xl border border-border-light bg-surface p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <Text muted className="text-xs uppercase tracking-wide">
                  Order
                </Text>
                <H4 className="mt-0.5">#{order.orderNumber || order.id}</H4>
                <Text muted className="text-sm mt-1">
                  Placed {new Date(order.placedAt).toLocaleDateString()}
                </Text>
              </div>
              <Tag variant={order.status === 'cancelled' ? 'muted' : 'solid'} className="capitalize">
                {STATUS_LABEL[order.status] || order.status}
              </Tag>
            </div>

            <StatusTimeline status={order.status} />

            <div className="mt-6 pt-6 border-t border-border-light flex flex-col gap-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    {item.name} × {item.qty}
                  </span>
                  <span className="text-text">PKR {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold text-text pt-2 mt-2 border-t border-border-light">
                <span>Total</span>
                <span>PKR {order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-text-secondary">
              Shipping to {order.shipping.name} — {order.shipping.city}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
