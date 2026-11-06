'use client';

import Card from '../../atoms/Card';
import { H4 } from '../../atoms/Typography';
import Select from '../../atoms/Select';
import Slider from '../../atoms/Slider';
import Input from '../../atoms/Input';
import Checkbox from '../../atoms/Checkbox';
import Radio from '../../atoms/Radio';
import TextArea from '../../atoms/TextArea';

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm text-text-secondary font-medium">{label}</label>
    {children}
    {error && <p className="text-xs text-danger">{error}</p>}
  </div>
);

export default function MotherWellnessForm({
  values,
  errors,
  touched,
  setFieldValue,
}) {
  const goalData = values || {};

  return (
    <div className="space-y-6!">

      {/* Stage */}
      <Card className="glass border border-border-light">

        <H4 className="mb-5">
          Motherhood Profile (زچگی کی تفصیلات)
        </H4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="md:col-span-2">
            <Field label="How long since you had your baby? (بچے کی پیدائش کو کتنا عرصہ ہوا ہے؟)" error={touched.postpartumStage && errors.postpartumStage}>
              <Radio.Group
                value={goalData.postpartumStage}
                onChange={(e) =>
                  setFieldValue("postpartumStage", e.target.value)
                }
              >
                <Radio value="0-6-months">0–6 Months</Radio>
                <Radio value="6-12-months">6–12 Months</Radio>
                <Radio value="1-2-years">1–2 Years</Radio>
                <Radio value="2-plus-years">2+ Years</Radio>
              </Radio.Group>
            </Field>
          </div>

          <Field label="Number of Children (بچوں کی تعداد)">
            <Select
              value={goalData.numChildren}
              onChange={(value) =>
                setFieldValue("numChildren", value)
              }
              placeholder="Select number of children"
              options={[
                { label: "1", value: 1 },
                { label: "2", value: 2 },
                { label: "3+", value: 3 },
              ]}
            />
          </Field>

          <Field label="Delivery Type (پیدائش کی قسم)">
            <Select
              value={goalData.deliveryType}
              onChange={(value) =>
                setFieldValue("deliveryType", value)
              }
              placeholder="Select delivery type"
              options={[
                { label: "Vaginal Delivery", value: "vaginal" },
                { label: "C-Section", value: "c-section" },
              ]}
            />
          </Field>

        </div>

      </Card>

      {/* Health & Medical */}
      <Card className="glass border border-border-light">

        <H4 className="mb-5">
          Health &amp; Medical (صحت اور طبی معلومات)
        </H4>

        <div className="grid grid-cols-1 gap-5">

          <Field label="Breastfeeding Status (دودھ پلانے کی صورتحال)" error={touched.breastfeeding && errors.breastfeeding}>
            <Radio.Group
              value={goalData.breastfeeding}
              onChange={(e) =>
                setFieldValue("breastfeeding", e.target.value)
              }
            >
              <Radio value="exclusively">Exclusively Breastfeeding</Radio>
              <Radio value="partially">Partially Breastfeeding</Radio>
              <Radio value="not">Not Breastfeeding</Radio>
              <Radio value="na">Not Applicable</Radio>
            </Radio.Group>
          </Field>

          <Field label="Existing Conditions (موجودہ طبی حالات)">
            <Checkbox.Group
              className="flex flex-col gap-3"
              value={goalData.conditions}
              onChange={(value) =>
                setFieldValue("conditions", value)
              }
              options={[
                "Diastasis Recti",
                "Anemia",
                "Thyroid Issues",
                "High Blood Pressure",
                "PCOS",
                "None",
              ]}
            />
          </Field>

          <Field label="Current Medications / Supplements (موجودہ ادویات / سپلیمنٹس)">
            <Input
              value={goalData.medications}
              onChange={(e) =>
                setFieldValue(
                  "medications",
                  e.target.value
                )
              }
              placeholder="Multivitamins, iron, thyroid medication, etc."
            />
          </Field>

        </div>

      </Card>

      {/* Nutrition & Lifestyle */}
      <Card className="glass border border-border-light">

        <H4 className="mb-5">
          Nutrition &amp; Lifestyle (غذائیت اور طرز زندگی)
        </H4>

        <div className="grid grid-cols-1 gap-5">

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

          <Field label="Water Intake (Litres) (پانی کی مقدار)">
            <Slider
              min={1}
              max={6}
              step={0.5}
              value={goalData.water}
              onChange={(value) =>
                setFieldValue("water", value)
              }
            />
          </Field>

          <Field label="Sleep (Hours) (نیند کے گھنٹے)">
            <Slider
              min={2}
              max={12}
              value={goalData.sleep}
              onChange={(value) =>
                setFieldValue("sleep", value)
              }
            />
          </Field>

          <Field label="Current Energy Level (توانائی کی موجودہ سطح)">
            <Slider
              min={1}
              max={10}
              value={goalData.energy}
              onChange={(value) =>
                setFieldValue("energy", value)
              }
            />
          </Field>

        </div>

      </Card>

      {/* Goals */}
      <Card className="glass border border-border-light">

        <H4 className="mb-5">
          Consultation Goals (مشاورت کے اہداف)
        </H4>

        <Checkbox.Group
          className="flex flex-col gap-3"
          value={goalData.goals}
          onChange={(value) =>
            setFieldValue("goals", value)
          }
          options={[
            "Postpartum Weight Loss",
            "Tone & Strengthen Core",
            "Build Overall Strength",
            "Regain Energy",
            "Balanced Nutrition",
            "Emotional Wellbeing",
          ]}
        />

      </Card>

      {/* Notes */}
      <Card className="glass border border-border-light">

        <H4 className="mb-5">
          Additional Notes (اضافی نوٹس)
        </H4>

        <TextArea
          rows={5}
          value={goalData.notes || ''}
          onChange={(e) =>
            setFieldValue(
              "notes",
              e.target.value
            )
          }
          placeholder="Tell us anything else that will help us support your fitness journey..."
        />

      </Card>

    </div>
  );
}
