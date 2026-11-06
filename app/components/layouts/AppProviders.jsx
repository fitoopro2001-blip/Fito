'use client';

import { ConfigProvider } from 'antd';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { antTheme } from '@/lib/antTheme';

// All global providers in one place.
//
// GoogleOAuthProvider used to be mounted only on auth routes, which meant
// navigating from /login to anywhere else tore it down and rebuilt it. It's
// cheap and idempotent, so it wraps everything now and the tree stays stable
// across navigations — no remounting of Auth/Cart state on route change.
//
// ConfigProvider was previously only applied inside (auth) and (dashboard),
// so any antd component rendered elsewhere (Navbar's Switch/Tooltip/Popover)
// fell back to antd's default light theme instead of the site's colors.
export default function AppProviders({ children }) {
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
            <ConfigProvider theme={antTheme}>
                <AuthProvider>
                    <CartProvider>
                        <WishlistProvider>{children}</WishlistProvider>
                    </CartProvider>
                </AuthProvider>
            </ConfigProvider>
        </GoogleOAuthProvider>
    );
}
