'use client';

import Card from '../../atoms/Card';
import { H4 } from '../../atoms/Typography';
import InputNumber from '../../atoms/InputNumber';
import Select from '../../atoms/Select';
import Slider from '../../atoms/Slider';
import Checkbox from '../../atoms/Checkbox';
import TextArea from '../../atoms/TextArea';

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm text-text-secondary font-medium">{label}</label>
    {children}
    {error && <p className="text-xs text-danger">{error}</p>}
  </div>
);

export default function BodyRecompositionForm({
  values,
  errors,
  touched,
  setFieldValue,
}) {
  const goalData = values || {};

  return (
    <div className="space-y-6!">

      {/* Goals */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Body Goals (جسمانی اہداف)</H4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Target Weight (kg) (ہدف وزن)" error={touched.targetWeight && errors.targetWeight}>
            <InputNumber
              value={goalData.targetWeight}
              onChange={(value) =>
                setFieldValue("targetWeight", value)
              }
            />
          </Field>

          <Field label="Estimated Body Fat % (Optional) (تخمینی جسمانی چربی)">
            <InputNumber
              min={5}
              max={60}
              value={goalData.bodyFat}
              onChange={(value) =>
                setFieldValue("bodyFat", value)
              }
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Waist Circumference (cm) (کمر کا طواف)">
              <InputNumber
                value={goalData.waist}
                onChange={(value) =>
                  setFieldValue("waist", value)
                }
              />
            </Field>
          </div>
        </div>
      </Card>

      {/* Training */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Training (تربیت)</H4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field label="Workout Days / Week (ورزش کے دن / ہفتہ)">
            <Slider
              min={1}
              max={7}
              value={goalData.workoutDays}
              onChange={(value) =>
                setFieldValue("workoutDays", value)
              }
            />
          </Field>

          <Field label="Cardio Sessions / Week (کارڈیو سیشنز / ہفتہ)">
            <Slider
              min={0}
              max={7}
              value={goalData.cardioDays}
              onChange={(value) =>
                setFieldValue("cardioDays", value)
              }
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Training Experience (تربیتی تجربہ)" error={touched.experience && errors.experience}>
              <Select
                value={goalData.experience}
                onChange={(value) =>
                  setFieldValue("experience", value)
                }
                placeholder="Select training experience"
                options={[
                  { label: "Beginner", value: "beginner" },
                  { label: "Intermediate", value: "intermediate" },
                  { label: "Advanced", value: "advanced" },
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
              value={goalData.meals}
              onChange={(value) =>
                setFieldValue("meals", value)
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
              onChange={(value) =>
                setFieldValue("protein", value)
              }
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Current Challenges (موجودہ چیلنجز)">
              <Checkbox.Group
                className="flex flex-col gap-3"
                value={goalData.challenges}
                onChange={(value) =>
                  setFieldValue("challenges", value)
                }
                options={[
                  "Hard to lose fat",
                  "Hard to build muscle",
                  "Inconsistent workouts",
                  "Poor diet",
                  "Lack of motivation",
                ]}
              />
            </Field>
          </div>

        </div>
      </Card>

      {/* Lifestyle */}
      <Card className="glass border border-border-light">
        <H4 className="mb-5">Lifestyle (طرز زندگی)</H4>

        <div className="grid grid-cols-1 gap-5">

          <Field label="Sleep (Hours) (نیند کے گھنٹے)">
            <Slider
              min={3}
              max={12}
              value={goalData.sleep}
              onChange={(value) =>
                setFieldValue("sleep", value)
              }
            />
          </Field>

          <Field label="Additional Notes (اضافی نوٹس)">
            <TextArea
              rows={4}
              value={goalData.notes || ''}
              onChange={(e) =>
                setFieldValue("notes", e.target.value)
              }
              placeholder="Anything you'd like us to know?"
            />
          </Field>

        </div>
      </Card>

    </div>
  );
}
