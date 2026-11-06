'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { META_PIXEL_ID } from '@/lib/fbpixel';

// The App Router does a soft navigation between routes — no full document
// load — so the pixel's built-in PageView only fires on the very first paint.
// This effect re-fires it on every subsequent route change. It skips its own
// first run so the landing page isn't counted twice (the inline snippet
// already tracked it).
function RouteChangePageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (typeof window.fbq === 'function') window.fbq('track', 'PageView');
  }, [pathname, searchParams]);

  return null;
}

// Base Meta Pixel, mounted once from the root layout. Loads after the page is
// interactive so it never blocks first paint. Renders nothing when
// NEXT_PUBLIC_META_PIXEL_ID is unset, so local dev without the env var is
// unaffected.
export default function MetaPixel() {
  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* Meta's required no-JS fallback pixel — next/image can't render
            inside <noscript>, so the native tag is intentional here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
      <Suspense fallback={null}>
        <RouteChangePageView />
      </Suspense>
    </>
  );
}
