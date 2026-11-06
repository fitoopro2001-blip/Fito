'use client';

import { motion } from 'framer-motion';
import {
  FlagOutlined,
  CrownOutlined,
  UserOutlined,
  FormOutlined,
  CameraOutlined,
  CreditCardOutlined,
  CheckOutlined,
} from '@ant-design/icons';

const steps = [
  { label: 'Goal', icon: <FlagOutlined /> },
  { label: 'Plan', icon: <CrownOutlined /> },
  { label: 'Personal Info', icon: <UserOutlined /> },
  { label: 'Questions', icon: <FormOutlined /> },
  { label: 'Photos', icon: <CameraOutlined /> },
  { label: 'Payment', icon: <CreditCardOutlined /> },
  { label: 'Submit', icon: <CheckOutlined /> },
];

export default function ConsultationStepper({
  currentStep,
}) {
  return (
    <div className="w-full mb-10">

      <div className="flex items-center justify-between">

        {steps.map((step, index) => {

          const completed = index < currentStep;
          const active = index === currentStep;

          return (
            <div
              key={step.label}
              className="flex items-center flex-1"
            >

              <motion.div
                initial={false}
                animate={{ scale: active ? 1.12 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full
                  flex items-center justify-center
                  text-sm sm:text-base
                  border
                  shrink-0

                  ${
                    completed || active
                    ? "bg-primary text-text-inverse border-primary shadow-[0_0_0_4px_var(--color-primary-light)]"
                    : "bg-overlay text-text-muted border-border-light"
                  }
                `}
              >
                {completed ? <CheckOutlined /> : step.icon}
              </motion.div>


              {index !== steps.length - 1 && (
                <div className="relative h-[2px] flex-1 mx-1.5 sm:mx-2 bg-overlay-medium overflow-hidden rounded-full">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full"
                    initial={false}
                    animate={{ width: index < currentStep ? '100%' : '0%' }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
              )}

            </div>
          );
        })}

      </div>


      <div className="hidden sm:flex justify-between mt-3">

        {steps.map((step, index)=>(
          <span
            key={step.label}
            className={`
              text-xs
              text-center
              flex-1
              transition-colors

              ${index === currentStep ? 'text-primary font-medium' : 'text-text-muted'}
            `}
          >
            {step.label}
          </span>
        ))}

      </div>

      <div className="sm:hidden mt-3 text-center">
        <span className="text-xs font-medium text-primary">
          {steps[currentStep].label}
        </span>
        <span className="text-xs text-text-muted">
          {" "}· Step {currentStep + 1} of {steps.length}
        </span>
      </div>

    </div>
  );
}
