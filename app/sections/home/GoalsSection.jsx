import Link from 'next/link';
import Image from 'next/image';
import { H2, Text } from '../../components/atoms/Typography';

import fatLossIcon from '../../assets/icons/fat-loss.svg';
import muscleGainIcon from '../../assets/icons/muscle-gain.svg';
import bodyRecompositionIcon from '../../assets/icons/body-recomposition.svg';
import pcosIcon from '../../assets/icons/pcos .svg';
import motherWellnessIcon from '../../assets/icons/mother-wellness.svg';
import diabeticPatientsIcon from '../../assets/icons/diabetic-Patients.svg';

// Kept in sync with CONSULTATION_GOALS ids in utils/consultationConfig.js —
// clicking a card jumps straight into that goal's step in /consultation.
// Aesthetic Goals and Competition Prep have no matching consultation flow
// step yet, so those two link to the general /consultation entry point.
const goals = [
  {
    id: 'fat-loss',
    image: fatLossIcon,
    title: 'Fat Loss',
    description: 'Lose body fat with a personalized nutrition and training plan.',
  },
  {
    id: 'muscle-gain',
    image: muscleGainIcon,
    title: 'Muscle Gain',
    description: 'Build lean muscle and strength with structured, goal-oriented coaching.',
  },
  {
    id: 'body-recomposition',
    image: bodyRecompositionIcon,
    title: 'Body Recomposition',
    description: 'Build muscle while reducing fat, guided by clinical nutrition.',
  },
  {
    id: 'pcos',
    image: pcosIcon,
    title: 'PCOS',
    description: 'Hormonal health support and nutrition guidance for managing PCOS symptoms.',
  },
  {
    id: 'diabetes',
    image: diabeticPatientsIcon,
    title: 'Diabetes Management',
    description: 'Reverse insulin resistance and improve metabolic markers with a clinical program.',
  },
  {
    id: 'mother-wellness',
    image: motherWellnessIcon,
    title: 'Busy Moms',
    description: 'Nutrition and fitness support for moms working on postpartum recovery and beyond.',
  },
];

// No 'use client' — the cards are links, not buttons with JS handlers, so this
// whole section ships zero JavaScript. Links also prefetch and work on
// middle-click, which router.push never did.
export default function GoalsSection() {
  return (
    <section className="relative py-20 section-defer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <H2>What&apos;s Your Goal?</H2>
          <Text muted className="mt-3 max-w-xl mx-auto">
            Pick your goal and we&apos;ll match you with the right program and practitioner.
          </Text>
        </div>

        {/* Reveal + hover are pure CSS now. Six framer-motion nodes with
            staggered whileInView meant six JS-driven animations competing with
            the scroll on the main thread. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal">
          {goals.map((goal) => (
            <Link
              key={goal.id}
              href={goal.noFlow ? '/consultation' : `/consultation?goal=${goal.id}`}
              className="relative block group glass border border-border-light rounded-2xl p-6 text-center hover-lift hover-lift-sm hover:border-primary/30"
            >
              <div className="flex justify-center mb-4">
                {/* Static import, so next/image knows the intrinsic size — no
                    need for the client-side skeleton wrapper in atoms/Image.
                    `unoptimized` because these are local SVG icons (each
                    already has its own baked-in dark badge background), and
                    Next's image optimizer doesn't process SVGs by default.
                    `alt=""` because the heading right below already names the
                    goal. */}
                <Image
                  src={goal.image}
                  alt=""
                  width={56}
                  height={56}
                  unoptimized
                  className="w-14 h-14 rounded-xl object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-text">{goal.title}</h3>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">{goal.description}</p>
              <div className="mt-4 text-primary text-sm font-medium md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                Start Consultation →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
