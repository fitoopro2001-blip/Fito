'use client';

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from '@ant-design/icons';

import Button from '../../atoms/Button';

export default function NavigationButtons({
  currentStep,
  totalSteps,
  canProceed = true,
  isSubmitting = false,
  onPrevious,
  onNext,
}) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="mt-10 border-t border-border pt-6">

      <div className="flex items-center justify-between gap-3">

        <Button
          variant="outline"
          size="lg"
          disabled={isFirstStep}
          icon={<ArrowLeftOutlined />}
          onClick={onPrevious}
        >
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {isLastStep ? (
          <Button
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={!canProceed}
            icon={<CheckOutlined />}
            onClick={onNext}
          >
            Submit Consultation
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            disabled={!canProceed}
            icon={<ArrowRightOutlined />}
            iconPosition="right"
            onClick={onNext}
          >
            Continue
          </Button>
        )}
      </div>

      <div className="text-text-muted text-xs sm:text-sm text-center mt-4">
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  );
}
