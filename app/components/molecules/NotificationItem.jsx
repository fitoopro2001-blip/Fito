'use client';

import dayjs from 'dayjs';
import Card from '../atoms/Card';
import { Text } from '../atoms/Typography';

const TYPE_DOT = {
  info: 'bg-primary',
  promo: 'bg-success',
  alert: 'bg-danger',
};

export default function NotificationItem({ notification, onRead }) {
  const { title, message, type, date, isRead } = notification;

  return (
    <Card
      hoverable={!isRead}
      onClick={() => !isRead && onRead?.(notification.id)}
      padding={0}
      className={`border border-border-light ${isRead ? 'bg-transparent' : 'bg-primary/5 hover:border-primary/30'}`}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[type] || TYPE_DOT.info} ${isRead ? 'opacity-30' : ''}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm truncate ${isRead ? 'text-text-secondary' : 'text-text font-semibold'}`}>
              {title}
            </p>
            <span className="text-xs text-text-muted shrink-0">
              {date ? dayjs(date).format('MMM D') : ''}
            </span>
          </div>
          <Text muted className="text-sm mt-0.5 line-clamp-2">
            {message}
          </Text>
        </div>
      </div>
    </Card>
  );
}
