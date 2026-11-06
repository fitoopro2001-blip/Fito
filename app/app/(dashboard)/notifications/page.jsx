'use client';

import Link from 'next/link';
import { H2, Text } from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import NotificationItem from '@/components/molecules/NotificationItem';
import useAuth from '@/hooks/useAuth';
import useNotifications from '@/hooks/useNotifications';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <H2>Notifications</H2>
        <Text muted className="mt-2">
          Sign in to view your notifications.
        </Text>
        <Link href="/login">
          <Button variant="primary" size="lg" className="mt-6">
            Log In
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <H2>Notifications</H2>
        <Text muted className="mt-2">
          You don&apos;t have any notifications yet.
        </Text>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <H2>Notifications</H2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm text-primary hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} onRead={markAsRead} />
        ))}
      </div>
    </div>
  );
}
