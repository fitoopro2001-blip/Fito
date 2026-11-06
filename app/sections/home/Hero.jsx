// sections/home/Hero.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Button from '../../components/atoms/Button';
import Icon from '../../components/atoms/Icon';
import Tag from '../../components/atoms/Tag';
import fatLoss from '../../assets/images/fat-loss.png';
import heroImage from "@assets/images/hero.png";

// Replace with a real product shot when available.
const supplementImage =
  'https://thumbs.dreamstime.com/b/jar-chocolate-protein-scoop-falling-powder-isolated-black-background-clipping-path-concept-fitness-supplement-191764428.jpg';
const coachingImage =
  'https://img.magnific.com/premium-photo/silhouette-woman-athletic-wear-with-red-blue-highlights-her-arms-against-black-background_1388397-2604.jpg?semt=ais_hybrid&w=740&q=80';

// ---------------------------------------------------------------------
// Local icons — self-contained, currentColor, no external dependency
// ---------------------------------------------------------------------
function ShieldIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12.4l2 2 4-4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlaskIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M10 3h4M10 3v5.4L5.6 17a2 2 0 001.8 3h9.2a2 2 0 001.8-3L14 8.4V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17.5" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 14c2.4.4 4 2 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 6.1 6.6.7-5 4.6 1.4 6.6L12 17l-5.9 3.5 1.4-6.6-5-4.6 6.6-.7L12 2.5z" />
    </svg>
  );
}

const trustSignals = [
  { Icon: UsersIcon, label: 'Clients Transformed', stat: '1,000+' },
  { Icon: FlaskIcon, label: 'Clinical & Coaching Experience', stat: '8+ Years' },
  { Icon: ShieldIcon, label: 'Home & Gym Program Options' },
  { Icon: StarIcon, label: 'Titles Won by Our Coaching Team', stat: 'Multiple' },
];

const goals = ['Fat Loss', 'Muscle Gain', 'Diabetes Management', 'PCOS & More'];

const processSteps = [
  { n: '01', label: 'Consult', desc: 'Talk to a certified coach or clinical dietitian' },
  { n: '02', label: 'Personalize', desc: 'Get a plan built around your body, goals, and lifestyle' },
  { n: '03', label: 'Transform', desc: 'Train, eat, and recover with ongoing check-ins' },
];

