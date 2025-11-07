// src/components/FAQSection.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How to Sell Property in Dubai?",
    answer:
      "Selling property in Dubai is far from a complicated process with the help of a qualified real estate agent. After finding a specialist, you will need to sign a 'FORM A', to formally mandate brokering and marketing with that agent.",
  },
  {
    question: "How to Sell Off-Plan Property in Dubai?",
    answer:
      "While it is perfectly legal to sell off-plan property in Dubai, developers set certain restrictions in order to keep these transactions under control.",
  },
  {
    question: "Why Invest in Dubai?",
    answer:
      "The investment property market in Dubai offers higher rental yields than many other mature real estate markets. The average ROI ranges between 5% and 9% as property prices per square foot are significantly lower than in other global cities such as London, Hong Kong and Paris.",
  },
  {
    question: "How to Start Real Estate Investing in Dubai?",
    answer:
      "First, identify your investment purpose. Besides using property as a private residence, you can rent it out or resell it, which are great options if you are looking to generate income.",
  },
  {
    question: "How to Invest in Property?",
    answer:
      "In Dubai, UAE residents are allowed to buy properties only in designated freehold areas. Off-plan developments are very attractive as prices are lower and developers offer flexible payment plans.",
  },
  {
    question: "How to Invest in Dubai's Real Estate?",
    answer:
      "Many investors secure a long-term income by becoming landlords. Residential real estate can generate from 5% up to 12% ROI, which is high compared to many European capital cities.",
  },
  {
    question: "How to Invest for Beginners with Little Money?",
    answer:
      "Dubai's property market offers plenty of options for any budget. Popular affordable communities include Dubai International City, Jumeirah Lake Towers, Jumeirah Village Circle and Dubai Sports City.",
  },
  {
    question: "How to Buy an Apartment in Dubai?",
    answer:
      "When choosing an area, consider factors such as infrastructure, public transport, healthcare facilities, academic institutions and overall lifestyle.",
  },
  {
    question: "Where to Buy Property in Dubai?",
    answer:
      "Dubai offers many options for every budget. Popular family-friendly and affordable communities include Jumeirah Lake Towers, Jumeirah Village Circle, Dubai International City and Dubai Sports City.",
  },
  {
    question: "What Is Off-Plan Property in Dubai?",
    answer:
      "Off-plan property is real estate under construction. It usually has a lower purchase price than ready units, and there is often the possibility to resell before completion for higher capital appreciation.",
  },
  {
    question: "How to Buy Off-Plan Property in Dubai?",
    answer:
      "The UAE real estate market is open to any buyer. You do not need a visa or Emirates ID to buy off-plan property in Dubai, only a valid passport copy.",
  },
  {
    question: "What is Real Estate Investment in Dubai?",
    answer:
      "Real estate investment in Dubai is ideal for long-term income. For example, you can buy a home, renovate and resell it, or purchase a commercial building with tenants whose rent covers your costs and generates profit.",
  },
  {
    question: "Why Invest in Real Estate in Dubai?",
    answer:
      "Property prices in Dubai are significantly lower than in many cities in Europe, America or Asia, while rental yields often remain attractive.",
  },
  {
    question: "Can Foreigners Buy Property in Dubai?",
    answer:
      "Foreign nationals can buy real estate only in designated freehold areas. In these zones, foreigners and expats can acquire freehold ownership rights without restriction, or leasehold rights for up to 99 years.",
  },
  {
    question: "Can You Obtain Dubai Citizenship?",
    answer:
      "In January 2021, the UAE approved amendments allowing several categories of foreign nationals, their spouses and children to obtain Emirati citizenship under specific conditions.",
  },
  {
    question: "Are Properties in Dubai Affordable?",
    answer:
      "Dubai offers properties across different price categories, from affordable units to ultra-luxury real estate. Location is one of the key factors influencing price.",
  },
  {
    question: "Is It Worth Buying a Property in Dubai?",
    answer:
      "Yes. One major advantage is high rental yields, averaging from 5% to 9% depending on the area and property type.",
  },
  {
    question: "How Much Is an Apartment in Dubai?",
    answer:
      "Prices vary based on location and number of bedrooms. More affordable options can be found in areas like Jumeirah Lake Towers, Dubai Investment Park and International City.",
  },
  {
    question: "Can You Live in Dubai Without a Job?",
    answer:
      "While job-linked visas are common, there are alternatives such as investor, property, freelancer and Golden Visas, each with specific financial and regulatory requirements.",
  },
  {
    question: "Can I Live in Dubai Permanently?",
    answer:
      "The UAE's Golden Visa system offers long-term residence visas (5 or 10 years) that can be renewed, provided all requirements are met.",
  },
  {
    question: "Where Can Expats Buy Property in Dubai?",
    answer:
      "Expats and foreign nationals can buy property only in freehold areas designated by the government.",
  },
  {
    question: "Can You Buy Property in Dubai with Cash?",
    answer:
      "Yes, you can. Cash buyers often have stronger negotiating power and may secure better deals.",
  },
  {
    question: "What Is the Minimum Investment Amount in Dubai?",
    answer:
      "The minimum entry point changes over time, but there are studios and smaller units in emerging communities that provide relatively low starting prices for investors.",
  },
];

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

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);

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
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Frequently Asked Questions about{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
              Dubai Real Estate
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Clear, concise answers to help you make confident investment decisions
            in Dubai&apos;s property market.
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
                key={item.question}
                variants={itemVariants}
                layout
                // New items after "See more" also animate in
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
                {showAll ? "Show Less Questions" : "See More Questions"}
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
              { number: "23+", label: "Questions Answered" },
              { number: "100%", label: "Verified Information" },
              { number: "24/7", label: "Expert Support" },
              { number: "5000+", label: "Investors Helped" },
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
                <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
