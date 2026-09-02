'use client';

import Card from '../../atoms/Card';
import { H4 } from '../../atoms/Typography';
import Input from '../../atoms/Input';
import InputNumber from '../../atoms/InputNumber';
import Select from '../../atoms/Select';
import Radio from '../../atoms/Radio';
import Checkbox from '../../atoms/Checkbox';
import TextArea from '../../atoms/TextArea';

// One-on-One Home Training goal form — the goal-specific half of the FITOO
// Home Training booking form (personal info and consent live in their own
// steps). Field keys mirror FITOO_Website_Booking_Forms_Developer_Handoff.
const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm text-text-secondary font-medium">{label}</label>
    {children}
    {error && <p className="text-xs text-danger">{error}</p>}
  </div>
);

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EQUIPMENT = [
  'Dumbbells',
  'Resistance Bands',
  'Bench',
  'Treadmill',
  'Exercise Bike',
  'Barbell / Weight Plates',
  'Complete Home Gym',
  'No Equipment',
  'Other',
];

export default function HomeTrainingForm({ values, errors, touched, setFieldValue }) {
  const goalData = values || {};

  return (
    <div className="space-y-6!">

      {/* Training Location */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Training Location</H4>

        <div className="grid grid-cols-1 gap-5">
          <Field label="Area / Location in Lahore" error={touched.lahoreArea && errors.lahoreArea}>
            <Input
              value={goalData.lahoreArea || ''}
              onChange={(e) => setFieldValue('lahoreArea', e.target.value)}
              placeholder="e.g. DHA Phase 5, Johar Town"
            />
          </Field>

          <Field label="Complete Training Address" error={touched.trainingAddress && errors.trainingAddress}>
            <TextArea
              rows={3}
              value={goalData.trainingAddress || ''}
              onChange={(e) => setFieldValue('trainingAddress', e.target.value)}
              placeholder="House / street / landmark where sessions will take place"
            />
          </Field>
        </div>
      </Card>

      {/* Fitness Goal & Profile */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Fitness Goal &amp; Profile</H4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Primary Goal" error={touched.primaryGoal && errors.primaryGoal}>
            <Select
              value={goalData.primaryGoal}
              onChange={(value) => setFieldValue('primaryGoal', value)}
              placeholder="Select your primary goal"
              options={[
                { label: 'Weight Loss', value: 'weight-loss' },
                { label: 'Muscle Gain', value: 'muscle-gain' },
                { label: 'Body Recomposition', value: 'body-recomposition' },
                { label: 'Strength & Fitness', value: 'strength-fitness' },
                { label: 'General Fitness', value: 'general-fitness' },
                { label: 'Other', value: 'other' },
              ]}
            />
          </Field>

          <Field label="Current Fitness Level" error={touched.fitnessLevel && errors.fitnessLevel}>
            <Select
              value={goalData.fitnessLevel}
              onChange={(value) => setFieldValue('fitnessLevel', value)}
              placeholder="Select your fitness level"
              options={[
                { label: 'Beginner', value: 'beginner' },
                { label: 'Intermediate', value: 'intermediate' },
                { label: 'Advanced', value: 'advanced' },
              ]}
            />
          </Field>

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

          {goalData.primaryGoal === 'other' && (
            <div className="md:col-span-2">
              <Field label="Other Goal">
                <Input
                  value={goalData.primaryGoalOther || ''}
                  onChange={(e) => setFieldValue('primaryGoalOther', e.target.value)}
                />
              </Field>
            </div>
          )}
        </div>
      </Card>

      {/* Training Preferences */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Training Preferences</H4>

        <div className="grid grid-cols-1 gap-5">
          <Field label="Preferred Training Days">
            <Checkbox.Group
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              value={goalData.preferredDays}
              onChange={(value) => setFieldValue('preferredDays', value)}
              options={DAYS}
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

          <Field label="Preferred Sessions Per Week">
            <Select
              value={goalData.sessionsPerWeek}
              onChange={(value) => setFieldValue('sessionsPerWeek', value)}
              placeholder="Select sessions per week"
              options={[
                { label: '1', value: 1 },
                { label: '2', value: 2 },
                { label: '3', value: 3 },
                { label: '4', value: 4 },
                { label: '5+', value: 5 },
              ]}
            />
          </Field>

          <Field label="Available Equipment">
            <Checkbox.Group
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              value={goalData.availableEquipment}
              onChange={(value) => setFieldValue('availableEquipment', value)}
              options={EQUIPMENT}
            />
          </Field>

          {Array.isArray(goalData.availableEquipment) &&
            goalData.availableEquipment.includes('Other') && (
              <Field label="Other Equipment">
                <Input
                  value={goalData.availableEquipmentOther || ''}
                  onChange={(e) => setFieldValue('availableEquipmentOther', e.target.value)}
                />
              </Field>
            )}
        </div>
      </Card>

      {/* Health & Safety */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Health &amp; Safety</H4>

        <div className="grid grid-cols-1 gap-5">
          <Field label="Any medical condition, injury, pain, joint problem or physical limitation?">
            <Radio.Group
              value={goalData.healthLimitation}
              onChange={(e) => setFieldValue('healthLimitation', e.target.value)}
            >
              <Radio value="no">No</Radio>
              <Radio value="yes">Yes</Radio>
            </Radio.Group>
          </Field>

          {goalData.healthLimitation === 'yes' && (
            <Field label="Please explain">
              <TextArea
                rows={3}
                value={goalData.healthLimitationDetails || ''}
                onChange={(e) => setFieldValue('healthLimitationDetails', e.target.value)}
              />
            </Field>
          )}

          <Field label="Currently taking any medication that may affect exercise?">
            <Radio.Group
              value={goalData.exerciseMedication}
              onChange={(e) => setFieldValue('exerciseMedication', e.target.value)}
            >
              <Radio value="no">No</Radio>
              <Radio value="yes">Yes</Radio>
            </Radio.Group>
          </Field>

          {goalData.exerciseMedication === 'yes' && (
            <Field label="Please mention">
              <TextArea
                rows={3}
                value={goalData.exerciseMedicationDetails || ''}
                onChange={(e) => setFieldValue('exerciseMedicationDetails', e.target.value)}
              />
            </Field>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Emergency Contact Name" error={touched.emergencyContactName && errors.emergencyContactName}>
              <Input
                value={goalData.emergencyContactName || ''}
                onChange={(e) => setFieldValue('emergencyContactName', e.target.value)}
              />
            </Field>

            <Field label="Emergency Contact Number" error={touched.emergencyContactNumber && errors.emergencyContactNumber}>
              <Input
                value={goalData.emergencyContactNumber || ''}
                onChange={(e) => setFieldValue('emergencyContactNumber', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

    </div>
  );
}
