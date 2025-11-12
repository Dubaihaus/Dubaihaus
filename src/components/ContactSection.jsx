// src/components/ContactSection.jsx
"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function ContactSection() {
  return (
    <section
      className="
        relative w-full 
        bg-[radial-gradient(circle_at_top,_var(--color-brand-sky)_0,_#F5F7FB_55%,_white_100%)]
        py-16 md:py-20 px-4
        overflow-hidden
      "
    >
      {/* floating blobs / orbs */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-48 w-48 rounded-full bg-[var(--color-brand-sky)] blur-3xl opacity-30" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 rounded-full bg-[var(--color-brand-dark)] blur-3xl opacity-20" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-sky-200/60 to-transparent opacity-60" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row"
      >
        {/* LEFT: Heading + form */}
        <div className="flex-1 space-y-8">
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-sm backdrop-blur-xl"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-sky)]" />
            <span className="text-slate-700">Let&apos;s talk</span>
          </motion.div>

          {/* heading + subtext */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight"
            >
              Let&apos;s plan your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-sky)] to-[var(--color-brand-dark)]">
                next property move
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed"
            >
              Whether you&apos;re exploring off-plan projects, looking for a
              ready apartment, or considering selling, share your plans and our
              experts will come back with tailored options in Dubai &amp; Abu
              Dhabi.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap gap-3 text-xs sm:text-sm text-slate-600"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>No-obligation consultation</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-sky)]" />
                <span>Response usually within 24 hours</span>
              </span>
            </motion.div>
          </div>

          {/* form card */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="
              mt-4 rounded-3xl border border-white/70 bg-white/80 p-5 sm:p-6 md:p-7 
              shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl
              space-y-5
            "
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="purpose"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  I&apos;m interested in
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  className="
                    w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm
                    text-slate-900 shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-sky)] focus:border-[var(--color-brand-sky)]
                  "
                  defaultValue="buy-offplan"
                >
                  <option value="buy-offplan">Buying off-plan</option>
                  <option value="buy-ready">Buying a ready property</option>
                  <option value="sell">Selling my property</option>
                  <option value="invest">Investment advice</option>
                  <option value="other">Just exploring options</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="budget"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  Approximate budget (AED)
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="text"
                  placeholder="e.g. 1M – 2M"
                  className="
                    w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm
                    text-slate-900 shadow-sm placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-sky)] focus:border-[var(--color-brand-sky)]
                  "
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  className="
                    w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm
                    text-slate-900 shadow-sm placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-sky)] focus:border-[var(--color-brand-sky)]
                  "
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="
                    w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm
                    text-slate-900 shadow-sm placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-sky)] focus:border-[var(--color-brand-sky)]
                  "
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  Phone / WhatsApp
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+971 ..."
                  className="
                    w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm
                    text-slate-900 shadow-sm placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-sky)] focus:border-[var(--color-brand-sky)]
                  "
                />
                <p className="text-[11px] text-slate-500">
                  Optional, but helps us reach you faster.
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="areas"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  Areas you&apos;re considering
                </label>
                <input
                  id="areas"
                  name="areas"
                  type="text"
                  placeholder="Downtown, Dubai Marina, Dubai Hills..."
                  className="
                    w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm
                    text-slate-900 shadow-sm placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-sky)] focus:border-[var(--color-brand-sky)]
                  "
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="message"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
              >
                Tell us a bit more
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Share any details about your timeframe, preferences or questions..."
                className="
                  w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm
                  text-slate-900 shadow-sm placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-sky)] focus:border-[var(--color-brand-sky)]
                  resize-none
                "
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
              <button
                type="submit"
                className="
                  relative inline-flex items-center justify-center gap-2 
                  overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold text-white
                  shadow-[0_18px_40px_rgba(0,76,153,0.35)]
                  transition-transform duration-200
                  hover:scale-[1.02] active:scale-[0.98]
                "
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-sky)] to-[var(--color-brand-dark)]" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                <span className="relative z-10">Send enquiry</span>
                <span className="relative z-10 text-lg leading-none">↗</span>
              </button>

              <p className="text-[11px] text-slate-500 max-w-xs">
                By sending this form you agree to be contacted by DubaiHaus about
                property opportunities. We respect your privacy.
              </p>
            </div>
          </motion.form>
        </div>

        {/* RIGHT: Info / stats card */}
        <motion.aside
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="
            flex-1 lg:max-w-sm 
            space-y-6
          "
        >
          {/* glass stats card */}
          <div
            className="
              relative overflow-hidden rounded-3xl border border-white/70 
              bg-white/80 px-5 py-6 sm:px-6 sm:py-7
              shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl
            "
          >
            <div className="absolute -top-10 right-0 h-32 w-32 rounded-full bg-[var(--color-brand-sky)] blur-3xl opacity-40" />
            <div className="absolute bottom-0 -left-10 h-24 w-24 rounded-full bg-[var(--color-brand-dark)] blur-2xl opacity-30" />

            <div className="relative z-10 space-y-5">
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Contact details
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Talk to a DubaiHaus specialist
                </h2>
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-7 w-7 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-sky)] to-[var(--color-brand-dark)] text-white text-xs font-semibold shadow-md">
                    📞
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Call / WhatsApp</p>
                    <p className="text-[13px] text-slate-600">
                      +971 XX XXX XXXX
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Mon–Sat, 10:00 – 19:00 (GST)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-7 w-7 flex items-center justify-center rounded-full bg-white text-[var(--color-brand-dark)] text-xs font-semibold shadow-md">
                    ✉️
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p className="text-[13px] text-slate-600">
                      hello@dubaihaus.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-7 w-7 flex items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold shadow-md">
                    📍
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Based in</p>
                    <p className="text-[13px] text-slate-600">
                      Dubai &amp; Abu Dhabi, UAE
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Supporting buyers from GCC, Europe &amp; worldwide.
                    </p>
                  </div>
                </div>
              </div>

              {/* mini stats */}
              <div className="mt-3 grid grid-cols-2 gap-4 border-t border-white/70 pt-4 text-center">
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl font-bold text-slate-900">
                    500+
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Clients assisted
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl font-bold text-slate-900">
                    4.9/5
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Avg. satisfaction
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* small strip / reassurance */}
          <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 px-4 py-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
            <span className="font-semibold text-[var(--color-brand-dark)]">
              Not ready to talk yet?
            </span>{" "}
            Save this page and reach out whenever you&apos;re ready. We&apos;ll
            be here with updated projects, verified information and transparent
            advice.
          </div>
        </motion.aside>
      </motion.div>
    </section>
  );
}
