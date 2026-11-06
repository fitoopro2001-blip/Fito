'use client';

import { useState } from 'react';
import { H2, H4, Text } from '@/components/atoms/Typography';
import Icon from '@/components/atoms/Icon';
import { FAQ_CATEGORIES } from '@/constants/faqContent';

function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-border-light last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm sm:text-base font-medium text-text">{question}</span>
        <Icon
          name="chevronDown"
          className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <Text muted className="pb-4 text-sm leading-relaxed">
          {answer}
        </Text>
      )}
    </div>
  );
}

export default function FaqContent() {
  const [openKey, setOpenKey] = useState(`${FAQ_CATEGORIES[0]?.category}-0`);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <H2>Frequently Asked Questions</H2>
          <Text muted className="mt-3 max-w-xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Reach out on our{' '}
            <a href="/contact" className="text-primary hover:text-primary-hover">
              Contact page
            </a>
            .
          </Text>
        </div>

        <div className="flex flex-col gap-10">
          {FAQ_CATEGORIES.map((group) => (
            <div key={group.category}>
              <H4 className="mb-2">{group.category}</H4>
              <div className="rounded-2xl border border-border-light bg-surface px-5">
                {group.questions.map((qa, i) => {
                  const key = `${group.category}-${i}`;
                  return (
                    <FaqItem
                      key={key}
                      question={qa.question}
                      answer={qa.answer}
                      isOpen={openKey === key}
                      onToggle={() => setOpenKey((prev) => (prev === key ? null : key))}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
