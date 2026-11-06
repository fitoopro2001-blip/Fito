'use client';

import { Modal } from 'antd';
import Link from 'next/link';
import Icon from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Typography';
import { TERMS_SUMMARY, PRIVACY_SUMMARY } from '@/constants/legalContent';

const CONTENT = {
  terms: { title: 'Terms & Conditions', summary: TERMS_SUMMARY, href: '/terms' },
  privacy: { title: 'Privacy Policy', summary: PRIVACY_SUMMARY, href: '/privacy' },
};

// A quick-read summary for the login/signup flow — full legal text lives on
// /terms and /privacy, linked at the bottom so users don't lose their form.
export default function LegalModal({ type, open, onClose }) {
  const content = CONTENT[type];
  if (!content) return null;

  return (
    <Modal open={open} onCancel={onClose} footer={null} title={content.title} centered>
      <ul className="space-y-3 mt-2 mb-4">
        {content.summary.map((line) => (
          <li key={line} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
            <Icon name="check" className="w-3.5 h-3.5 text-primary mt-1 shrink-0" />
            {line}
          </li>
        ))}
      </ul>
      <Text muted className="text-sm">
        Read the full{' '}
        <Link href={content.href} className="text-primary hover:text-primary-hover" target="_blank">
          {content.title}
        </Link>
        .
      </Text>
    </Modal>
  );
}
