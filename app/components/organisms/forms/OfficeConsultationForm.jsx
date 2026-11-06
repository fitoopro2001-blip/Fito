'use client';

import Card from '../../atoms/Card';
import { H4 } from '../../atoms/Typography';
import Input from '../../atoms/Input';
import InputNumber from '../../atoms/InputNumber';
import Select from '../../atoms/Select';
import Radio from '../../atoms/Radio';
import TextArea from '../../atoms/TextArea';
import DatePicker from '../../atoms/DatePicker';

// Personalized Office Consultation goal form — the goal-specific half of the
// FITOO Office Consultation booking form (personal info and the client
// declaration live in their own steps). Field keys mirror
// FITOO_Website_Booking_Forms_Developer_Handoff.
const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm text-text-secondary font-medium">{label}</label>
    {children}
    {error && <p className="text-xs text-danger">{error}</p>}
  </div>
);

const YesNo = ({ value, onChange }) => (
  <Radio.Group value={value} onChange={(e) => onChange(e.target.value)}>
    <Radio value="no">No</Radio>
    <Radio value="yes">Yes</Radio>
  </Radio.Group>
);

export default function OfficeConsultationForm({ values, errors, touched, setFieldValue }) {
  const goalData = values || {};

  return (
    <div className="space-y-6!">

      {/* Consultation Profile */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Consultation Profile</H4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="City" error={touched.city && errors.city}>
            <Input
              value={goalData.city || ''}
              onChange={(e) => setFieldValue('city', e.target.value)}
            />
          </Field>

          <Field label="Consultation Required For" error={touched.consultationType && errors.consultationType}>
            <Select
              value={goalData.consultationType}
              onChange={(value) => setFieldValue('consultationType', value)}
              placeholder="Select consultation type"
              options={[
                { label: 'Weight Loss', value: 'weight-loss' },
                { label: 'Muscle Gain', value: 'muscle-gain' },
                { label: 'Body Recomposition', value: 'body-recomposition' },
                { label: 'Diabetes Management', value: 'diabetes-management' },
                { label: 'PCOS Management', value: 'pcos-management' },
                { label: 'Nutrition Consultation', value: 'nutrition' },
                { label: 'Fitness Consultation', value: 'fitness' },
                { label: 'Fitness + Nutrition Consultation', value: 'fitness-nutrition' },
                { label: 'General Health & Lifestyle', value: 'general-health' },
                { label: 'Other', value: 'other' },
              ]}
            />
          </Field>

          {goalData.consultationType === 'other' && (
            <div className="md:col-span-2">
              <Field label="Other Consultation Type">
                <Input
                  value={goalData.consultationTypeOther || ''}
                  onChange={(e) => setFieldValue('consultationTypeOther', e.target.value)}
                />
              </Field>
            </div>
          )}

          <Field label="Current Weight (kg)">
            <InputNumber
              value={goalData.currentWeight}
              onChange={(value) => setFieldValue('currentWeight', value)}
            />
          </Field>

          <Field label="Height (cm)">
            <InputNumber
              value={goalData.height}
              onChange={(value) => setFieldValue('height', value)}
            />
          </Field>

          <Field label="Target Weight (kg)">
            <InputNumber
              value={goalData.targetWeight}
              onChange={(value) => setFieldValue('targetWeight', value)}
            />
          </Field>

          <Field label="Current Activity Level" error={touched.activityLevel && errors.activityLevel}>
            <Select
              value={goalData.activityLevel}
              onChange={(value) => setFieldValue('activityLevel', value)}
              placeholder="Select activity level"
              options={[
                { label: 'Sedentary', value: 'sedentary' },
                { label: 'Lightly Active', value: 'light' },
                { label: 'Moderately Active', value: 'moderate' },
                { label: 'Highly Active', value: 'active' },
              ]}
            />
          </Field>

          <Field label="Do You Currently Exercise?">
            <YesNo
              value={goalData.currentlyExercises}
              onChange={(v) => setFieldValue('currentlyExercises', v)}
            />
          </Field>
        </div>

        {goalData.currentlyExercises === 'yes' && (
          <div className="mt-5">
            <Field label="Mention Your Current Routine">
              <TextArea
                rows={3}
                value={goalData.currentRoutine || ''}
                onChange={(e) => setFieldValue('currentRoutine', e.target.value)}
              />
            </Field>
          </div>
        )}
      </Card>

      {/* Health Information */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Health Information</H4>

        <div className="grid grid-cols-1 gap-5">
          <Field label="Do You Have Any Medical Condition?">
            <YesNo
              value={goalData.medicalCondition}
              onChange={(v) => setFieldValue('medicalCondition', v)}
            />
          </Field>
          {goalData.medicalCondition === 'yes' && (
            <Field label="Please explain">
              <TextArea
                rows={3}
                value={goalData.medicalConditionDetails || ''}
                onChange={(e) => setFieldValue('medicalConditionDetails', e.target.value)}
              />
            </Field>
          )}

          <Field label="Any Existing Injury, Pain or Physical Limitation?">
            <YesNo
              value={goalData.injuryLimitation}
              onChange={(v) => setFieldValue('injuryLimitation', v)}
            />
          </Field>
          {goalData.injuryLimitation === 'yes' && (
            <Field label="Please explain">
              <TextArea
                rows={3}
                value={goalData.injuryLimitationDetails || ''}
                onChange={(e) => setFieldValue('injuryLimitationDetails', e.target.value)}
              />
            </Field>
          )}

          <Field label="Currently Taking Any Medication or Supplements?">
            <YesNo
              value={goalData.medicationSupplements}
              onChange={(v) => setFieldValue('medicationSupplements', v)}
            />
          </Field>
          {goalData.medicationSupplements === 'yes' && (
            <Field label="Please mention">
              <TextArea
                rows={3}
                value={goalData.medicationSupplementsDetails || ''}
                onChange={(e) => setFieldValue('medicationSupplementsDetails', e.target.value)}
              />
            </Field>
          )}
        </div>
      </Card>

      {/* Consultation Details */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Consultation Details</H4>

        <div className="grid grid-cols-1 gap-5">
          <Field label="Main Concern / Reason for Consultation" error={touched.mainConcern && errors.mainConcern}>
            <TextArea
              rows={3}
              value={goalData.mainConcern || ''}
              onChange={(e) => setFieldValue('mainConcern', e.target.value)}
            />
          </Field>

          <Field label="How Long Have You Been Facing This Concern?">
            <Select
              value={goalData.concernDuration}
              onChange={(value) => setFieldValue('concernDuration', value)}
              placeholder="Select duration"
              options={[
                { label: 'Less Than 3 Months', value: 'lt-3-months' },
                { label: '3-6 Months', value: '3-6-months' },
                { label: '6-12 Months', value: '6-12-months' },
                { label: '1-3 Years', value: '1-3-years' },
                { label: 'More Than 3 Years', value: 'gt-3-years' },
              ]}
            />
          </Field>

          <Field label="Previously Followed a Diet or Fitness Program?">
            <YesNo
              value={goalData.previousProgram}
              onChange={(v) => setFieldValue('previousProgram', v)}
            />
          </Field>
          {goalData.previousProgram === 'yes' && (
            <Field label="Briefly explain">
              <TextArea
                rows={3}
                value={goalData.previousProgramDetails || ''}
                onChange={(e) => setFieldValue('previousProgramDetails', e.target.value)}
              />
            </Field>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Preferred Consultation Date" error={touched.preferredDate && errors.preferredDate}>
              <DatePicker
                value={goalData.preferredDate}
                onChange={(date) => setFieldValue('preferredDate', date ? date.toISOString() : null)}
              />
            </Field>

            <Field label="Preferred Time">
              <Radio.Group
                value={goalData.preferredTime}
                onChange={(e) => setFieldValue('preferredTime', e.target.value)}
              >
                <Radio value="morning">Morning</Radio>
                <Radio value="afternoon">Afternoon</Radio>
                <Radio value="evening">Evening</Radio>
              </Radio.Group>
            </Field>
          </div>

          <Field label="How Soon Would You Like to Start Your Program?">
            <Select
              value={goalData.startTimeline}
              onChange={(value) => setFieldValue('startTimeline', value)}
              placeholder="Select a timeline"
              options={[
                { label: 'Immediately', value: 'immediately' },
                { label: 'Within 7 Days', value: 'within-7-days' },
                { label: 'Within 2 Weeks', value: 'within-2-weeks' },
                { label: 'Within 1 Month', value: 'within-1-month' },
                { label: 'Just Exploring', value: 'exploring' },
              ]}
            />
          </Field>

          <Field label="Additional Information">
            <TextArea
              rows={3}
              value={goalData.additionalInformation || ''}
              onChange={(e) => setFieldValue('additionalInformation', e.target.value)}
            />
          </Field>
        </div>
      </Card>

    </div>
  );
}
