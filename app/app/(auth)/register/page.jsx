'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, GiftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Checkbox from '@/components/atoms/Checkbox';
import Divider from '@/components/atoms/Divider';
import GoogleAuthButton from '@/components/molecules/GoogleAuthButton';
import LegalModal from '@/components/molecules/LegalModal';
import useAuth from '@/hooks/useAuth';

function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // null | 'terms' | 'privacy'
  const router = useRouter();
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const referralCodeParam = searchParams.get('ref') || '';
  const [form] = Form.useForm();
  const referralCode = Form.useWatch('referralCode', form);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await register(values);
      message.success(result?.message || 'Account created successfully!');
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Something went wrong. Please try again.');
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
        <h1 className="text-3xl font-bold text-text">Create Account</h1>
        <p className="text-text-muted mt-2">Join Fitoo and start your fitness journey</p>
      </div>

      <Form
        form={form}
        name="register"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        requiredMark={false}
        initialValues={{ referralCode: referralCodeParam }}
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <Input icon={<UserOutlined />} placeholder="Full name" />
        </Form.Item>

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
          rules={[
            { required: true, message: 'Please enter a password' },
            { min: 8, message: 'Password must be at least 8 characters' },
          ]}
        >
          <Input type="password" icon={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input type="password" icon={<LockOutlined />} placeholder="Confirm password" />
        </Form.Item>

        <Form.Item name="referralCode">
          <Input icon={<GiftOutlined />} placeholder="Referral code (optional)" />
        </Form.Item>

        <Form.Item
          name="terms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms and conditions')),
            },
          ]}
        >
          <Checkbox>
            I agree to the{' '}
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
          </Checkbox>
        </Form.Item>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Create Account
        </Button>

        <Divider className="my-6">
          <span className="text-text-muted text-sm">or sign up with</span>
        </Divider>

        <GoogleAuthButton onAuthenticated={() => router.push('/')} referralCode={referralCode} />

        <div className="text-center mt-6 text-text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary-hover font-medium">
            Sign in
          </Link>
        </div>
      </Form>

      <LegalModal type={legalModal} open={!!legalModal} onClose={() => setLegalModal(null)} />
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
