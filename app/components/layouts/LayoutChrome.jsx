'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/organisms/Navbar';

const AUTH_ROUTE_PREFIXES = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-otp',
    '/reset-password',
];

// Decides whether the current route gets the site header and footer.
// `whatsappCta` and `footer` arrive as already-rendered server components,
// so gating them here costs nothing in client JS.
export default function LayoutChrome({ children, whatsappCta, footer }) {
    const pathname = usePathname();
    const isAuthRoute = AUTH_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    return (
        <>
            {!isAuthRoute && <Navbar />}
            <main className="flex-1">{children}</main>
            {!isAuthRoute && whatsappCta}
            {!isAuthRoute && footer}
        </>
    );
}
