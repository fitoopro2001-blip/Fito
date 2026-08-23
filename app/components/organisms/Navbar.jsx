'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, Empty, Spin } from 'antd';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Logo from '../shared/Logo';
import { Text } from '../atoms/Typography';
import NotificationItem from '../molecules/NotificationItem';
import SearchBar from '../molecules/SearchBar';
import useCart from '../../hooks/useCart';
import useWishlist from '../../hooks/useWishlist';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Programs', href: '/programs' },
  { label: 'Consultation', href: '/consultation' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: totalWishlistItems } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  // Notifications only exist for a signed-in user.
  const canSeeNotifications = isAuthenticated;

  // A sentinel + IntersectionObserver instead of a scroll listener.
  //
  // The old version ran a handler on every scroll event and called setState
  // each time, so React re-rendered the navbar dozens of times per second
  // while scrolling. The observer fires exactly twice — once crossing 50px
  // down, once crossing back up — and does its work off the main thread.
  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Clears the session and sends the user back to the hero section. A plain
  // router.push('/') doesn't scroll on same-route navigation, so the scroll
  // is done explicitly for the case where logout happens while already on '/'.
  const handleLogout = () => {
    logout();
    router.push('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const notificationsPanel = (
    <div className="w-80 max-w-[85vw]">
      <div className="flex items-center justify-between px-1 pb-3">
        <span className="font-semibold text-text">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
        {notificationsLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="small" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            description={<Text muted className="text-sm">No notifications yet</Text>}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-4"
          />
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
            />
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <Link
          href="/notifications"
          className="block text-center text-sm text-primary hover:underline mt-3 pt-3 border-t border-border-light"
        >
          View all
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* Zero-height marker 50px down the document. Whether it's in view is
          what drives the scrolled state, via IntersectionObserver. */}
      <div ref={sentinelRef} aria-hidden="true" className="absolute top-[50px] h-px w-px" />

      {/* Plain <nav>: the mount animation was a one-off that cost a
          framer-motion subscription on the most persistent element in the app,
          and it delayed the header paint on first load. */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo className="h-9 w-auto" priority />

            {/* Desktop nav — only from lg up, so tablets don't get crammed */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="relative text-text/80 hover:text-text px-3 py-2 text-sm font-medium transition-colors group"
                  >
                    {link.label}
                    <span
                      className={`absolute left-0 right-0 bottom-0 h-0.5 bg-primary origin-left transition-transform ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center space-x-5">
              <SearchBar />
              {canSeeNotifications && (
                <Badge count={unreadCount}>
                  <Popover
                    trigger="click"
                    placement="bottomRight"
                    content={notificationsPanel}
                    arrow={false}
                  >
                    <button aria-label="Notifications" className="text-text-secondary hover:text-text transition-colors">
                      <Icon name="bell" className="w-5 h-5" />
                    </button>
                  </Popover>
                </Badge>
              )}
              <Badge count={totalWishlistItems}>
                <Link href="/wishlist" aria-label="Wishlist" className="text-text-secondary hover:text-text transition-colors">
                  <Icon name="heart" className="w-5 h-5" />
                </Link>
              </Badge>
              <Badge count={totalItems}>
                <Link href="/cart" aria-label="Cart" className="text-text-secondary hover:text-text transition-colors">
                  <Icon name="cart" className="w-5 h-5" />
                </Link>
              </Badge>
              {isAuthenticated && (
                <Link href="/dashboard" aria-label="Dashboard" className="text-text-secondary hover:text-text transition-colors">
                  <Icon name="dashboard" className="w-5 h-5" />
                </Link>
              )}
              {isAuthenticated && (
                <Link href="/profile" className="text-sm font-medium text-primary hover:underline transition-colors">
                  Refer someone
                </Link>
              )}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="text-sm text-text-secondary hover:text-text transition-colors">
                    Hi, {user?.name}
                  </Link>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="primary" icon={<Icon name="login" className="w-4 h-4" />}>
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Compact controls below lg: search + menu only */}
            <div className="flex lg:hidden items-center space-x-4">
              <SearchBar />
              <button aria-label="Open menu" className="text-text" onClick={() => setMobileOpen(true)}>
                <Icon name="menu" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile / tablet menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-scrim lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 z-50 h-full w-[280px] max-w-[85vw] bg-background lg:hidden"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-end mb-6">
                  <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="text-text">
                    <Icon name="close" className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-text/80 hover:text-text text-lg font-medium transition-colors border-b border-border-light py-3"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="flex items-center space-x-5 pt-5">
                  {canSeeNotifications && (
                    <Badge count={unreadCount}>
                      <Link
                        href="/notifications"
                        aria-label="Notifications"
                        onClick={() => setMobileOpen(false)}
                        className="text-text-secondary hover:text-text"
                      >
                        <Icon name="bell" className="w-5 h-5" />
                      </Link>
                    </Badge>
                  )}
                  <Badge count={totalWishlistItems}>
                    <Link
                      href="/wishlist"
                      aria-label="Wishlist"
                      onClick={() => setMobileOpen(false)}
                      className="text-text-secondary hover:text-text"
                    >
                      <Icon name="heart" className="w-5 h-5" />
                    </Link>
                  </Badge>
                  <Badge count={totalItems}>
                    <Link
                      href="/cart"
                      aria-label="Cart"
                      onClick={() => setMobileOpen(false)}
                      className="text-text-secondary hover:text-text"
                    >
                      <Icon name="cart" className="w-5 h-5" />
                    </Link>
                  </Badge>
                  {isAuthenticated && (
                    <Link
                      href="/dashboard"
                      aria-label="Dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="text-text-secondary hover:text-text"
                    >
                      <Icon name="dashboard" className="w-5 h-5" />
                    </Link>
                  )}
                </div>

                {isAuthenticated ? (
                  <div className="mt-6">
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm text-text-secondary hover:text-text mb-2 block"
                    >
                      Signed in as {user?.name}
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-primary hover:underline mb-4 block"
                    >
                      Refer someone
                    </Link>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="primary"
                      icon={<Icon name="login" className="w-4 h-4" />}
                      fullWidth
                      className="mt-6"
                    >
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}