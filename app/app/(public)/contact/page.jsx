'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { H2, Text } from '../../../components/atoms/Typography';
import Input from '../../../components/atoms/Input';
import TextArea from '../../../components/atoms/TextArea';
import Button from '../../../components/atoms/Button';
import Icon from '../../../components/atoms/Icon';
import { CONTACT_EMAIL, WHATSAPP_NUMBER, WHATSAPP_DISPLAY } from '../../../utils/siteConfig';
import { trackEvent } from '../../../lib/fbpixel';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');

    // Meta Pixel — contact form submitted.
    trackEvent('Contact', { content_name: 'contact_form' });

    const subject = encodeURIComponent(`Message from ${form.name} via Fitoo website`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <H2 className="text-white">Get In Touch</H2>
          <Text className="text-gray-400 mt-2 max-w-xl mx-auto">
            Questions about an order or a product? Send us a message or reach out directly on WhatsApp.
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="contact-name"
                label="Your Name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange('name')}
              />
              <Input
                id="contact-email"
                type="email"
                label="Your Email"
                placeholder="you@email.com"
                value={form.email}
                onChange={handleChange('email')}
              />
            </div>
            <TextArea
              id="contact-message"
              label="Message"
              rows={5}
              placeholder="How can we help?"
              value={form.message}
              onChange={handleChange('message')}
            />
            {error && <Text className="text-red-400 text-sm">{error}</Text>}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={<Icon name="mail" className="w-4 h-4" />}
              className="self-start"
            >
              Send Message
            </Button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-between flex-wrap gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 mt-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
              <Icon name="whatsapp" className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-semibold">Prefer WhatsApp?</div>
              <div className="text-sm text-gray-400">{WHATSAPP_DISPLAY}</div>
            </div>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="md" icon={<Icon name="whatsapp" className="w-4 h-4" />}>
              Chat on WhatsApp
            </Button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
