// src/components/FAQSection.jsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

const BASE_FAQS = 10;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const accordionVariants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

/** Keys for all FAQ items, texts come from JSON */
const FAQ_KEYS = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
  "q9",
  "q10",
  "q11",
  "q12",
  "q13",
  "q14",
  "q15",
  "q16",
  "q17",
  "q18",
  "q19",
  "q20",
  "q21",
  "q22",
  "q23",
];

export default function FAQSection() {
  const t = useTranslations();
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const faqs = useMemo(
    () =>
      FAQ_KEYS.map((key) => ({
        key,
        question: t(`faq.items.${key}.question`),
        answer: t(`faq.items.${key}.answer`),
      })),
    [t]
  );

  const visibleFaqs = showAll ? faqs : faqs.slice(0, BASE_FAQS);

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#F5F7FB] py-20 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-sky-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-30" />

      <div className="mx-auto max-w-5xl relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[11px] font-bold uppercase tracking-[0.25em] text-sky-500 mb-4"
          >
            {t("faq.badge")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            {t("faq.title")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
              {t("faq.highlight")}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            {t("faq.subtitle")}
          </motion.p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="space-y-4"
        >
          {visibleFaqs.map((item, index) => {
            const isOpen = openIndex === index;
            const isExtra = showAll && index >= BASE_FAQS;

            return (
              <motion.div
                key={item.key}
                variants={itemVariants}
                layout
                initial={isExtra ? "hidden" : undefined}
                animate={isExtra ? "visible" : undefined}
                className={[
                  "border border-slate-200 rounded-2xl bg-white overflow-hidden",
                  "shadow-lg hover:shadow-xl transition-all duration-300",
                  "group cursor-pointer",
                  isOpen ? "ring-2 ring-sky-500/20 shadow-xl" : "",
                ].join(" ")}
              >
                {/* Question row */}
                <motion.button
                  type="button"
                  onClick={() => handleToggle(index)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-6 text-left"
                  aria-expanded={isOpen}
                  whileHover={{ backgroundColor: "rgba(0, 198, 255, 0.02)" }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.h3
                    className="text-base sm:text-lg font-semibold text-slate-900 pr-4 leading-relaxed"
                    layout
                  >
                    {item.question}
                  </motion.h3>

                  {/* Animated Icon */}
                  <motion.div
                    className="flex-shrink-0"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg
                        className="w-4 h-4 text-white transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </motion.div>
                </motion.button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      variants={accordionVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="overflow-hidden"
                    >
                      <motion.div
                        className="px-6 pb-6 text-slate-700 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                      >
                        <p className="text-base">{item.answer}</p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Show more / show less */}
        {faqs.length > BASE_FAQS && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 flex justify-center"
          >
            <motion.button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00C2FF] to-[#0099CC] rounded-full shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <div className="relative flex items-center gap-3 text-white font-semibold text-base px-8 py-4">
                {showAll
                  ? t("faq.buttons.showLess")
                  : t("faq.buttons.seeMore")}
                <motion.span
                  animate={{ rotate: showAll ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center w-5 h-5"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.span>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Stats footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 pt-8 border-t border-slate-200"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: "23+", label: t("faq.stats.questionsAnswered") },
              { number: "100%", label: t("faq.stats.verifiedInformation") },
              { number: "24/7", label: t("faq.stats.expertSupport") },
              { number: "5000+", label: t("faq.stats.investorsHelped") },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-slate-900">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
