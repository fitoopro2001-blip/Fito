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

export default function FatLossForm({
  values,
  errors,
  touched,
  setFieldValue,
}) {

  const goalData = values || {};

  return (
    <div className="space-y-6!">

      {/* Current Body */}
      <Card className="glass border border-border-light">

        <H4 className="mb-5">Current Body (موجودہ جسم)</H4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field label="Current Weight (kg) (موجودہ وزن)" error={touched.currentWeight && errors.currentWeight}>
            <InputNumber
              value={goalData.currentWeight}
              onChange={(value)=>
                setFieldValue("currentWeight", value)
              }
            />
          </Field>

          <Field label="Target Weight (kg) (ہدف وزن)" error={touched.targetWeight && errors.targetWeight}>
            <InputNumber
              value={goalData.targetWeight}
              onChange={(value)=>
                setFieldValue("targetWeight", value)
              }
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Waist Size (cm) (کمر کا سائز)">
              <InputNumber
                value={goalData.waist}
                onChange={(value)=>
                  setFieldValue("waist", value)
                }
              />
            </Field>
          </div>

        </div>

      </Card>

      {/* Lifestyle */}

      <Card className="glass border border-border-light">

        <H4 className="mb-5">Lifestyle (طرز زندگی)</H4>

        <div className="grid grid-cols-1 gap-5">

          <Field label="Daily Activity Level (روزانہ سرگرمی کی سطح)" error={touched.activity && errors.activity}>
            <Select
              value={goalData.activity}
              onChange={(value)=>
                setFieldValue("activity", value)
              }
              placeholder="Select activity level"
              options={[
                {
                  label:"Sedentary",
                  value:"sedentary"
                },
                {
                  label:"Light",
                  value:"light"
                },
                {
                  label:"Moderate",
                  value:"moderate"
                },
                {
                  label:"Very Active",
                  value:"active"
                }
              ]}
            />
          </Field>

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

      </Card>

      {/* Eating Habits */}

      <Card className="glass border border-border-light">

        <H4 className="mb-5">
          Eating Habits (کھانے کی عادات)
        </H4>

        <div className="grid grid-cols-1 gap-5">

          <Field label="Meals Per Day (روزانہ کھانوں کی تعداد)">
            <Select
              value={goalData.meals}
              onChange={(value)=>
                setFieldValue("meals", value)
              }
              placeholder="Select meals per day"
              options={[
                {label:"2",value:2},
                {label:"3",value:3},
                {label:"4",value:4},
                {label:"5+",value:5},
              ]}
            />
          </Field>

          <Field label="Biggest Challenges (سب سے بڑے چیلنجز)">
            <Checkbox.Group
              className="flex flex-col gap-3"
              value={goalData.challenges}
              onChange={(value)=>
                setFieldValue("challenges", value)
              }
              options={[
                "Sugar cravings",
                "Late-night eating",
                "Busy schedule",
                "Emotional eating",
                "Frequent dining out",
              ]}
            />
          </Field>

          <Field label="Previous Diets (پچھلی ڈائٹس)">
            <TextArea
              rows={4}
              value={goalData.previousDiets || ''}
              onChange={(e)=>
                setFieldValue(
                  "previousDiets",
                  e.target.value
                )
              }
            />
          </Field>

        </div>

      </Card>

    </div>
  );
}
