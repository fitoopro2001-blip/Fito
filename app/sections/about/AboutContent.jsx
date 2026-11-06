'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Icon from '@/components/atoms/Icon';
import Tag from '@/components/atoms/Tag';
import SocialLinks from '@/components/atoms/SocialLinks';
import { TEAM_MEMBERS as teamMembers, ABOUT_STATS as stats } from '@/constants/aboutContent';
import coachingImage from '@/assets/images/About 1.webp';
import labImage from '@/assets/images/About 2.webp';

// ---------------------------------------------------------------------
// Local icons — self-contained, currentColor
// ---------------------------------------------------------------------
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

function EyeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TargetIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

const values = [
  { icon: FlaskIcon, title: 'Evidence First', description: 'Every formula is dosed to peer-reviewed research, not marketing trends.' },
  { icon: UsersIcon, title: 'One Team', description: 'Your coach and your supplement come from the same room, not separate companies.' },
  { icon: EyeIcon, title: 'Radical Transparency', description: 'Full ingredient panels and third-party test results, batch by batch.' },
  { icon: TargetIcon, title: 'Client-Led Progress', description: 'Plans adjust to your results, not a template everyone gets.' },
];

// ---------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const glowShadow = { boxShadow: '0 25px 60px -20px color-mix(in srgb, var(--primary) 30%, transparent)' };

// Reusable image-left/right + content layout, local to this file.
function Row({ image, imageAlt, reverse, fit = 'cover', children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center ${reverse ? 'md:[&>*:first-child]:order-2' : ''
        }`}
    >
      <motion.div
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        variants={fadeUp}
        style={glowShadow}
        className={`relative aspect-[4/5] sm:aspect-[4/3] rounded-3xl overflow-hidden ring-1 ring-border-light ${fit === 'contain' ? 'bg-black' : ''
          }`}
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          unoptimized
          className={fit === 'contain' ? 'object-contain' : 'object-cover'}
        />
      </motion.div>

      <motion.div initial="hidden" animate={isInView ? 'show' : 'hidden'} variants={fadeUp}>
        {children}
      </motion.div>
    </div>
  );
}

export default function AboutContent() {
  const valuesRef = useRef(null);
  const valuesInView = useInView(valuesRef, { once: true, amount: 0.2 });

  const founderRef = useRef(null);
  const founderInView = useInView(founderRef, { once: true, amount: 0.3 });

  return (
    <section
      id="about"
      aria-label="About us"
      className="relative py-20 sm:py-24 lg:py-28 bg-background-secondary/40 border-t border-b border-border-light"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-28">
        {/* Row 1 — image left, content right */}
        <Row image={coachingImage} imageAlt="Certified coach guiding a client">
          <Tag variant="outline" className="mb-5">
            <Icon name="bolt" className="w-3.5 h-3.5" />
            One Team. One Standard.
          </Tag>

          {/* Promoted from h2 to h1: this is the page's leading statement and
              the page previously had no h1 at all. Styling is unchanged. */}
          <h1 className="text-3xl sm:text-4xl font-bold text-text leading-tight tracking-tight">
            We built what we
            <span className="bg-clip-text text-transparent bg-gradient-text">
              {' '}couldn&apos;t find.
            </span>
          </h1>

          <p className="mt-4 text-text-secondary max-w-md">
            Most brands make you choose between a coach who understands your
            body and a supplement you can actually trust. We&apos;re run by
            the same certified coaches who formulate what&apos;s on the shelf.
          </p>

          <ul className="mt-6 space-y-3">
            {['Coaches who also formulate the product', 'Nothing ships until our own team has used it'].map(
              (item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <Icon name="check" className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              )
            )}
          </ul>
        </Row>

        {/* Row 2 — image right, content left */}
        <Row image={labImage} imageAlt="In-house formulation lab" reverse fit="contain">
          <h2 className="text-3xl sm:text-4xl font-bold text-text leading-tight tracking-tight">
            Radically transparent,
            <br />
            by default.
          </h2>

          <p className="mt-4 text-text-secondary max-w-md">
            Every formula is third-party lab tested, batch by batch, with
            full ingredient panels published — not buried in fine print.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-text font-mono">{s.value}</div>
                <div className="text-xs uppercase tracking-[0.12em] text-text-muted mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

        </Row>

        {/* Team — two founders and the lead nutritionist */}
        <div ref={founderRef}>
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate={founderInView ? 'show' : 'hidden'}
              variants={fadeUp}
              className="flex justify-center"
            >
              <Tag variant="outline" className="mb-5">
                <Icon name="bolt" className="w-3.5 h-3.5" />
                Led By Example
              </Tag>
            </motion.div>

            <motion.h2
              initial="hidden"
              animate={founderInView ? 'show' : 'hidden'}
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold text-text leading-tight tracking-tight"
            >
              The people behind the standard.
            </motion.h2>

            <motion.p
              initial="hidden"
              animate={founderInView ? 'show' : 'hidden'}
              variants={fadeUp}
              transition={{ delay: 0.2 }}
              className="mt-4 text-text-secondary"
            >
              Founded by two coaches who got tired of recommending products
              they couldn&apos;t stand behind, and built alongside a lead
              nutritionist who makes sure every formula earns its place on
              the label.
            </motion.p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                animate={founderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
              >
                <div
                  style={glowShadow}
                  className="relative aspect-[4/5] rounded-3xl overflow-hidden ring-1 ring-border-light"
                >
                  <Image src={member.image} alt={`${member.name} portrait`} fill unoptimized className="object-cover" />
                  <SocialLinks links={member.social} name={member.name} />
                </div>

                <div className="mt-4 text-center sm:text-left">
                  <div className="text-sm font-semibold text-text">{member.name}</div>
                  <div className="text-xs text-text-muted font-mono uppercase tracking-wide mt-0.5">
                    {member.title}
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                    {member.credentials.map((c) => (
                      <span
                        key={c}
                        className="text-[11px] font-mono uppercase tracking-wide text-primary border border-primary/30 rounded-full px-2.5 py-1"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Values grid */}
        <div ref={valuesRef}>
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial="hidden" animate={valuesInView ? 'show' : 'hidden'} variants={fadeUp} className="flex justify-center">
              <Tag variant="outline" className="mb-5">
                <Icon name="bolt" className="w-3.5 h-3.5" />
                What We Stand For
              </Tag>
            </motion.div>

            <motion.h2
              initial="hidden"
              animate={valuesInView ? 'show' : 'hidden'}
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold text-text tracking-tight"
            >
              Four rules we don&apos;t break.
            </motion.h2>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.25 + i * 0.1 }}
                className="text-center sm:text-left"
              >
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary mb-4">
                  <v.icon className="w-5 h-5" />
                </span>
                <h3 className="text-text font-semibold text-lg">{v.title}</h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}