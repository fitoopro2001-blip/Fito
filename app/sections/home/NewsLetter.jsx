'use client';

import { useState } from 'react';
import { H2, Text } from '../../components/atoms/Typography';
import Button from '../../components/atoms/Button';
import Icon from '../../components/atoms/Icon';
import { subscribeNewsletter } from '../../services/newsletter.service';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await subscribeNewsletter(email);
      setIsSubscribed(true);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative py-20 section-defer">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-brand rounded-3xl border border-primary/10 p-8 sm:p-12 text-center overflow-hidden reveal">
          {/* Decorative glow — radial gradients instead of two 64px-blurred
              divs. Same look, rasterized once instead of per frame. */}
          <div
            className="absolute inset-0 decor"
            style={{
              backgroundImage: `
                radial-gradient(
                  40% 40% at 100% 0%,
                  color-mix(in srgb, var(--primary) 10%, transparent) 0%,
                  transparent 100%
                ),
                radial-gradient(
                  40% 40% at 0% 100%,
                  color-mix(in srgb, var(--primary) 5%, transparent) 0%,
                  transparent 100%
                )
              `,
            }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Icon name="mail" className="w-8 h-8 text-primary" />
            </div>

            <H2 className="text-3xl sm:text-4xl">Stay Updated</H2>
            <Text size="lg" className="mt-3 max-w-md mx-auto">
              Get new products, fitness tips, and exclusive offers delivered to your inbox.
            </Text>

            {isSubscribed ? (
              <div
                className="mt-8 p-6 bg-primary/10 rounded-2xl border border-primary/20"
                role="status"
              >
                <Icon name="check-circle" className="w-12 h-12 text-primary mx-auto" />
                <Text className="mt-3 text-lg font-medium text-text">
                  You&apos;re subscribed! 🎉
                </Text>
                <Text className="text-text-muted text-sm">
                  Check your inbox for exclusive updates from Fitoo.
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsSubscribed(false)}
                >
                  Subscribe another email
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-1">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={error ? 'newsletter-error' : undefined}
                    className={`w-full px-5 py-3 rounded-xl bg-overlay-strong border ${error ? 'border-danger' : 'border-border-light'
                      } text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                    disabled={isLoading}
                  />
                  {error && (
                    <p id="newsletter-error" role="alert" className="mt-1.5 text-sm text-danger text-left">
                      {error}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className="min-w-[140px]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-text/30 border-t-text rounded-full" />
                      Subscribing...
                    </span>
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </form>
            )}

            {!isSubscribed && (
              <Text className="mt-4 text-xs text-text-muted">
                No spam. Unsubscribe anytime.
              </Text>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}