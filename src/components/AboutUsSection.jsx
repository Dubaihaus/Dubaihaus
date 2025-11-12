"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users2,
  Globe2,
  BadgeCheck,
  Target,
  Sparkles,
  Shield,
  Award,
  TrendingUp,
  Heart,
  Building,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const stats = [
  { number: "500+", label: "Happy Clients", icon: Users2 },
  { number: "4.9/5", label: "Client Rating", icon: Award },
  { number: "AED 2B+", label: "Property Value", icon: TrendingUp },
  { number: "2024", label: "Established", icon: Building },
];

export default function AboutUsSection() {
  return (
    <section
      className="
        relative w-full 
        bg-[radial-gradient(circle_at_bottom,_#F5F7FB_0,_white_70%)]
        py-20 md:py-28 px-4
        overflow-hidden
      "
    >
      {/* Brand Blobs */}
      <div className="pointer-events-none absolute -top-16 -left-10 h-56 w-56 rounded-full bg-[var(--color-brand-sky)] blur-3xl opacity-20" />
      <div className="pointer-events-none absolute -bottom-16 -right-8 h-64 w-64 rounded-full bg-[var(--color-brand-dark)] blur-3xl opacity-20" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* HEADER */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-sky)]" />
            About DubaiHaus
          </div>

          <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
            Building{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-sky)] to-[var(--color-brand-dark)]">
              Trust & Transparency
            </span>{" "}
            in Every Property
          </h2>

          <p className="mt-5 text-slate-600 text-lg sm:text-xl leading-relaxed">
            Since 2024, DubaiHaus has been redefining how people buy, sell, and
            invest in real estate across Dubai and Abu Dhabi — with verified data,
            genuine advice, and expert guidance from people who care.
          </p>
        </motion.div>

        {/* STATS */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              className="
                relative p-6 rounded-2xl bg-white/80 border border-white/70
                shadow-[0_8px_32px_rgba(15,23,42,0.08)]
                text-center backdrop-blur-xl transition-all duration-500
                group hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,76,153,0.15)]
              "
            >
              <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-sky)] to-[var(--color-brand-dark)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <stat.icon size={16} className="text-white" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stat.number}</p>
              <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 3 KEY VALUES */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {[
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: "Verified & Authentic",
              body: "Every project we recommend undergoes rigorous verification. No fake listings, no hidden agendas — only developer-approved data.",
            },
            {
              icon: <Heart className="h-5 w-5" />,
              title: "Client-First Approach",
              body: "Your goals come first. We listen carefully and design property options that truly match your lifestyle and investment goals.",
            },
            {
              icon: <Globe2 className="h-5 w-5" />,
              title: "Global Buyer Support",
              body: "Remote consultations, digital paperwork, and guidance for clients from GCC, Europe, and around the world.",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={fadeUp}
              className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl"
            >
              <div className="absolute -top-10 right-0 h-28 w-28 rounded-full bg-[var(--color-brand-sky)] blur-3xl opacity-25" />
              <div className="absolute bottom-0 -left-10 h-24 w-24 rounded-full bg-[var(--color-brand-dark)] blur-2xl opacity-15" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-sky)] to-[var(--color-brand-dark)] text-white w-10 h-10 shadow-md">
                  {card.icon}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{card.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* PLAN & AUTHENTICITY BAND */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={fadeUp}
          className="
            mt-8 rounded-3xl border border-sky-100 bg-gradient-to-r from-[#F3FAFF] to-[#F6FFFD]
            p-6 sm:p-7 md:p-10
          "
        >
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Our Plan</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">What We’re Building</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A faster, more transparent discovery experience: verified project data, live availability,
                expert concierge recommendations, and one-tap booking support.
              </p>
            </div>

            <ul className="space-y-3">
              {[
                { icon: <BadgeCheck className="h-4 w-4" />, text: "Developer-verified data & brochures" },
                { icon: <Target className="h-4 w-4" />, text: "Tailored shortlists by budget & area" },
                { icon: <Sparkles className="h-4 w-4" />, text: "Transparent payment plans & handovers" },
              ].map((li, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[var(--color-brand-sky)] shadow-sm">
                    {li.icon}
                  </span>
                  <span className="text-sm text-slate-700">{li.text}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Authenticity</p>
              <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
                We work directly with authorized developers and agencies.
                All information and pricing are verified before being published.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
       <motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.35 }}
  variants={fadeUp}
  className="relative mt-16 rounded-3xl bg-gradient-to-r from-[var(--color-brand-sky)] to-[var(--color-brand-dark)] p-10 text-center overflow-hidden"
>
  <div className="absolute inset-0 opacity-10">
    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white" />
    <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-white" />
  </div>

  <div className="relative z-10 space-y-4">
    <h3 className="text-2xl md:text-3xl font-bold text-white">
      Ready to start your property journey?
    </h3>
    <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto">
      Book a quick consultation—no obligation, just clear guidance.
    </p>

    <button
      type="button"
      onClick={() => {
        const el = document.getElementById('contact-section');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
      className="
        inline-flex items-center justify-center
        rounded-2xl bg-white text-[var(--color-brand-dark)]
        px-8 py-4 font-semibold shadow-2xl
        hover:scale-105 transition-transform duration-200
      "
    >
      Book a consultation
    </button>
  </div>
     <p className="text-blue-100/80 text-sm mt-6">
              No obligation — just honest advice from verified property experts.
            </p>
</motion.div>
      </div>
    </section>
  );
}
