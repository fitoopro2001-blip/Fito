'use client';

import { useState } from 'react';
import { Modal } from 'antd';
import Input from '../../atoms/Input';
import Button from '../../atoms/Button';
import Divider from '../../atoms/Divider';
import { Text, Caption } from '../../atoms/Typography';
import { PHONE_REGEX } from '../../../utils/consultationValidation';
import { applyToCareer } from '../../../services/career.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  resumeLink: '',
  referralName: '',
  referralEmail: '',
  referralPhone: '',
};

// Outer component just controls visibility. The form itself is keyed by
// career id below, so reopening (including for a different job) remounts it
// with a blank form instead of needing an effect to reset state.
export default function CareerApplyModal({ open, onClose, career }) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} title={`Apply — ${career?.title ?? ''}`} centered>
      {career && <CareerApplyForm key={career.id} career={career} onClose={onClose} />}
    </Modal>
  );
}

function CareerApplyForm({ career, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email.trim())) next.email = 'Enter a valid email';
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    else if (!PHONE_REGEX.test(form.phone.trim())) next.phone = 'Enter a valid phone number';
    if (!form.resumeLink.trim()) next.resumeLink = 'Resume link is required';
    if (form.referralEmail.trim() && !EMAIL_REGEX.test(form.referralEmail.trim())) {
      next.referralEmail = 'Enter a valid email';
    }
    if (form.referralPhone.trim() && !PHONE_REGEX.test(form.referralPhone.trim())) {
      next.referralPhone = 'Enter a valid phone number';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'loading' || !validate()) return;

    setStatus('loading');
    setErrorMsg('');
    try {
      await applyToCareer(career.id, form);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  if (status === 'done') {
    return (
      <div className="py-4">
        <Text className="text-primary">Application submitted! We&apos;ll be in touch. 🎉</Text>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="apply-name" label="Full Name" value={form.name} onChange={handleChange('name')} error={errors.name} />
        <Input
          id="apply-email"
          type="email"
          label="Email"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="apply-phone" label="Phone Number" value={form.phone} onChange={handleChange('phone')} error={errors.phone} />
        <Input
          id="apply-resume"
          label="Resume Link"
          placeholder="https://drive.google.com/..."
          value={form.resumeLink}
          onChange={handleChange('resumeLink')}
          error={errors.resumeLink}
        />
      </div>

      <Divider className="my-1" />
      <Caption className="text-text-muted -mb-1">Referred by someone? (optional)</Caption>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="apply-referral-name" label="Referral Name" value={form.referralName} onChange={handleChange('referralName')} />
        <Input
          id="apply-referral-email"
          type="email"
          label="Referral Email"
          value={form.referralEmail}
          onChange={handleChange('referralEmail')}
          error={errors.referralEmail}
        />
      </div>
      <Input
        id="apply-referral-phone"
        label="Referral Phone Number"
        value={form.referralPhone}
        onChange={handleChange('referralPhone')}
        error={errors.referralPhone}
      />

      {status === 'error' && <Text className="text-danger text-sm">{errorMsg}</Text>}

      <Button type="submit" variant="primary" size="lg" loading={status === 'loading'} className="self-start">
        Submit Application
      </Button>
    </form>
  );
}
