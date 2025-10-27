'use client';
import { useState } from 'react';

export default function ContactModal({ open, onClose, projectTitle }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'ok' | 'error' | null

  if (!open) return null;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, projectTitle }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('ok');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* overlay */}
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close modal"
      />
      {/* dialog */}
      <div className="relative w-[92%] max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="p-6 md:p-7">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Get details about <span className="text-sky-600">{projectTitle}</span>
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Leave your info and your question. We’ll get back shortly.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Your query</label>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                required
                rows={4}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ask about prices, payment plan, availability, etc."
              />
            </div>

            {status === 'ok' && (
              <div className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
                Thanks! Your message has been sent.
              </div>
            )}
            {status === 'error' && (
              <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                Sorry, something went wrong. Please try again.
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send inquiry'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </form>
        </div>

        {/* decorative bottom bar to make it feel premium */}
        <div className="h-2 w-full rounded-b-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />
      </div>
    </div>
  );
}