function GoalRotator({ reduceMotion }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return undefined;

    let id;
    // Pause the rotation whenever the tab is hidden. Otherwise this keeps
    // re-rendering (and keeps the tab awake) in a background tab forever.
    const start = () => {
      id = setInterval(() => setIndex((i) => (i + 1) % goals.length), 2200);
    };
    const stop = () => clearInterval(id);

    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduceMotion]);

  return (
    <motion.div variants={fadeUp} className="mt-5 flex items-center gap-2.5">
      <span className="text-text-muted uppercase tracking-[0.14em] text-xs font-mono">
        Plans built for
      </span>
      <span className="relative inline-block h-5 min-w-[160px] overflow-hidden">
        {reduceMotion ? (
          <span className="absolute left-0 top-0 text-primary font-semibold text-sm">
            {goals[0]}
          </span>
        ) : (
          <AnimatePresence mode="wait">
            <motion.span
              key={goals[index]}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-0 text-primary font-semibold text-sm"
            >
              {goals[index]}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

const glowShadow = { boxShadow: '0 25px 60px -20px color-mix(in srgb, var(--primary) 35%, transparent)' };

export default function Hero() {
  const reduceMotion = useReducedMotion();

  // No `useInView` gate here. The hero is above the fold by definition, so
  // waiting for an intersection callback before animating in only pushed the
  // LCP element's paint later. It animates immediately on mount instead.
  //
  // No `section-defer` either — content-visibility on the LCP element would be
  // actively harmful.
  return (
    <section
      aria-label="Introduction: nutrition coaching and premium supplements"
      className="relative min-h-screen overflow-hidden flex items-center"
    >
      {/* Background.jsx supplies the gradient, glows, and grid app-wide */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          {/* ---------------------------------------------------------- */}
          {/* Left — message, proof, and two equally-weighted CTAs       */}
          {/* ---------------------------------------------------------- */}
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={fadeUp}>
              <Tag variant="outline" className="mb-6">
                <Icon name="bolt" className="w-3.5 h-3.5" />
                One Ecosystem. Every Goal.
              </Tag>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text leading-[1.05] tracking-tight">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={reduceMotion ? { opacity: 0 } : { y: '110%' }}
                  animate={reduceMotion ? { opacity: 1 } : { y: '0%' }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                >
                  Expert Coaching.
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className={`block bg-clip-text text-transparent ${reduceMotion ? 'bg-gradient-to-r from-text to-primary' : 'bg-gradient-text'
                    }`}
                  initial={reduceMotion ? { opacity: 0 } : { y: '110%' }}
                  animate={reduceMotion ? { opacity: 1 } : { y: '0%' }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                >
                  Elite-Grade Fitoo Fuel.
                </motion.span>
              </span>
            </h1>

            <motion.p variants={fadeUp} className="mt-5 text-lg text-text-secondary max-w-md">
              Fitoo brings fitness coaching, clinical nutrition, and
              aesthetic guidance together — so you stop piecing your health
              together from five different places.
            </motion.p>

            <GoalRotator reduceMotion={reduceMotion} />

            <motion.div variants={fadeUp} className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link href="/consultation" className="sm:flex-1">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center min-w-[200px] bg-primary hover:bg-primary-hover active:bg-primary-active text-text-inverse font-semibold border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Book a Consultation
                </Button>
              </Link>
              <Link href="/programs" className="sm:flex-1">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center min-w-[200px] bg-transparent text-primary font-semibold border border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Explore Programs
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12">
              <div className="relative flex items-start justify-between gap-4">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.9, delay: 0.9, ease: 'easeOut' }}
                  style={{ transformOrigin: 'left' }}
                  className="absolute top-[13px] left-[13px] right-[13px] h-px bg-gradient-to-r from-primary/50 via-border to-transparent hidden sm:block"
                />
                {processSteps.map((step, i) => (
                  <motion.div
                    key={step.n}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.95 + i * 0.15 }}
                    className="relative flex-1 min-w-0"
                  >
                    <div className="w-7 h-7 rounded-full bg-card border border-primary/40 flex items-center justify-center text-[11px] font-mono text-primary relative z-10">
                      {step.n}
                    </div>
                    <div className="mt-3 text-sm font-semibold text-text">{step.label}</div>
                    <div className="text-xs text-text-muted mt-0.5 pr-2">{step.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-border-light pt-6"
            >
              {trustSignals.map(({ Icon: SignalIcon, label, stat }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                    <SignalIcon className="w-4 h-4" />
                  </span>
                  <span className="text-sm text-text-secondary">
                    {stat && <span className="text-text font-semibold font-mono mr-1.5">{stat}</span>}
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ---------------------------------------------------------- */}
          {/* Right — the diptych: coaching + supplements, one seam      */}
          {/* ---------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full max-w-[420px] mx-auto lg:max-w-none"
          >
            {/* Top panel — coaching */}
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 56 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              style={glowShadow}
              className="relative aspect-[4/3] w-[86%] ml-auto rounded-[28px] overflow-hidden ring-1 ring-border-light bg-black"
            >
              {/* LCP candidate: `priority` preloads it, `sizes` keeps the phone
                  from downloading the desktop-width file, and dropping
                  `unoptimized` lets Next serve AVIF/WebP at the right size. */}
              <Image
                src={heroImage}
                alt="Certified nutrition coach reviewing a personalized plan with a client"
                fill
                sizes="(max-width: 1024px) 92vw, 45vw"
                placeholder="blur"
                className="object-contain"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />
            </motion.div>

            {/* Seam — where the two disciplines meet */}
            <div className="relative h-0 flex items-center justify-center z-20">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 1.05, ease: 'easeOut' }}
                style={{ transformOrigin: 'center' }}
                className="absolute w-[68%] h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="relative z-10 bg-card border border-primary/30 rounded-full px-4 py-1.5 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-primary font-mono whitespace-nowrap"
              >
                One Ecosystem
              </motion.div>
            </div>

            {/* Bottom panel — supplements */}
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -56 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              style={glowShadow}
              className="relative aspect-[4/3] w-[86%] -mt-8 rounded-[28px] overflow-hidden ring-1 ring-border-light"
            >
              {/* Also above the fold, so it gets a high fetch priority too —
                  it's remote, hence still unoptimized. */}
              <Image
                src={supplementImage}
                alt="Premium lab-tested protein and supplement products"
                fill
                unoptimized
                sizes="(max-width: 1024px) 92vw, 45vw"
                fetchPriority="high"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/0 to-black/10" />
            </motion.div>

            {/* Annotations — captions, not badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="absolute top-[9%] left-0 flex items-center gap-2 bg-card border border-border-light rounded-full pl-1.5 pr-3.5 py-1.5 shadow-lg"
            >
              <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                <ShieldIcon className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs text-text font-medium whitespace-nowrap">
                1:1 Certified Coaching
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.55 }}
              className="absolute bottom-[6%] right-0 flex items-center gap-2 bg-card border border-border-light rounded-full pl-1.5 pr-3.5 py-1.5 shadow-lg"
            >
              <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                <FlaskIcon className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs text-text font-medium whitespace-nowrap">
                Third-Party Lab Tested
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}