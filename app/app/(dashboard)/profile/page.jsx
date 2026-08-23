'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Spin, message } from 'antd';
import { CopyOutlined, GiftOutlined, TeamOutlined, MedicineBoxOutlined, ShoppingOutlined } from '@ant-design/icons';

import useAuth from '@/hooks/useAuth';
import { getMyReferralSummary } from '@/services/referral.service';

const { Title, Paragraph, Text } = Typography;

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  return (
    <ProfilePageInner key={isAuthenticated} user={user} isAuthenticated={isAuthenticated} />
  );
}

function ProfilePageInner({ user, isAuthenticated }) {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getMyReferralSummary()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Title level={2} className="!text-white !mb-2">Your Profile</Title>
          <Paragraph className="!text-gray-400 mb-8">Sign in to view your profile and referral code.</Paragraph>
          <Button type="primary" onClick={() => router.push('/login')}>Log In</Button>
        </div>
      </div>
    );
  }

  // Read from the freshly-fetched summary, not the cached auth session — the
  // cached user object can predate this field or simply be stale.
  const referralCode = stats?.referralCode;
  const referralLink = referralCode && typeof window !== 'undefined'
    ? `${window.location.origin}/register?ref=${referralCode}`
    : '';

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard`);
  };

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Title level={2} className="!text-white !mb-2">Your Profile</Title>
        <Paragraph className="!text-gray-400 mb-8">{user?.name} · {user?.email}</Paragraph>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
              <GiftOutlined />
            </div>
            <div>
              <Title level={4} className="!text-white !mb-0">Your Referral Code</Title>
              <Text className="!text-gray-400 text-sm">Share it — when someone signs up and books a consultation, you get credit.</Text>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Spin /></div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white font-mono tracking-widest text-lg">
                  {referralCode || '—'}
                </div>
                <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(referralCode, 'Referral code')} disabled={!referralCode}>
                  Copy Code
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Text className="!text-gray-400 text-sm break-all">{referralLink}</Text>
                <Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(referralLink, 'Referral link')} disabled={!referralLink}>
                  Copy Link
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <TeamOutlined className="text-primary text-xl" />
                  <div>
                    <div className="text-white text-xl font-semibold">{stats?.totalReferred ?? 0}</div>
                    <div className="text-gray-400 text-xs">People signed up</div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <MedicineBoxOutlined className="text-primary text-xl" />
                  <div>
                    <div className="text-white text-xl font-semibold">{stats?.consultationsBooked ?? 0}</div>
                    <div className="text-gray-400 text-xs">Consultations booked</div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <ShoppingOutlined className="text-primary text-xl" />
                  <div>
                    <div className="text-white text-xl font-semibold">{stats?.productsBought ?? 0}</div>
                    <div className="text-gray-400 text-xs">Products bought</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
