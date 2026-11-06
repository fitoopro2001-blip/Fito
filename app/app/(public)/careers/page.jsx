'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { H2, Text } from '../../../components/atoms/Typography';
import Button from '../../../components/atoms/Button';
import Icon from '../../../components/atoms/Icon';
import Spinner from '../../../components/atoms/Spinner';
import CareerApplyModal from '../../../components/organisms/careers/CareerApplyModal';
import useApiResource from '../../../hooks/useApiResource';
import { getCareers } from '../../../services/career.service';

export default function CareersPage() {
  const { data: apiCareers, loading, error, reload } = useApiResource(getCareers, [], { fallback: [] });
  const careers = apiCareers ?? [];
  const [applyingTo, setApplyingTo] = useState(null);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <H2>Careers at Fitoo</H2>
          <Text muted className="mt-2 max-w-xl mx-auto">
            Help us build a healthier future. Explore our open roles below.
          </Text>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="w-8 h-8" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Text className="text-danger">{error}</Text>
            <Button variant="outline" onClick={reload} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : careers.length > 0 ? (
          <div className="flex flex-col gap-5">
            {careers.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass border border-border-light rounded-2xl p-6 sm:p-8"
              >
                <h3 className="text-text font-semibold text-xl">{job.title}</h3>
                <p className="text-sm text-text-muted mt-3 whitespace-pre-wrap">{job.description}</p>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <a href={job.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" size="md" icon={<Icon name="arrowRight" className="w-4 h-4" />} iconPosition="right">
                      Apply Now
                    </Button>
                  </a>
                  <Button variant="outline" size="md" onClick={() => setApplyingTo(job)}>
                    Quick Apply
                  </Button>
                  <a href={`mailto:${job.email}`}>
                    <Button variant="ghost" size="md" icon={<Icon name="mail" className="w-4 h-4" />}>
                      {job.email}
                    </Button>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Text muted>No open positions right now — check back soon.</Text>
          </div>
        )}
      </div>

      <CareerApplyModal open={!!applyingTo} onClose={() => setApplyingTo(null)} career={applyingTo} />
    </div>
  );
}
