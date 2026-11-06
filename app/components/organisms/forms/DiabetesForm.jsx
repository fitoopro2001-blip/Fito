'use client';

import Card from '../../atoms/Card';
import { H4 } from '../../atoms/Typography';
import Select from '../../atoms/Select';
import Slider from '../../atoms/Slider';
import Input from '../../atoms/Input';
import DatePicker from '../../atoms/DatePicker';
import Checkbox from '../../atoms/Checkbox';
import TextArea from '../../atoms/TextArea';

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm text-text-secondary font-medium">{label}</label>
    {children}
    {error && <p className="text-xs text-danger">{error}</p>}
  </div>
);

export default function DiabetesForm({
  values,
  errors,
  touched,
  setFieldValue,
}) {
  const goalData = values || {};

  return (
    <div className="space-y-6!">

      {/* Medical Information */}

      <Card className="glass border border-border-light">

        <H4 className="mb-5">
          Medical Information (طبی معلومات)
        </H4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field label="Diabetes Type (ذیابیطس کی قسم)" error={touched.diabetesType && errors.diabetesType}>
            <Select
              value={goalData.diabetesType}
              onChange={(value)=>
                setFieldValue("diabetesType", value)
              }
              placeholder="Select diabetes type"
              options={[
                {
                  label:"Type 1",
                  value:"type-1"
                },
                {
                  label:"Type 2",
                  value:"type-2"
                },
                {
                  label:"Prediabetes",
                  value:"prediabetes"
                },
                {
                  label:"Gestational",
                  value:"gestational"
                }
              ]}
            />
          </Field>

          <Field label="Diagnosis Date (تشخیص کی تاریخ)">
            <DatePicker
              value={goalData.diagnosisDate}
              onChange={(date)=>
                setFieldValue(
                  "diagnosisDate",
                  date?.toISOString()
                )
              }
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Current Medication / Insulin (موجودہ ادویات / انسولین)">
              <Input
                value={goalData.medication}
                onChange={(e)=>
                  setFieldValue(
                    "medication",
                    e.target.value
                  )
                }
                placeholder="Metformin, Insulin, etc."
              />
            </Field>
          </div>

        </div>

      </Card>

      {/* Blood Sugar Levels */}

      <Card className="glass border border-border-light">

        <H4 className="mb-5">
          Blood Sugar Levels (بلڈ شوگر لیول)
        </H4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field label="Fasting Blood Sugar (mg/dL) (فاسٹنگ بلڈ شوگر)" error={touched.fastingSugar && errors.fastingSugar}>
            <Input
              type="number"
              value={goalData.fastingSugar}
              onChange={(e)=>
                setFieldValue(
                  "fastingSugar",
                  e.target.value
                )
              }
              placeholder="e.g. 110"
            />
          </Field>

          <Field label="Post-Meal Blood Sugar (mg/dL) (کھانے کے بعد بلڈ شوگر)">
            <Input
              type="number"
              value={goalData.postMealSugar}
              onChange={(e)=>
                setFieldValue(
                  "postMealSugar",
                  e.target.value
                )
              }
              placeholder="e.g. 160"
            />
          </Field>

          <Field label="Latest HbA1c (%) (تازہ ترین ایچ بی اے ون سی)">
            <Input
              type="number"
              value={goalData.hba1c}
              onChange={(e)=>
                setFieldValue(
                  "hba1c",
                  e.target.value
                )
              }
              placeholder="e.g. 6.5"
            />
          </Field>

        </div>

      </Card>

      {/* Symptoms */}

      <Card className="glass border border-border-light">

        <H4 className="mb-5">
          Symptoms (علامات)
        </H4>

        <Checkbox.Group
          className="flex flex-col gap-3"
          value={goalData.symptoms}
          onChange={(value)=>
            setFieldValue("symptoms", value)
          }
          options={[
            "Frequent Urination",
            "Excessive Thirst",
            "Fatigue",
            "Blurred Vision",
            "Slow-Healing Wounds",
            "Tingling in Hands/Feet",
            "Unexplained Weight Loss",
          ]}
        />

      </Card>

      {/* Lifestyle */}

      <Card className="glass border border-border-light">

        <H4 className="mb-5">
          Lifestyle (طرز زندگی)
        </H4>

        <div className="grid grid-cols-1 gap-5">

          <Field label="Exercise Days / Week (ورزش کے دن / ہفتہ)">
            <Slider
              min={0}
              max={7}
              value={goalData.exercise}
              onChange={(value)=>
                setFieldValue("exercise", value)
              }
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

          <Field label="Stress Level (ذہنی دباؤ کی سطح)">
            <Slider
              min={1}
              max={10}
              value={goalData.stress}
              onChange={(value)=>
                setFieldValue("stress", value)
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
          onChange={(value)=>
            setFieldValue("goals", value)
          }
          options={[
            "Better Blood Sugar Control",
            "Weight Management",
            "Reduce Medication Dependency",
            "Prevent Complications",
            "Healthy Lifestyle",
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
          onChange={(e)=>
            setFieldValue(
              "notes",
              e.target.value
            )
          }
          placeholder="Tell us anything that will help us understand your condition better..."
        />

      </Card>

    </div>
  );
}
