'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Formik, Form } from 'formik';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

import Card from '../../atoms/Card';
import Input from '../../atoms/Input';
import Select from '../../atoms/Select';
import DatePicker from '../../atoms/DatePicker';
import Slider from '../../atoms/Slider';
import { H3, H4, H5, Text } from '../../atoms/Typography';
import { personalInfoValidationSchema } from '../../../utils/consultationValidation';

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm text-text-secondary font-medium">{label}</label>
    {children}
    {error && <p className="text-xs text-danger">{error}</p>}
  </div>
);

const BMI_CATEGORIES = [
  { max: 18.5, label: 'Underweight', color: '#3B82F6' },
  { max: 25, label: 'Normal', color: '#10B981' },
  { max: 30, label: 'Overweight', color: '#F59E0B' },
  { max: Infinity, label: 'Obese', color: '#EF4444' },
];

const cmToFeetInches = (cm) => {
  if (!cm) return { feet: '', inches: '' };
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
};

const feetInchesToCm = (feet, inches) => {
  const totalInches = (Number(feet) || 0) * 12 + (Number(inches) || 0);
  return totalInches > 0 ? Math.round(totalInches * 2.54) : null;
};

const PersonalInfoStep = forwardRef(function PersonalInfoStep(
  { formData, updateField, onValid },
  ref
) {
  const formikRef = useRef(null);

  useImperativeHandle(ref, () => ({
    submit: () => formikRef.current?.submitForm(),
  }));

  const initialValues = {
    fullName: formData.fullName || '',
    email: formData.email || '',
    phone: formData.phone || '',
    dob: formData.dob || null,
    gender: formData.gender || '',
    activityLevel: formData.activityLevel || '',
    height: formData.height ?? null,
    weight: formData.weight ?? null,
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialValues}
      enableReinitialize
      validationSchema={personalInfoValidationSchema}
      onSubmit={(values) => {
        Object.entries(values).forEach(([key, value]) => updateField(key, value));
        onValid();
      }}
    >
      {({ values, errors, touched, setFieldValue }) => {
        const bmiHeightM = (values.height || 0) / 100;
        const bmi = bmiHeightM && values.weight ? values.weight / (bmiHeightM * bmiHeightM) : null;
        const bmiCategory = bmi ? BMI_CATEGORIES.find((c) => bmi < c.max) : null;
        const { feet: heightFeet, inches: heightInches } = cmToFeetInches(values.height);

        const updateHeightFeet = (feet) => {
          setFieldValue('height', feetInchesToCm(feet, heightInches));
        };

        const updateHeightInches = (inches) => {
          setFieldValue('height', feetInchesToCm(heightFeet, inches));
        };

        return (
          <Form className="space-y-6!">

            <div>
              <H3 className="mb-2">
                Personal Information
              </H3>

              <Text muted>
                Tell us a little about yourself.
              </Text>
            </div>

            <Card className="glass border border-border-light">

              <H4 className="mb-5">Basic Information</H4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <Field label="Full Name" error={touched.fullName && errors.fullName}>
                  <Input
                    icon={<UserOutlined />}
                    placeholder="John Doe"
                    value={values.fullName}
                    error={touched.fullName && errors.fullName}
                    onChange={(e) => setFieldValue('fullName', e.target.value)}
                  />
                </Field>

                <Field label="Email" error={touched.email && errors.email}>
                  <Input
                    icon={<MailOutlined />}
                    placeholder="john@email.com"
                    value={values.email}
                    error={touched.email && errors.email}
                    onChange={(e) => setFieldValue('email', e.target.value)}
                  />
                </Field>

                <Field label="Phone Number" error={touched.phone && errors.phone}>
                  <Input
                    icon={<PhoneOutlined />}
                    placeholder="+92..."
                    value={values.phone}
                    error={touched.phone && errors.phone}
                    onChange={(e) => setFieldValue('phone', e.target.value)}
                  />
                </Field>

                <Field label="Date of Birth" error={touched.dob && errors.dob}>
                  <DatePicker
                    value={values.dob}
                    onChange={(date) =>
                      setFieldValue(
                        "dob",
                        date?.toISOString()
                      )
                    }
                  />
                </Field>

                <Field label="Gender" error={touched.gender && errors.gender}>
                  <Select
                    value={values.gender}
                    onChange={(value) => setFieldValue('gender', value)}
                    placeholder="Select gender"
                    options={[
                      {label:"Male",value:"male"},
                      {label:"Female",value:"female"},
                      {label:"Other",value:"other"},
                    ]}
                  />
                </Field>

                <Field label="Activity Level" error={touched.activityLevel && errors.activityLevel}>
                  <Select
                    value={values.activityLevel}
                    onChange={(value) => setFieldValue('activityLevel', value)}
                    placeholder="Select activity level"
                    options={[
                      {
                        label:"Sedentary",
                        value:"sedentary",
                      },
                      {
                        label:"Lightly Active",
                        value:"light",
                      },
                      {
                        label:"Moderately Active",
                        value:"moderate",
                      },
                      {
                        label:"Very Active",
                        value:"active",
                      },
                    ]}
                  />
                </Field>

              </div>

            </Card>

            <Card className="glass border border-border-light">

              <div className="flex items-center gap-2 mb-5">
                <TeamOutlined className="text-primary" />
                <H4>Body Metrics</H4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div>
                  <H5 className="mb-4">Height</H5>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      suffix="ft"
                      value={heightFeet}
                      onChange={(e) => updateHeightFeet(e.target.value)}
                    />

                    <Input
                      type="number"
                      suffix="in"
                      value={heightInches}
                      onChange={(e) => updateHeightInches(e.target.value)}
                    />
                  </div>
                  {touched.height && errors.height && (
                    <p className="mt-1 text-xs text-danger">{errors.height}</p>
                  )}
                </div>

                <div>
                  <H5 className="mb-4">Weight</H5>

                  <div className="flex flex-col gap-3">
                    <Slider
                      min={30}
                      max={200}
                      value={values.weight}
                      onChange={(value) => setFieldValue('weight', value)}
                    />

                    <Input
                      type="number"
                      suffix="kg"
                      value={values.weight}
                      onChange={(e) =>
                        setFieldValue(
                          "weight",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  {touched.weight && errors.weight && (
                    <p className="mt-1 text-xs text-danger">{errors.weight}</p>
                  )}
                </div>

              </div>

              {bmi && (
                <div className="flex items-center gap-3 mt-6 bg-overlay rounded-xl p-4">
                  <ThunderboltOutlined className="text-primary text-lg shrink-0" />
                  <Text className="text-sm">
                    <span className="text-text font-semibold">Your BMI: {bmi.toFixed(1)}</span>
                    {' — '}
                    <span style={{ color: bmiCategory?.color }} className="font-medium">
                      {bmiCategory?.label}
                    </span>
                    <span className="text-text-muted"> (calculated from height and weight)</span>
                  </Text>
                </div>
              )}

            </Card>

            <div className="flex items-start gap-2 text-text-muted text-xs">
              <CalendarOutlined className="mt-0.5 shrink-0" />
              <span>
                This information helps your dietitian tailor a plan specifically to you — it&apos;s never shared outside your consultation.
              </span>
            </div>

          </Form>
        );
      }}
    </Formik>
  );
});

export default PersonalInfoStep;
