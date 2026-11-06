'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Image from 'next/image';
import Link from 'next/link';
import { H2, Text } from '../../components/atoms/Typography';
import Button from '../../components/atoms/Button';
import Icon from '../../components/atoms/Icon';

import consultationImage from '@/assets/images/About 2.webp';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  goal: Yup.string()
    .required('Please select your primary goal'),
  message: Yup.string()
    .max(500, 'Message must be less than 500 characters'),
});

export default function ConsultationCTA() {
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      goal: '',
      message: '',
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      // In production, send this data to your API
      console.log('Consultation request:', values);
      setSubmitted(true);
      resetForm();
      // Optionally redirect to a booking page
      // router.push('/consultation');
    },
  });

  return (
    <section className="relative py-20 md:py-28 section-defer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side: Image & headline */}
          <div className="order-2 lg:order-1 reveal">
            <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl ring-1 ring-primary/10">
              <Image
                src={consultationImage}
                alt="Nutrition consultation"
                fill
                sizes="(max-width: 1024px) 100vw, 448px"
                placeholder="blur"
                className="object-cover"
              />
              {/* subtle glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-scrim via-transparent to-primary/10 pointer-events-none" />
            </div>

            <div className="mt-8 text-center lg:text-left">
              <H2 className="text-3xl sm:text-4xl lg:text-5xl">
                Not Sure Where to Start?
              </H2>
              <Text size="lg" className="mt-4 max-w-lg">
                Talk to our coaching and clinical team — we&apos;ll build a plan
                based on your goals, your body, and your lifestyle.
              </Text>
            </div>
          </div>

          {/* Right side: Form */}
          <div className="order-1 lg:order-2 reveal">
            <div className="glass border border-border-light rounded-2xl p-6 sm:p-8 shadow-xl transition-colors hover:border-primary/30">
              {submitted ? (
                <div className="text-center py-8">
                  <Icon name="check-circle" className="w-16 h-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-bold text-text mt-4">Request Sent!</h3>
                  <Text className="mt-2">
                    Our team will contact you within 24 hours to schedule your consultation.
                  </Text>
                  <Button
                    variant="primary"
                    className="mt-6"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={formik.handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...formik.getFieldProps('name')}
                      className={`w-full px-4 py-3 rounded-xl bg-overlay-strong border ${formik.touched.name && formik.errors.name
                        ? 'border-danger'
                        : 'border-border-light'
                        } text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                      placeholder="John Doe"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="mt-1 text-sm text-danger">{formik.errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...formik.getFieldProps('email')}
                      className={`w-full px-4 py-3 rounded-xl bg-overlay-strong border ${formik.touched.email && formik.errors.email
                        ? 'border-danger'
                        : 'border-border-light'
                        } text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                      placeholder="you@example.com"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="mt-1 text-sm text-danger">{formik.errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-text-secondary mb-1">
                      Primary Goal *
                    </label>
                    <select
                      id="goal"
                      {...formik.getFieldProps('goal')}
                      className={`w-full px-4 py-3 rounded-xl bg-overlay-strong border ${formik.touched.goal && formik.errors.goal
                        ? 'border-danger'
                        : 'border-border-light'
                        } text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition appearance-none`}
                    >
                      <option value="" className="bg-background">Select your goal</option>
                      <option value="build-muscle" className="bg-background">Build Muscle</option>
                      <option value="lose-fat" className="bg-background">Lose Fat</option>
                      <option value="weight-gain" className="bg-background">Weight Gain</option>
                      <option value="healthy-lifestyle" className="bg-background">Healthy Lifestyle</option>
                      <option value="endurance" className="bg-background">Endurance</option>
                    </select>
                    {formik.touched.goal && formik.errors.goal && (
                      <p className="mt-1 text-sm text-danger">{formik.errors.goal}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-1">
                      Additional Notes (optional)
                    </label>
                    <textarea
                      id="message"
                      rows="3"
                      {...formik.getFieldProps('message')}
                      className={`w-full px-4 py-3 rounded-xl bg-overlay-strong border ${formik.touched.message && formik.errors.message
                        ? 'border-danger'
                        : 'border-border-light'
                        } text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none`}
                      placeholder="Any specific questions or preferences..."
                    />
                    {formik.touched.message && formik.errors.message && (
                      <p className="mt-1 text-sm text-danger">{formik.errors.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button type="submit" variant="primary" size="lg" className="flex-1">
                      <Icon name="sparkle" className="w-4 h-4 mr-2" />
                      Book Consultation
                    </Button>
                    <Link href="/consultation" className="flex-1">
                      <Button variant="outline" size="lg" className="w-full">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}