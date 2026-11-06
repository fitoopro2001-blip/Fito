import { useEffect, useState } from 'react';
import { Form, Input, Button, Alert, Card, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { forgotPasswordAdmin, resetPasswordAdmin } from '../../api/adminAuth.api';
import { ROUTES } from '../../constants/routes';
import logo from '../../assets/logo/fitoo-logo.svg';

const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
    const [step, setStep] = useState('email'); // 'email' | 'reset' | 'done'
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const onFinishEmail = async ({ email: formEmail }) => {
        setError('');
        setLoading(true);
        try {
            const { message } = await forgotPasswordAdmin({ email: formEmail });
            setEmail(formEmail);
            setSuccess(message || 'We emailed you a password reset code.');
            setStep('reset');
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const onFinishReset = async ({ newPassword }) => {
        if (otp.length !== 6) {
            setError('Please enter the full 6-digit code');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const { message } = await resetPasswordAdmin({ email, otp, newPassword });
            setSuccess(message || 'Password reset successfully.');
            setStep('done');
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const onResend = async () => {
        setError('');
        setResending(true);
        try {
            const { message } = await forgotPasswordAdmin({ email });
            setSuccess(message || 'Reset code resent');
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        } finally {
            setResending(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background:
                    'radial-gradient(circle at 50% 0%, var(--color-primary-light) 0%, var(--color-page) 55%)',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-w-sm"
            >
                <Card
                    className="rounded-2xl shadow-sm border border-gray-100"
                    styles={{ body: { padding: 32 } }}
                >
                    <div className="text-center mb-7">
                        <img src={logo} alt="Fitoo" className="h-12 w-auto mx-auto mb-4" />
                        <h1 className="text-xl font-semibold text-gray-900">Fito Admin</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {step === 'email' && 'Reset your password'}
                            {step === 'reset' && 'Enter code and new password'}
                            {step === 'done' && 'All set'}
                        </p>
                    </div>

                    {error && <Alert type="error" message={error} className="mb-4" showIcon />}
                    {success && step !== 'email' && <Alert type="success" message={success} className="mb-4" showIcon />}

                    {step === 'email' && (
                        <>
                            <Form layout="vertical" onFinish={onFinishEmail}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Email is required' },
                                        { type: 'email', message: 'Enter a valid email' },
                                    ]}
                                >
                                    <Input size="large" prefix={<MailOutlined className="text-gray-400" />} placeholder="you@Fito.com" />
                                </Form.Item>
                                <Button type="primary" size="large" htmlType="submit" block loading={loading} className="mt-2">
                                    Send Code
                                </Button>
                            </Form>

                            <p className="text-sm text-gray-500 text-center mt-6">
                                Remembered your password?{' '}
                                <Link to={ROUTES.LOGIN} className="text-primary font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}

                    {step === 'reset' && (
                        <>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                We sent a 6-digit code to <span className="text-gray-900 font-medium">{email}</span>
                            </p>

                            <div className="flex justify-center mb-6">
                                <Input.OTP length={6} value={otp} onChange={setOtp} size="large" />
                            </div>

                            <Form layout="vertical" onFinish={onFinishReset}>
                                <Form.Item
                                    name="newPassword"
                                    label="New Password"
                                    rules={[
                                        { required: true, message: 'Password is required' },
                                        { min: 8, message: 'Password must be at least 8 characters' },
                                    ]}
                                >
                                    <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder="••••••••" />
                                </Form.Item>
                                <Form.Item
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Please confirm your password' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Passwords do not match'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder="••••••••" />
                                </Form.Item>
                                <Button type="primary" size="large" htmlType="submit" block loading={loading} className="mt-2">
                                    Reset Password
                                </Button>
                            </Form>

                            <div className="text-center mt-4 text-sm text-gray-500">
                                Didn&apos;t get a code?{' '}
                                <Button
                                    type="link"
                                    size="small"
                                    className="p-0"
                                    disabled={resending || cooldown > 0}
                                    loading={resending}
                                    onClick={onResend}
                                >
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                                </Button>
                            </div>
                        </>
                    )}

                    {step === 'done' && (
                        <div className="text-center">
                            <Typography.Paragraph className="text-gray-500">
                                Your account is now inactive until a super admin reactivates it. You can sign in once that happens.
                            </Typography.Paragraph>
                            <Link to={ROUTES.LOGIN} className="text-primary font-medium">
                                Go to sign in
                            </Link>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
