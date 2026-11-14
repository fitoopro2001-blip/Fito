'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

const QR_REFERRAL_IDS = new Set(['logo1', 'logo2', 'logo3', 'logo4', 'logo5']);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function QrReferralTracker() {
  const searchParams = useSearchParams();
  const referralId = searchParams.get('ref');
  const lastReferralId = useRef(null);

  useEffect(() => {
    if (lastReferralId.current === referralId) return;
    lastReferralId.current = referralId;

    if (!QR_REFERRAL_IDS.has(referralId)) return;

    const navigation = window.performance.getEntriesByType('navigation')[0];
    if (navigation?.type === 'reload') return;

    fetch(`${API_URL.replace(/\/+$/, '')}/referral-scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralId, eventId: window.crypto.randomUUID() }),
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`QR referral tracking failed (${response.status})`);
      })
      .catch((error) => {
        console.error('Unable to record QR referral scan:', error);
      });
  }, [referralId]);

  return null;
}
