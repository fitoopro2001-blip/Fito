'use client';

import { useState } from 'react';
import { Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Input from '../../atoms/Input';
import TextArea from '../../atoms/TextArea';
import Button from '../../atoms/Button';
import Upload from '../../atoms/Upload';
import { H5, Text } from '../../atoms/Typography';
import CoursePrice from '../../molecules/CoursePrice';
import { PAYMENT_DETAILS, CopyableRow } from '../steps/PaymentStep';
import useAuth from '../../../hooks/useAuth';
import { PHONE_REGEX } from '../../../utils/consultationValidation';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE_MB } from '../../../utils/uploadValidation';
import { enrollInCourse } from '../../../services/course.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Outer component just controls visibility. The form is keyed by course id,
// so reopening remounts it with a fresh form instead of needing an effect to
// reset state.
export default function CourseEnrollModal({ open, onClose, course, onEnrolled }) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} title={`Enrol — ${course?.title ?? ''}`} centered width={560}>
      {course && open && <CourseEnrollForm key={course.id} course={course} onClose={onClose} onEnrolled={onEnrolled} />}
    </Modal>
  );
}

function CourseEnrollForm({ course, onClose, onEnrolled }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    qualification: '',
    notes: '',
    transactionId: '',
  });
  const [screenshot, setScreenshot] = useState([]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email.trim())) next.email = 'Enter a valid email';
    if (!form.phone.trim()) next.phone = 'WhatsApp number is required';
    else if (!PHONE_REGEX.test(form.phone.trim())) next.phone = 'Enter a valid phone number';
    if (!screenshot.length) next.screenshot = 'Please attach your payment screenshot';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'loading' || !validate()) return;

    setStatus('loading');
    setErrorMsg('');
    try {
      const enrollment = await enrollInCourse({
        courseId: course.id,
        ...form,
        paymentScreenshot: screenshot[0],
      });
      setStatus('done');
      onEnrolled?.(enrollment);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  if (status === 'done') {
    return (
      <div className="py-4">
        <Text className="text-primary">Enrolment submitted!</Text>
        <Text muted className="mt-2 text-sm">
          We&apos;ll verify your payment and email your enrolment confirmation to {form.email.trim()}. You can track
          the status from your dashboard.
        </Text>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Text muted className="text-xs mb-1">Course Fee</Text>
        <CoursePrice course={course} />
      </div>

      <div>
        <H5 className="mb-1">Payment Details</H5>
        <Text muted className="text-xs mb-1">
          Transfer the course fee to the account below, then attach the payment screenshot.
        </Text>
        {PAYMENT_DETAILS.map((detail) => (
          <CopyableRow key={detail.label} {...detail} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="enrol-name" label="Full Name" value={form.fullName} onChange={handleChange('fullName')} error={errors.fullName} />
        <Input id="enrol-phone" label="WhatsApp Number" value={form.phone} onChange={handleChange('phone')} error={errors.phone} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="enrol-email" type="email" label="Email" value={form.email} onChange={handleChange('email')} error={errors.email} />
        <Input
          id="enrol-qualification"
          label="Qualification (optional)"
          placeholder="e.g. BS Nutrition"
          value={form.qualification}
          onChange={handleChange('qualification')}
        />
      </div>

      <Input
        id="enrol-transaction"
        label="Transaction ID (optional)"
        placeholder="Enter transaction reference"
        value={form.transactionId}
        onChange={handleChange('transactionId')}
      />

      <div>
        <span className="block text-sm text-text-secondary mb-1.5">Payment Screenshot</span>
        <Upload
          accept="image/*"
          allowedTypes={ALLOWED_IMAGE_TYPES}
          maxSizeMB={MAX_UPLOAD_SIZE_MB}
          value={screenshot}
          onChange={setScreenshot}
        >
          <UploadOutlined />
          <span>Upload Screenshot</span>
        </Upload>
        {errors.screenshot ? (
          <p className="mt-1 text-xs text-danger">{errors.screenshot}</p>
        ) : (
          <p className="mt-1 text-xs text-text-muted">Max {MAX_UPLOAD_SIZE_MB}MB.</p>
        )}
      </div>

      <TextArea
        id="enrol-notes"
        label="Notes (optional)"
        rows={2}
        value={form.notes}
        onChange={handleChange('notes')}
      />

      {status === 'error' && <Text className="text-danger text-sm">{errorMsg}</Text>}

      <Button type="submit" variant="primary" size="lg" loading={status === 'loading'} className="self-start">
        Submit Enrolment
      </Button>
    </form>
  );
}
