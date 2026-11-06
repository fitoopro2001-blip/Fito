'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '../atoms/Icon';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import Divider from '../atoms/Divider';
import Logo from '../shared/Logo';
import { Caption, Text } from '../atoms/Typography';
import { getCategories } from '../../services/category.service';
import { subscribeNewsletter } from '../../services/newsletter.service';

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Consultation', href: '/consultation' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const supportLinks = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Shipping Info', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Track Order', href: '/track-order' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const socialLinks = [
  { name: 'facebook', href: 'https://www.facebook.com/share/1B2UCHJ3cB/' },
  { name: 'instagram', href: 'https://www.instagram.com/fitoo.pro?igsh=MW56dTF0Ym1taHo2eA==&igsi=MW56dTF0Ym1taHo2eA==' },
];

// Categories are admin-managed (see Category Management in the admin panel),
// so the Shop column is built from the live list instead of a hardcoded one.
function ShopFooterColumn() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const links = [
    { label: 'All Products', href: '/shop' },
    ...categories.slice(0, 6).map((c) => ({ label: c.name, href: `/shop?category=${encodeURIComponent(c.slug)}` })),
  ];

  return <FooterColumn title="Shop" links={links} />;
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <Caption className="text-text-muted">{title}</Caption>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    try {
      await subscribeNewsletter(email);
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-background z-20 border-t border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Logo className="h-10 w-auto" />

            <Text muted className="mt-3 max-w-xs text-sm">
              Premium supplements and personalized diet consultation to help
              you reach your fitness goals, faster.
            </Text>

            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-border-light text-text-secondary hover:text-text-inverse hover:bg-primary hover:border-primary transition-colors"
                >
                  <Icon name={social.name} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <ShopFooterColumn />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Support" links={supportLinks} />

          {/* Newsletter */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Caption className="text-text-muted">
              Stay in the loop
            </Caption>

            <Text muted className="mt-4 text-sm">
              New drops, diet tips, and member-only offers — no spam.
            </Text>

            {status === 'done' ? (
              <Text className="mt-4 text-sm text-primary">
                You&apos;re subscribed! 🎉
              </Text>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-4 flex items-center gap-2"
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  icon={<Icon name="mail" className="w-4 h-4" />}
                  aria-label="Email address"
                  disabled={status === 'loading'}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="shrink-0"
                  aria-label="Subscribe"
                  loading={status === 'loading'}
                  icon={<Icon name="arrowRight" className="w-4 h-4" />}
                />
              </form>
            )}
            {status === 'error' && (
              <Text className="mt-2 text-xs text-danger">
                Something went wrong. Please try again.
              </Text>
            )}
          </div>
        </div>

        <Divider className="mt-12 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <p>© {new Date().getFullYear()} Fitoo. All rights reserved.</p>

          <div className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-text transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          Powered by{" "}
          <a
            href="https://www.diversifydigitalglobal.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors"
          >
            Diversify Digital
          </a>
        </p>
      </div>
    </footer>
  );
}
