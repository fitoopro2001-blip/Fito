'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Icon from '../../components/atoms/Icon';
import Tag from '../../components/atoms/Tag';
import { FlaskIcon, UsersIcon, EyeIcon, TargetIcon } from '../../components/atoms/BrandIcons';
import ValueCard from '../../components/molecules/ValueCard';

const values = [
  {
    icon: FlaskIcon,
    title: 'Evidence First',
    description: 'Every formula is dosed to peer-reviewed research, not marketing trends.',
  },
  {
    icon: UsersIcon,
    title: 'One Team',
    description: 'Your coach and your supplement come from the same room, not separate companies.',
  },
  {
    icon: EyeIcon,
    title: 'Radical Transparency',
    description: 'Full ingredient panels and third-party test results, batch by batch.',
  },
  {
    icon: TargetIcon,
    title: 'Client-Led Progress',
    description: 'Plans adjust to your results, not a template everyone gets.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Values() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      id="values"
      aria-label="Our values"
      className="relative py-20 sm:py-24 lg:py-28"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
            variants={fadeUp}
            className="flex justify-center"
          >
            <Tag variant="outline" className="mb-5">
              <Icon name="bolt" className="w-3.5 h-3.5" />
              What We Stand For
            </Tag>
          </motion.div>

          <motion.h2
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
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
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.1 }}
            >
              <ValueCard icon={v.icon} title={v.title} description={v.description} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}