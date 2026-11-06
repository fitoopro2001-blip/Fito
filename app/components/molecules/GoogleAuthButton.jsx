'use client';

import { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { message } from 'antd';
import useAuth from '@/hooks/useAuth';

// Google's button needs an explicit pixel width, so we measure our own
// wrapper and keep it in sync with the container instead of hardcoding one.
export default function GoogleAuthButton({ onAuthenticated, referralCode }) {
  const wrapperRef = useRef(null);
  const [width, setWidth] = useState(320);
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    const updateWidth = () => {
      if (wrapperRef.current) setWidth(wrapperRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle({ credential: credentialResponse.credential, referralCode });
      onAuthenticated?.();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <div ref={wrapperRef} className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => message.error('Google sign-in failed. Please try again.')}
        width={width}
        theme="outline"
        size="large"
        text="continue_with"
      />
    </div>
  );
}
