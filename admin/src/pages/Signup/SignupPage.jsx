import { useEffect, useState } from 'react';
import { Form, Input, Button, Alert, Card, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { signupAdmin, verifyAdminOtp, resendAdminOtp } from '../../api/adminAuth.api';
import { ROUTES } from '../../constants/routes';
import logo from '../../assets/logo/fitoo-logo.svg';

const RESEND_COOLDOWN_SECONDS = 60;

export default function SignupPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState('form'); // 'form' | 'otp' | 'done'
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

    const onFinishSignup = async ({ name, email: formEmail, password }) => {
        setError('');
        setLoading(true);
        try {
            await signupAdmin({ name, email: formEmail, password });
            setEmail(formEmail);
            setStep('otp');
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const onFinishVerify = async () => {
        if (otp.length !== 6) {
            setError('Please enter the full 6-digit code');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const { message } = await verifyAdminOtp({ email, otp });
            setSuccess(message || 'Email verified. A super admin needs to activate your account before you can log in.');
            setStep('done');
            setTimeout(() => navigate(ROUTES.LOGIN), 3000);
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
            const { message } = await resendAdminOtp({ email });
            setSuccess(message || 'Verification code resent');
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
                            {step === 'form' ? 'Request an admin account' : 'Verify your email'}
                        </p>
                    </div>

                    {error && <Alert type="error" message={error} className="mb-4" showIcon />}
                    {success && step !== 'form' && <Alert type="success" message={success} className="mb-4" showIcon />}

                    {step === 'form' && (
                        <>
                            <Form layout="vertical" onFinish={onFinishSignup}>
                                <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
                                    <Input size="large" prefix={<UserOutlined className="text-gray-400" />} placeholder="Your name" />
                                </Form.Item>
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
                                <Form.Item
                                    name="password"
                                    label="Password"
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
                                    <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder="••••••••" />
                                </Form.Item>
                                <Button type="primary" size="large" htmlType="submit" block loading={loading} className="mt-2">
                                    Sign Up
                                </Button>
                            </Form>

                            <p className="text-sm text-gray-500 text-center mt-6">
                                Already have an account?{' '}
                                <Link to={ROUTES.LOGIN} className="text-primary font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                We sent a 6-digit code to <span className="text-gray-900 font-medium">{email}</span>
                            </p>

                            <div className="flex justify-center mb-6">
                                <Input.OTP length={6} value={otp} onChange={setOtp} size="large" />
                            </div>

                            <Button type="primary" size="large" block loading={loading} onClick={onFinishVerify}>
                                Verify
                            </Button>

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
                                Redirecting you to sign in…
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
