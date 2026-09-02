import { useState, useCallback } from 'react';
import { PROJECT_CATEGORIES, CONTACT_CHANNELS } from '../domain/contactData.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(formData) {
  const errors = {};
  const name = (formData.name || '').trim();
  const email = (formData.email || '').trim();
  const message = (formData.message || '').trim();

  if (!name || name.length < 2) {
    errors.name = 'Please provide your name (at least 2 characters).';
  }

  if (!email) {
    errors.email = 'Please provide your email address.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!message || message.length < 10) {
    errors.message = 'Please provide a brief description of your project (at least 10 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildMailtoUrl(formData) {
  const { name, email, category, message } = formData;
  const recipient = CONTACT_CHANNELS.email.address;
  const subject = `[Project Inquiry] ${category || 'Software Engineering'} - ${name}`;
  const body = [
    `Hi Hafiz,`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Project Scope: ${category || 'General Inquiry'}`,
    ``,
    `Project Details:`,
    `${message}`,
    ``,
    `---`,
    `Sent from portfolio direct inquiry console`,
  ].join('\n');

  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function useContactForm(initialCategory = PROJECT_CATEGORIES[0]) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: initialCategory,
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [mailtoUrl, setMailtoUrl] = useState('');

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }

    setErrors({});
    setStatus('submitting');

    const generatedMailto = buildMailtoUrl(formData);
    setMailtoUrl(generatedMailto);

    // Simulated network dispatch (450ms) to ensure reassuring feedback
    await new Promise((resolve) => setTimeout(resolve, 450));

    setStatus('success');
    return true;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      category: initialCategory,
      message: '',
    });
    setErrors({});
    setStatus('idle');
    setMailtoUrl('');
  }, [initialCategory]);

  return {
    formData,
    status,
    errors,
    mailtoUrl,
    isSubmitting: status === 'submitting',
    isSuccess: status === 'success',
    handleChange,
    handleSubmit,
    resetForm,
  };
}
