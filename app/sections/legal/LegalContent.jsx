'use client';

import { useState } from 'react';
import { H2, Text } from '@/components/atoms/Typography';
import Icon from '@/components/atoms/Icon';
import { LEGAL_LAST_UPDATED } from '@/constants/legalContent';

function LegalSection({ title, body, isOpen, onToggle }) {
  return (
    <div className="border-b border-border-light last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm sm:text-base font-medium text-text">{title}</span>
        <Icon
          name="chevronDown"
          className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="pb-4">
          {Array.isArray(body) ? (
            <ul className="space-y-2">
              {body.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
                  <Icon name="check" className="w-3.5 h-3.5 text-primary mt-1 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <Text muted className="text-sm leading-relaxed">
              {body}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}

export default function LegalContent({ title, intro, sections }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <H2>{title}</H2>
          <Text muted className="mt-3 max-w-xl mx-auto">
            {intro}
          </Text>
        </div>

        <Text muted className="text-xs text-center mb-10">
          Last updated: {LEGAL_LAST_UPDATED}
        </Text>

        <div className="rounded-2xl border border-border-light bg-surface px-5">
          {sections.map((section, i) => (
            <LegalSection
              key={section.title}
              title={section.title}
              body={section.body}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex((prev) => (prev === i ? null : i))}
            />
          ))}
        </div>

        <Text muted className="text-sm text-center mt-10">
          This page summarizes our policy in plain language. Questions? Visit our{' '}
          <a href="/contact" className="text-primary hover:text-primary-hover">
            Contact page
          </a>
          .
        </Text>
      </div>
    </div>
  );
}
