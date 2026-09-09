'use client';

import { useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { message } from 'antd';

import useConsultation from '../../../hooks/useConsultation';
import useAuth from '../../../hooks/useAuth';
import useConsultationPlans from '../../../hooks/useConsultationPlans';
import { trackEvent } from '../../../lib/fbpixel';

import GoalSelection from './GoalSelection';
import PlanSelection from './PlanSelection';

import PersonalInfoStep from '../../organisms/steps/PersonalInfoStep';
import GoalSpecificStep from '../../organisms/steps/GoalSpecificStep';
import PhotoUploadStep from '../../organisms/steps/PhotoUploadStep';
import PaymentStep from '../../organisms/steps/PaymentStep';
import SuccessStep from '../../organisms/steps/SuccessStep';

import ConsultationStepper from './ConsultationStepper';
 import NavigationButtons from './NavigationButtons';
import Button from '../../atoms/Button';
import { H3, Text } from '../../atoms/Typography';

export default function ConsultationFlow() {
  const { isAuthenticated } = useAuth();
  const consultationGoals = useConsultationPlans();

  const searchParams = useSearchParams();
  const goalParam = searchParams.get('goal');
  const initialGoal = consultationGoals.some((goal) => goal.id === goalParam)
    ? goalParam
    : null;

  const consultation = useConsultation(initialGoal);

  const flowRef = useRef(null);
  const isFirstRender = useRef(true);

  // Formik-validated steps expose { submit } via ref — handleNext triggers
  // validation through these instead of advancing directly (see below).
  const personalInfoStepRef = useRef(null);
  const goalFormStepRef = useRef(null);
  const photoStepRef = useRef(null);

  const {
    currentStep,
    selectedGoal,
    selectedPlan,
    formData,
    setSelectedGoal,
    setSelectedPlan,
    updateField,
    updateGoalData,
    next,
    previous,
    submitConsultation,
    isSubmitting,
  } = consultation;

  const selectedGoalConfig = consultationGoals.find(
    (goal) => goal.id === selectedGoal
  );

  const planStepIndex = 1;
  const personalInfoStepIndex = 2;
  const goalFormStepIndex = 3;
  const photoStepIndex = 4;

  // Steps that own a Formik instance advance themselves (via onValid, called
  // from inside their onSubmit) only once validation passes — handleNext
  // just triggers their submit and returns.
  const stepRefsByIndex = {
    [personalInfoStepIndex]: personalInfoStepRef,
    [goalFormStepIndex]: goalFormStepRef,
    [photoStepIndex]: photoStepRef,
  };

  const handleSelectGoal = (goalId) => {
    setSelectedGoal(goalId);
    next();
  };

  const steps = [
    <GoalSelection
      key="goal"
      goals={consultationGoals}
      selectedGoal={selectedGoal}
      onSelect={handleSelectGoal}
    />,

    <PlanSelection
      key="plan"
      goal={selectedGoalConfig}
      plans={selectedGoalConfig?.plans || []}
      selectedPlan={selectedPlan}
      onSelect={setSelectedPlan}
    />,

    <PersonalInfoStep
      key="personal"
      ref={personalInfoStepRef}
      formData={formData}
      updateField={updateField}
      onValid={next}
    />,

    <GoalSpecificStep
      key="goal-form"
      ref={goalFormStepRef}
      goal={selectedGoalConfig}
      formData={formData}
      updateGoalData={updateGoalData}
      onValid={next}
    />,

    <PhotoUploadStep
      key="photos"
      ref={photoStepRef}
      formData={formData}
      updateField={updateField}
      onValid={next}
    />,

    <PaymentStep
      key="payment"
      formData={formData}
      updateField={updateField}
      selectedPlan={selectedPlan}
    />,

    <SuccessStep key="success" goal={selectedGoalConfig} plan={selectedPlan} />,
  ];

  const isSuccessStep = currentStep === steps.length - 1;
  // Payment is the last step with a Next/Submit button — Success is a
  // read-only screen reached only after a successful submit.
  const isFinalFormStep = currentStep === steps.length - 2;
  const canProceed = currentStep === planStepIndex ? !!selectedPlan : true;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!flowRef.current) return;

    const top =
      flowRef.current.getBoundingClientRect().top +
      window.scrollY -
      96; // clear the fixed navbar

    window.scrollTo({ top, behavior: 'smooth' });
  }, [currentStep]);

  const handleNext = async () => {
    if (isFinalFormStep) {
      const success = await submitConsultation();
      if (success) {
        // Meta Pixel — a paid consultation was submitted.
        trackEvent('Lead', {
          content_name: selectedGoalConfig?.title || selectedGoal,
          content_category: 'consultation',
          value: selectedPlan?.discountedPrice ?? selectedPlan?.price,
          currency: 'PKR',
        });
        next();
      } else {
        message.error('Something went wrong submitting your consultation. Please try again.');
      }
      return;
    }

    const stepRef = stepRefsByIndex[currentStep];
    if (stepRef?.current) {
      // Triggers Formik's validation; onValid (= next) only fires from
      // inside that step's onSubmit once it passes.
      stepRef.current.submit();
      return;
    }

    next();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <H3>Sign in to start your consultation</H3>
        <Text muted className="mt-2">
          We tie your consultation to your account so you can track its status
          and chat with your dietitian anytime.
        </Text>
        <Link href="/login">
          <Button variant="primary" size="lg" className="mt-6">
            Log In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div ref={flowRef} className="max-w-4xl mx-auto">

      <ConsultationStepper
        currentStep={currentStep}
      />

      <div
        className="mt-8 glass border border-border-light rounded-3xl p-5 sm:p-6 md:p-8 border-t-4 shadow-xl transition-colors"
        style={{ borderTopColor: selectedGoalConfig?.color }}
      >

        {steps[currentStep]}

      </div>

      {!isSuccessStep && (
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={steps.length - 1}
          isSubmitting={isSubmitting}
          canProceed={canProceed}
          onNext={handleNext}
          onPrevious={previous}
        />
      )}

    </div>
  );
}