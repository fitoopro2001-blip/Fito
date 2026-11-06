'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorageState from '../hooks/useLocalStorageState';
import {
  registerUser,
  loginUser,
  verifyOtp as verifyOtpRequest,
  resendOtp as resendOtpRequest,
  forgotPassword as forgotPasswordRequest,
  resetPassword as resetPasswordRequest,
  googleAuth as googleAuthRequest,
} from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorageState('Fitoo_app_auth', null);

  const login = useCallback(
    async ({ email, password }) => {
      const { user: apiUser, token } = await loginUser({ email, password });
      const nextUser = { ...apiUser, token };
      setUser(nextUser);
      return nextUser;
    },
    [setUser]
  );

  const register = useCallback(
    async ({ name, email, password, phone, referralCode }) =>
      registerUser({ name, email, password, phone, referralCode }),
    []
  );

  const verifyOtp = useCallback(
    async ({ email, otp }) => {
      const { user: apiUser, token } = await verifyOtpRequest({ email, otp });
      const nextUser = { ...apiUser, token };
      setUser(nextUser);
      return nextUser;
    },
    [setUser]
  );

  const resendOtp = useCallback(async ({ email }) => resendOtpRequest({ email }), []);

  const forgotPassword = useCallback(async ({ email }) => forgotPasswordRequest({ email }), []);

  const resetPassword = useCallback(
    async ({ email, otp, newPassword }) => resetPasswordRequest({ email, otp, newPassword }),
    []
  );

  const loginWithGoogle = useCallback(
    async ({ credential, referralCode }) => {
      const { user: apiUser, token } = await googleAuthRequest({ credential, referralCode });
      const nextUser = { ...apiUser, token };
      setUser(nextUser);
      return nextUser;
    },
    [setUser]
  );

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      register,
      verifyOtp,
      resendOtp,
      forgotPassword,
      resetPassword,
      loginWithGoogle,
      logout,
    }),
    [user, login, register, verifyOtp, resendOtp, forgotPassword, resetPassword, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
