import Image from 'next/image';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Tag from '@/components/atoms/Tag';
import { H1, H2, Text } from '@/components/atoms/Typography';

import fatLossImage from '@/assets/images/fat-loss.webp';
import muscleGainImage from '@/assets/images/muscle-gain.webp';
import bodyRecompositionImage from '@/assets/images/body-recomposition.webp';
import pcosImage from '@/assets/images/PCOS.webp';
import motherWellnessImage from '@/assets/images/mother-wellness-program.webp';
import diabeticPatientsImage from '@/assets/images/diabetic-patients.webp';

// Kept in sync with CONSULTATION_GOALS ids in utils/consultationConfig.js —
// booking a program jumps straight into that goal's plan-selection step in
// /consultation (see ConsultationFlow's `goal` search param handling).
const programs = [
  {
    id: 'fat-loss',
    title: 'Fat Loss',
    image: fatLossImage,
    description:
      'A personalized nutrition and training plan that strips body fat without wrecking your metabolism — built around your schedule, food preferences, and how your body actually responds. Your coach reviews your progress regularly and adjusts calories, macros, and training volume as you go, so the plan keeps working instead of stalling out after the first few weeks.',
  },
  {
    id: 'muscle-gain',
    title: 'Muscle Gain',
    image: muscleGainImage,
    description:
      'Structured, progressive coaching to build lean muscle and real strength, paired with a nutrition plan that fuels training instead of fighting it. Expect a surplus dialed to your body, a training split built around recovery capacity, and check-ins that track strength and measurements — not just the scale.',
  },
  {
    id: 'body-recomposition',
    title: 'Body Recomposition',
    image: bodyRecompositionImage,
    description:
      'Build muscle and lose fat at the same time, guided by clinical nutrition and a plan that adapts as your body composition changes. This is the slower, more technical path — calories and training load shift in small steps so you keep the muscle you have while the fat comes off underneath it.',
  },
  {
    id: 'pcos',
    title: 'PCOS Program',
    image: pcosImage,
    description:
      'Hormonal-health-first nutrition guidance to manage PCOS symptoms, improve insulin sensitivity, and support long-term cycle regularity. Your plan is built with a clinical dietitian around your specific symptoms and labs, not a generic template, with adjustments as your hormones and energy levels shift.',
  },
  {
    id: 'diabetes',
    title: 'Diabetes Management',
    image: diabeticPatientsImage,
    description:
      'A clinical nutrition program to stabilize blood sugar, improve metabolic markers, and reduce reliance on medication over time. Meal timing, carbohydrate quality, and portioning are structured around how your body handles glucose, with regular check-ins to track fasting sugar and HbA1c trends alongside your doctor.',
  },
  {
    id: 'mother-wellness',
    title: 'Busy Moms',
    image: motherWellnessImage,
    description:
      'Nutrition and fitness support for moms who\'ve already had a baby — paced to where you are in postpartum recovery and breastfeeding. Plans are stage-aware, covering energy needs, nutrient gaps, and safe, progressive movement, with a coach who adjusts as your body and goals change.',
  },
];

// No 'use client' — rows are static markup with CSS-only scroll reveal
// (see .reveal / .hover-lift in globals.css), so this ships zero extra
// JavaScript beyond Button's own client boundary.
export default function ProgramsContent() {
  return (
    <section aria-label="Our programs" className="relative pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pb-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-6">
        <div className="text-center max-w-2xl mx-auto reveal">
          <Tag variant="outline" className="mb-5">
            <Icon name="bolt" className="w-3.5 h-3.5" />
            Programs
          </Tag>
          <H1>A program for every goal.</H1>
          <Text muted className="mt-4">
            Pick the program that matches where you&apos;re starting from. Every plan is built by
            a certified coach or clinical dietitian and adjusts as you progress.
          </Text>
        </div>

        <div className="mt-16 sm:mt-20 space-y-16 sm:space-y-20">
          {programs.map((program, index) => (
            <article
              key={program.id}
              className={`reveal grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center ${
                index % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden ring-1 ring-border-light hover-lift hover-lift-sm">
                <Image
                  src={program.image}
                  alt={`${program.title} program`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 92vw, 45vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
              </div>

              <div>
                <H2>{program.title}</H2>
                <Text className="mt-3 max-w-lg">{program.description}</Text>
                <Button href={`/consultation?goal=${program.id}`} variant="primary" size="lg" className="mt-7">
                  Book This Program →
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
