'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Form, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Checkbox from '@/components/atoms/Checkbox';
import Divider from '@/components/atoms/Divider';
import GoogleAuthButton from '@/components/molecules/GoogleAuthButton';
import LegalModal from '@/components/molecules/LegalModal';
import useAuth from '@/hooks/useAuth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // null | 'terms' | 'privacy'
  const router = useRouter();
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values);
      message.success('Logged in successfully!');
      router.push('/');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text">Welcome Back</h1>
        <p className="text-text-muted mt-2">Sign in to your Fitoo account</p>
      </div>

      <Form
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input icon={<MailOutlined />} placeholder="Email address" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input type="password" icon={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <div className="flex justify-between items-center mb-6">
          <Checkbox>Remember me</Checkbox>
          <Link href="/forgot-password" className="text-primary hover:text-primary-hover text-sm">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Sign In
        </Button>

        <Divider className="my-6">
          <span className="text-text-muted text-sm">or continue with</span>
        </Divider>

        <div className="space-y-4">
          <GoogleAuthButton
            onAuthenticated={() => {
              message.success('Logged in successfully!');
              router.push('/');
            }}
          />

        </div>

        <div className="text-center mt-6 text-text-muted">
          Donot have an account?{' '}
          <Link href="/register" className="text-primary hover:text-primary-hover font-medium">
            Sign up now
          </Link>
        </div>

        <div className="text-center mt-4 text-xs text-text-muted">
          By signing in, you agree to our{' '}
          <button
            type="button"
            onClick={() => setLegalModal('terms')}
            className="text-primary hover:text-primary-hover underline-offset-2 hover:underline inline"
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button
            type="button"
            onClick={() => setLegalModal('privacy')}
            className="text-primary hover:text-primary-hover underline-offset-2 hover:underline inline"
          >
            Privacy Policy
          </button>
          .
        </div>
      </Form>

      <LegalModal type={legalModal} open={!!legalModal} onClose={() => setLegalModal(null)} />
    </motion.div>
  );
}
