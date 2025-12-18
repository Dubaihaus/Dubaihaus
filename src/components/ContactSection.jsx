// src/components/ContactSection.jsx
"use client";
import PhoneInput, { getCountries, getCountryCallingCode } from "react-phone-number-input";
import { isValidPhoneNumber } from "libphonenumber-js";


import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};
function countryToFlagEmoji(countryCode) {
  // "AE" -> 🇦🇪
  return String(countryCode || "")
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

const PHONE_LABELS = getCountries().reduce((acc, c) => {
  // label becomes: "🇦🇪 +971" (no name)
  acc[c] = `${countryToFlagEmoji(c)} +${getCountryCallingCode(c)}`;
  return acc;
}, {});


export default function ContactSection() {
  const t = useTranslations(); // use full keys, e.g. "contact.badge"
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // "ok" | "error" | null
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      
      purpose: formData.get("purpose"),
      budget: formData.get("budget"),
      name: formData.get("name"),
      email: formData.get("email"),
   phone,
      areas: formData.get("areas"),
      message: formData.get("message"),
      projectTitle: "General Contact Form",
      consentMarketing: false,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("CONTACT /api/contact status:", res.status);

      if (res.ok) {
        try {
          await res.json();
        } catch {
          /* ignore JSON parse error */
        }
        setStatus("ok");
        form.reset();
        setPhone("");
      } else {
        let data = null;
        try {
          data = await res.json();
        } catch {
          /* ignore */
        }
        console.error("CONTACT /api/contact error:", res.status, data);
        setStatus("error");
      }
    } catch (err) {
      console.error("CONTACT fetch failed:", err);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact-section"
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
            <span className="text-slate-700">
              {t("contact.badge")}
            </span>
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
              {t("contact.headline")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-sky)] to-[var(--color-brand-dark)]"></span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed"
            >
              {t("contact.subheadline")}
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
                <span>{t("contact.chips.noObligation")}</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-sky)]" />
                <span>{t("contact.chips.responseTime")}</span>
              </span>
            </motion.div>
          </div>

          {/* form card */}
          <motion.form
            onSubmit={handleSubmit}
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
                  {t("contact.form.purpose.label")}
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
                  <option value="buy-offplan">
                    {t("contact.form.purpose.options.buyOffplan")}
                  </option>
                  <option value="buy-ready">
                    {t("contact.form.purpose.options.buyReady")}
                  </option>
                  <option value="sell">
                    {t("contact.form.purpose.options.sell")}
                  </option>
                  <option value="invest">
                    {t("contact.form.purpose.options.invest")}
                  </option>
                  <option value="other">
                    {t("contact.form.purpose.options.other")}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="budget"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  {t("contact.form.budget.label")}
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="text"
                  placeholder={t("contact.form.budget.placeholder")}
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
                  {t("contact.form.name.label")}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t("contact.form.name.placeholder")}
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
                  {t("contact.form.email.label")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("contact.form.email.placeholder")}
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
                  {t("contact.form.phone.label")}
                </label>
              <PhoneInput
  id="phone"
  international
  defaultCountry="AE"
  addInternationalOption={false}
  labels={PHONE_LABELS}
  value={phone}
  onChange={(val) => setPhone(val || "")}
  className="
    w-full flex items-center gap-2
    rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm
    text-slate-900 shadow-sm
    focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--color-brand-sky)]
    focus-within:border-[var(--color-brand-sky)]
  "
  countrySelectProps={{
    className: `
      bg-transparent border-none outline-none p-0
      text-sm text-slate-900 cursor-pointer
      w-[92px] shrink-0
    `,
    "aria-label": "Country code",
  }}
  numberInputProps={{
    className: `
      min-w-0 flex-1 bg-transparent border-none outline-none p-0
      text-sm placeholder:text-slate-400 focus:ring-0
    `,
    placeholder: t("contact.form.phone.placeholder"),
  }}
/>


                <p className="text-[11px] text-slate-500">
                  {t("contact.form.phoneHint")}
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="areas"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  {t("contact.form.areas.label")}
                </label>
                <input
                  id="areas"
                  name="areas"
                  type="text"
                  placeholder={t("contact.form.areas.placeholder")}
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
                {t("contact.form.message.label")}
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder={t("contact.form.message.placeholder")}
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
                disabled={submitting}
                className="
                  relative inline-flex items-center justify-center gap-2 
                  overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold text-white
                  shadow-[0_18px_40px_rgba(0,76,153,0.35)]
                  transition-transform duration-200
                  hover:scale-[1.02] active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  group
                "
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-sky)] to-[var(--color-brand-dark)]" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                <span className="relative z-10">
                  {submitting
                    ? t("contact.form.submitSubmitting")
                    : t("contact.form.submitIdle")}
                </span>
                {!submitting && (
                  <span className="relative z-10 text-lg leading-none">↗</span>
                )}
              </button>

              <p className="text-[11px] text-slate-500 max-w-xs">
                {t("contact.disclaimer")}
              </p>
            </div>

            {/* status messages */}
            {status === "ok" && (
              <p className="text-sm text-emerald-600">
                {t("contact.status.success")}
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-600">
                {t("contact.status.error")}
              </p>
            )}
          </motion.form>
        </div>

        {/* RIGHT: Info / stats card */}
        <motion.aside
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1 lg:max-w-sm space-y-6"
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
                  {t("contact.aside.badge")}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {t("contact.aside.title")}
                </h2>
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-7 w-7 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-sky)] to-[var(--color-brand-dark)] text-white text-xs font-semibold shadow-md">
                    📞
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {t("contact.aside.whatsapp.label")}
                    </p>
                    <p className="text-[13px] text-slate-600">
                      {t("contact.aside.whatsapp.number")}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {t("contact.aside.whatsapp.hours")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-7 w-7 flex items-center justify-center rounded-full bg-white text-[var(--color-brand-dark)] text-xs font-semibold shadow-md">
                    ✉️
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {t("contact.aside.email.label")}
                    </p>
                    <p className="text-[13px] text-slate-600">
                      {t("contact.aside.email.value")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-7 w-7 flex items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold shadow-md">
                    📍
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {t("contact.aside.location.label")}
                    </p>
                    <p className="text-[13px] text-slate-600">
                      {t("contact.aside.location.value")}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {t("contact.aside.location.hint")}
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
                    {t("contact.aside.stats.clients")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl font-bold text-slate-900">
                    4.9/5
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {t("contact.aside.stats.satisfaction")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* small strip / reassurance */}
          <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 px-4 py-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
            <span className="font-semibold text-[var(--color-brand-dark)]">
              {t("contact.aside.strip.title")}
            </span>{" "}
            {t("contact.aside.strip.body")}
          </div>
        </motion.aside>
      </motion.div>
    </section>
  );
}
