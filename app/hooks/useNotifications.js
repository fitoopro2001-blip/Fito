'use client';

import { useCallback } from 'react';
import useApiResource from './useApiResource';
import useAuth from './useAuth';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notification.service';

// Notifications only ever exist for a signed-in user — guests get an empty
// list instead of a request.
export default function useNotifications() {
  const { isAuthenticated } = useAuth();

  const { data, loading, setData } = useApiResource(getMyNotifications, [isAuthenticated], {
    skip: !isAuthenticated,
    fallback: { notifications: [], unreadCount: 0 },
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const markAsRead = useCallback(
    async (id) => {
      if (!isAuthenticated) return;

      await markNotificationRead(id);
      setData((prev) => ({
        notifications: (prev?.notifications ?? []).map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max((prev?.unreadCount ?? 1) - 1, 0),
      }));
    },
    [isAuthenticated, setData]
  );

  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    await markAllNotificationsRead();
    setData((prev) => ({
      notifications: (prev?.notifications ?? []).map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  }, [isAuthenticated, setData]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
}
