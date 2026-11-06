'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { message } from 'antd';
import { MailOutlined, EditOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

import Input from '@/components/atoms/Input';
import OtpInput from '@/components/atoms/OtpInput';
import Button from '@/components/atoms/Button';
import useAuth from '@/hooks/useAuth';

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [editingEmail, setEditingEmail] = useState(!emailParam);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const { verifyOtp, resendOtp } = useAuth();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      message.error('Please enter your email');
      return;
    }
    if (otp.length !== 6) {
      setOtpError(true);
      message.error('Please enter the full 6-digit code');
      return;
    }

    setOtpError(false);
    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      message.success('Email verified! You are now logged in.');
      router.push('/');
    } catch (error) {
      setOtpError(true);
      message.error(error?.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!email) {
      message.error('Please enter your email first');
      return;
    }
    setResending(true);
    try {
      const result = await resendOtp({ email });
      message.success(result?.message || 'Verification code resent');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
          <MailOutlined />
        </div>
        <h1 className="text-3xl font-bold text-text">Verify Your Email</h1>

        {editingEmail ? (
          <p className="text-text-muted mt-2">Enter your email to get a 6-digit code</p>
        ) : (
          <p className="text-text-muted mt-2">
            We sent a 6-digit code to <span className="text-text font-medium">{email}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleVerify}>
        {editingEmail ? (
          <div className="mb-6">
            <Input
              icon={<MailOutlined />}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            {emailParam && (
              <button
                type="button"
                onClick={() => { setEmail(emailParam); setEditingEmail(false); }}
                className="text-xs text-text-muted hover:text-text-secondary mt-2"
              >
                ← Use {emailParam}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={() => setEditingEmail(true)}
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
            >
              <EditOutlined /> Not your email? Change it
            </button>
          </div>
        )}

        <OtpInput
          value={otp}
          onChange={(value) => { setOtp(value); setOtpError(false); }}
          error={otpError}
          className="mb-8"
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Verify
        </Button>

        <div className="text-center mt-4 text-text-muted text-sm">
          Didn&apos;t get a code?{' '}
          <button
            type="button"
            onClick={onResend}
            disabled={resending || cooldown > 0}
            className="text-primary hover:text-primary-hover font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </div>

        <div className="text-center mt-4">
          <Link href="/login" className="text-text-muted hover:text-text-secondary text-sm">
            ← Back to login
          </Link>
        </div>
      </form>
    </motion.div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
