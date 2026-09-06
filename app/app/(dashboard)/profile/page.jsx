'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Spin, Tag, Empty, message } from 'antd';
import { CopyOutlined, GiftOutlined, TeamOutlined, MedicineBoxOutlined, ShoppingOutlined, TagsOutlined } from '@ant-design/icons';

import useAuth from '@/hooks/useAuth';
import { getMyReferralSummary } from '@/services/referral.service';
import { getMyPromoCodes } from '@/services/promoCode.service';

const PROMO_STATUS_COLOR = { active: 'green', used: 'default', expired: 'default', revoked: 'red' };
const PROMO_STATUS_LABEL = {
  active: 'Ready to use',
  used: 'Used',
  expired: 'Expired',
  revoked: 'No longer valid',
};

const formatDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '—');

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
  const [promos, setPromos] = useState(null);
  const [loading, setLoading] = useState(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    // allSettled, not all — a failure on either panel shouldn't blank the other.
    Promise.allSettled([getMyReferralSummary(), getMyPromoCodes()])
      .then(([summary, promoCodes]) => {
        if (cancelled) return;
        if (summary.status === 'fulfilled') setStats(summary.value);
        if (promoCodes.status === 'fulfilled') setPromos(promoCodes.value);
      })
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

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
              <TagsOutlined />
            </div>
            <div>
              <Title level={4} className="!text-white !mb-0">Your Promo Codes</Title>
              <Text className="!text-gray-400 text-sm">
                Every verified signup from your referral code earns you one. Each works once and
                expires the moment it&apos;s used
                {promos?.shareable === false && ', and only on this account'}.
              </Text>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Spin /></div>
          ) : promos?.promoCodes?.length ? (
            <div className="flex flex-col gap-3">
              {promos.promoCodes.map((promo) => {
                const usable = promo.status === 'active';
                return (
                  <div
                    key={promo.id}
                    className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
                  >
                    <div>
                      <div className={`font-mono tracking-widest text-lg ${usable ? 'text-white' : 'text-gray-500 line-through'}`}>
                        {promo.code}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {promo.discountPercent}% off
                        {promo.minOrderTotal > 0 && ` · min order PKR ${promo.minOrderTotal}`}
                        {usable
                          ? ` · expires ${formatDate(promo.expiresAt)}`
                          : promo.status === 'used'
                            ? ` · used ${formatDate(promo.usedAt)}${promo.usedOnOrder ? ` on #${promo.usedOnOrder.orderNumber}` : ''}`
                            : ` · expired ${formatDate(promo.expiresAt)}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag color={PROMO_STATUS_COLOR[promo.status]}>{PROMO_STATUS_LABEL[promo.status]}</Tag>
                      {usable && (
                        <Button
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(promo.code, 'Promo code')}
                        >
                          Copy
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-400">
                  No promo codes yet — share your referral code above to earn one.
                </span>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
