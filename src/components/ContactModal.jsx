'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, Phone, Mail, User, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ContactModal({ open, onClose, projectTitle }) {
  const t = useTranslations('contact.modal');

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [consentRequired, setConsentRequired] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 9)
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      9
    )} ${cleaned.slice(9, 12)}`;
  };

  const handlePhoneChange = (e) =>
    setForm({ ...form, phone: formatPhoneNumber(e.target.value) });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    if (!consentRequired) {
      setSubmitting(false);
      setStatus('error');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, projectTitle, consentMarketing }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('ok');
      setForm({ name: '', email: '', phone: '', message: '' });
      setConsentRequired(false);
      setConsentMarketing(false);
      setTimeout(() => onClose?.(), 1400);
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = useCallback(
    (e) => e.key === 'Escape' && onClose?.(),
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="relative z-[101] flex min-h-full items-center justify-center p-4">
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-xl md:max-w-2xl rounded-2xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header with BRAND gradient */}
            <div className="relative rounded-t-2xl bg-gradient-to-r from-[#2DADFF] to-[#14A0A3] p-6 md:p-7 text-white">
              <button
                onClick={onClose}
                className="absolute right-3 top-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label={t('closeAriaLabel')}
              >
                <X size={18} />
              </button>

              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={22} className="text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-1">
                  {projectTitle
                    ? t('headingWithProject', { projectTitle })
                    : t('headingGeneric')}
                </h2>
                <p className="text-white/80 text-xs md:text-[13px]">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 md:p-7">
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label={t('fields.name')}
                    icon={<User size={16} className="text-gray-400" />}
                  >
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      required
                      className="field-input field-input--sm pl-9"
                    />
                  </Field>

                  <Field
                    label={t('fields.email')}
                    icon={<Mail size={16} className="text-gray-400" />}
                  >
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      className="field-input field-input--sm pl-9"
                    />
                  </Field>
                </div>

                {/* Phone */}
                <Field
                  label={t('fields.phone')}
                  icon={<Phone size={16} className="text-gray-400" />}
                >
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      required
                      placeholder="+971 50 123 4567"
                      className="field-input field-input--sm pl-20 pr-3"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5" />
                  </div>
                </Field>

                {/* Message */}
                <Field label={t('fields.message')}>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    rows={4}
                    placeholder={t('fields.messagePlaceholder')}
                    className="field-input field-input--sm textarea resize-none"
                  />
                </Field>

                {/* Consent */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#2DADFF] focus:ring-[#2DADFF]"
                      checked={consentRequired}
                      onChange={(e) => setConsentRequired(e.target.checked)}
                      required
                    />
                    <span className="text-[13px] md:text-sm text-gray-700 group-hover:text-gray-900">
                      {t('consent.requiredPrefix')}
                      <a
                        href="/legal?tab=privacy"
                        className="text-[#2DADFF] hover:text-[#1498ff] font-medium underline"
                      >
                        {t('consent.privacyPolicy')}
                      </a>{' '}
                      {t('consent.and')}{' '}
                      <a
                        href="/legal?tab=terms"
                        className="text-[#2DADFF] hover:text-[#1498ff] font-medium underline"
                      >
                        {t('consent.termsOfService')}
                      </a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#2DADFF] focus:ring-[#2DADFF]"
                      checked={consentMarketing}
                      onChange={(e) => setConsentMarketing(e.target.checked)}
                    />
                    <span className="text-[13px] md:text-sm text-gray-700 group-hover:text-gray-900">
                      {t('consent.marketing')}
                    </span>
                  </label>
                </div>

                {/* Status */}
                <AnimatePresence mode="popLayout">
                  {status === 'ok' && (
                    <motion.div
                      className="rounded-xl bg-green-50 border border-green-200 p-3.5 flex items-center gap-3"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-green-800 font-medium text-sm">
                          {t('status.successTitle')}
                        </p>
                        <p className="text-green-600 text-xs">
                          {t('status.successBody')}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {status === 'error' && (
                    <motion.div
                      className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-3"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <X size={12} className="text-white" />
                      </div>
                      <div>
                        <p className="text-red-800 font-medium text-sm">
                          {t('status.errorTitle')}
                        </p>
                        <p className="text-red-600 text-xs">
                          {t('status.errorBody')}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  className="w-full rounded-xl bg-gradient-to-r from-[#2DADFF] to-[#14A0A3] py-3.5 px-6 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('submit.loading')}
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {t('submit.default')}
                    </>
                  )}
                </motion.button>

                {/* Trust line */}
                <div className="text-center">
                  <p className="text-[11px] text-gray-500">
                    🔒 {t('trust')}
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

/* Field */
function Field({ label, children, icon }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] md:text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
