'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircleFilled,
  HomeOutlined,
  FileSearchOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import Card from '../../atoms/Card';
import Button from '../../atoms/Button';
import { H2, H5, Text } from '../../atoms/Typography';

const NEXT_STEPS = [
  {
    icon: <MedicineBoxOutlined />,
    title: 'Your dietitian reviews your details',
    description: 'Our team looks over your goals, photos and reports.',
  },
  {
    icon: <CalendarOutlined />,
    title: "You'll hear back within 24 hours",
    description: 'Our team will contact you using the details you provided.',
  },
];

export default function SuccessStep({ goal, plan, isAuthenticated }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-center py-6"
    >

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
      >
        <CheckCircleFilled className="text-6xl text-primary mb-6" />
      </motion.div>

      <H2 className="mb-3">
        Consultation Submitted!
      </H2>

      <Text muted className="max-w-md mx-auto">
        Thank you for sharing your details. Our nutritionists are reviewing
        your consultation and will get back to you with your personalized
        plan shortly.
      </Text>

      {(goal || plan) && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {goal && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-primary/10 text-primary rounded-full px-3 py-1.5">
              {goal.icon} {goal.title}
            </span>
          )}
          {plan && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-overlay text-text-secondary rounded-full px-3 py-1.5">
              {plan.label} Plan
            </span>
          )}
        </div>
      )}

      <Card className="glass border border-border-light text-left mt-8 max-w-md mx-auto">
        <H5 className="mb-4 text-center">What happens next</H5>

        <div className="flex flex-col gap-4">
          {NEXT_STEPS.map((step, index) => (
            <div key={step.title} className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-semibold">
                {index + 1}
              </span>
              <div>
                <div className="flex items-center gap-1.5 text-text font-medium text-sm">
                  {step.icon}
                  {step.title}
                </div>
                <Text muted className="text-sm mt-0.5">{step.description}</Text>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
        <Button
          size="lg"
          variant="outline"
          icon={<HomeOutlined />}
          onClick={() => router.push('/')}
        >
          Go back to Home
        </Button>

        {isAuthenticated ? (
          <Button
            size="lg"
            variant="primary"
            icon={<FileSearchOutlined />}
            onClick={() => router.push('/dashboard')}
          >
            Go to Query Dashboard
          </Button>
        ) : (
          <Text muted className="text-sm max-w-sm">
            This guest submission won’t appear in an account dashboard. You can create an account to track future
            consultations.
          </Text>
        )}
      </div>

    </motion.div>
  );
}
