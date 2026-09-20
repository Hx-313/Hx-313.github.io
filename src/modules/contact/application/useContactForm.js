import { useState, useCallback } from 'react';
import { CONTACT_CHANNELS, CONTACT_TEXT } from '../domain/contactData.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(formData) {
  const email = (formData.email || '').trim();
  const { validation } = CONTACT_TEXT.form;
  const errors = {};

  if (!email) {
    errors.email = validation.emailRequired;
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = validation.emailInvalid;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildMailtoUrl(formData) {
  const name = (formData.name || '').trim();
  const email = (formData.email || '').trim();
  const category = (formData.category || '').trim();
  const message = (formData.message || '').trim();
  const recipient = CONTACT_CHANNELS.email.address;
  const subject = ['Project conversation', category, name].filter(Boolean).join(' — ');
  const body = [
    'Hi Hafiz,',
    '',
    ...(name ? [`Name: ${name}`] : []),
    `Email: ${email}`,
    `Project type: ${category || 'Not sure yet'}`,
    '',
    'A little about the project:',
    message || 'I have an idea I would like to talk through and work out the next step.',
  ].join('\n');

  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function useContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isDraftReady, setIsDraftReady] = useState(false);

  const handleChange = useCallback((field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setIsDraftReady(false);
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();

    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      document.getElementById('contact-email')?.focus();
      return false;
    }

    setErrors({});
    setIsDraftReady(true);
    window.location.href = buildMailtoUrl(formData);
    return true;
  }, [formData]);

  return { formData, errors, isDraftReady, handleChange, handleSubmit };
}
