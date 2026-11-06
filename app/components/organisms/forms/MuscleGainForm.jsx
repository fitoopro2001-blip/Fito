'use client';

import Card from '../../atoms/Card';
import { H4 } from '../../atoms/Typography';
import InputNumber from '../../atoms/InputNumber';
import Select from '../../atoms/Select';
import Slider from '../../atoms/Slider';
import Radio from '../../atoms/Radio';
import TextArea from '../../atoms/TextArea';

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm text-text-secondary font-medium">{label}</label>
    {children}
    {error && <p className="text-xs text-danger">{error}</p>}
  </div>
);

export default function MuscleGainForm({
  values,
  errors,
  touched,
  setFieldValue,
}) {
  const goalData = values || {};

  return (
    <div className="space-y-6!">

      {/* Goal */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Muscle Building Goal (پٹھے بنانے کا ہدف)</H4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Target Weight (kg) (ہدف وزن)" error={touched.targetWeight && errors.targetWeight}>
            <InputNumber
              value={goalData.targetWeight}
              onChange={(value) =>
                setFieldValue("targetWeight", value)
              }
            />
          </Field>

          <Field label="Primary Goal (بنیادی مقصد)">
            <Radio.Group
              value={goalData.primaryGoal}
              onChange={(e) =>
                setFieldValue("primaryGoal", e.target.value)
              }
            >
              <Radio value="lean-muscle">Lean Muscle</Radio>
              <Radio value="strength">Strength</Radio>
              <Radio value="bulk">Bulk Up</Radio>
            </Radio.Group>
          </Field>
        </div>
      </Card>

      {/* Training */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Training (تربیت)</H4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field label="Training Experience (تربیتی تجربہ)" error={touched.trainingExperience && errors.trainingExperience}>
            <Select
              value={goalData.trainingExperience}
              onChange={(value)=>
                setFieldValue("trainingExperience", value)
              }
              placeholder="Select training experience"
              options={[
                { label: "Beginner", value: "beginner" },
                { label: "Intermediate", value: "intermediate" },
                { label: "Advanced", value: "advanced" },
              ]}
            />
          </Field>

          <Field label="Workout Days / Week (ورزش کے دن / ہفتہ)">
            <Slider
              min={1}
              max={7}
              value={goalData.workoutDays}
              onChange={(value)=>
                setFieldValue("workoutDays", value)
              }
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Do you have gym access? (کیا آپ کو جم تک رسائی ہے؟)" error={touched.gymAccess && errors.gymAccess}>
              <Select
                value={goalData.gymAccess}
                onChange={(value)=>
                  setFieldValue("gymAccess", value)
                }
                placeholder="Select an option"
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                  { label: "Home Gym", value: "home" },
                ]}
              />
            </Field>
          </div>

        </div>
      </Card>

      {/* Nutrition */}
      <Card className="glass border border-border-light">

        <H4 className="mb-5">Nutrition (غذائیت)</H4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field label="Meals Per Day (روزانہ کھانوں کی تعداد)">
            <Select
              value={goalData.mealsPerDay}
              onChange={(value)=>
                setFieldValue("mealsPerDay", value)
              }
              placeholder="Select meals per day"
              options={[
                { label: "2", value: 2 },
                { label: "3", value: 3 },
                { label: "4", value: 4 },
                { label: "5+", value: 5 },
              ]}
            />
          </Field>

          <Field label="Protein Intake (g/day) (پروٹین کی مقدار)">
            <InputNumber
              value={goalData.protein}
              onChange={(value)=>
                setFieldValue("protein", value)
              }
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Water Intake (Litres) (پانی کی مقدار)">
              <Slider
                min={1}
                max={6}
                step={0.5}
                value={goalData.water}
                onChange={(value)=>
                  setFieldValue("water", value)
                }
              />
            </Field>
          </div>

        </div>

      </Card>

      {/* Recovery */}
      <Card className="glass border border-border-light">

        <H4 className="mb-5">Recovery (بحالی)</H4>

        <div className="grid grid-cols-1 gap-5">

          <Field label="Sleep (Hours) (نیند کے گھنٹے)">
            <Slider
              min={3}
              max={12}
              value={goalData.sleep}
              onChange={(value)=>
                setFieldValue("sleep", value)
              }
            />
          </Field>

          <Field label="Any Previous Injuries? (کوئی پرانی چوٹ؟)">
            <TextArea
              rows={4}
              value={goalData.injuries || ''}
              onChange={(e)=>
                setFieldValue(
                  "injuries",
                  e.target.value
                )
              }
              placeholder="Optional"
            />
          </Field>

        </div>

      </Card>

    </div>
  );
}
