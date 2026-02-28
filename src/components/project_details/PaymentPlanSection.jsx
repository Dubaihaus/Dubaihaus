'use client';
import { useTranslations } from 'next-intl';

function hasUsableSteps(plan) {
  return plan && Array.isArray(plan.steps) && plan.steps.length > 0;
}

function planTitle(plan, property, t) {
  const dev =
    property?.rawData?.developer?.name ||
    property?.developer?.name ||
    property?.rawData?.developer_name ||
    property?.developer ||
    null;

  const sorted = [...(plan.steps || [])]
    .filter((s) => typeof s?.percentage === 'number')
    .sort((a, b) => b.percentage - a.percentage);

  let ratio = '';
  if (sorted.length >= 2) {
    const a = Math.round(sorted[0].percentage);
    const b = Math.round(sorted[1].percentage);
    const total = (plan.steps || []).reduce(
      (t_acc, s) => t_acc + (Number(s.percentage) || 0),
      0
    );
    if (total > 0 && a + b >= total * 0.9) {
      ratio = `${a}/${b}`;
    }
  }

  const rawName = (plan.name || '').trim();

  // Base text:
  // - If we have a ratio, use that (e.g. "60/40")
  // - Else use plan.name
  // - Else fall back to "Payment Plan"
  let base = ratio || rawName || t('paymentPlan.fallbackTitle');

  // 🔹 Avoid "Payment Plan Payment Plan" duplication
  const fallbackTitle = t('paymentPlan.fallbackTitle').toLowerCase();
  if (!ratio && rawName && rawName.toLowerCase().includes(fallbackTitle)) {
    base = rawName; // already contains translated "Payment Plan"
  }

  return dev ? t('paymentPlan.fromDeveloper', { base, developer: dev }) : base;
}

export default function PaymentPlanSection({ property }) {
  const t = useTranslations('projectDetails');
  const plans = Array.isArray(property?.paymentPlans) ? property.paymentPlans.filter(hasUsableSteps) : [];

  // If nothing useful, render nothing.
  if (!plans.length) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        {plans.map((plan, index) => {
          const title = planTitle(plan, property, t);
          const durationMonths = Number(plan?.duration_months);

          return (
            <div key={index} className="mb-10 last:mb-0">
              {/* Banner */}
              <div className="rounded-2xl overflow-hidden shadow-lg border border-sky-700/20 bg-gradient-to-b from-brand-dark to-sky-700">
                {/* Title */}
                <div className="px-6 md:px-10 pt-8 text-center">
                  <h2 className="text-white text-2xl md:text-4xl font-bold tracking-tight">
                    {title}
                  </h2>
                </div>

                {/* Steps */}
                <div className="px-6 md:px-10 pb-8 mt-6">
                  <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {plan.steps.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex flex-col items-center justify-center rounded-xl bg-sky-600/10 border border-white/40 backdrop-blur-[1px] px-6 py-6 text-center"
                        >
                          <div className="text-white text-4xl md:text-5xl font-extrabold leading-none">
                            {typeof step.percentage === 'number' ? `${step.percentage}%` : step.percentage}
                          </div>
                          <div className="mt-2 text-sky-50 text-sm md:text-base font-medium">
                            {step.name || t('paymentPlan.installment')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Duration (optional) */}
                    {durationMonths > 0 && (
                      <div className="mt-6 text-center">
                        <span className="inline-block rounded-full bg-white/15 text-white px-4 py-1 text-sm font-semibold border border-white/30">
                          {t('paymentPlan.duration', { months: durationMonths })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Deposit info (outside the blue banner; only if provided) */}
              {property?.depositDescription && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="text-slate-900 font-semibold mb-1">{t('paymentPlan.depositTitle')}</h3>
                  <p className="text-slate-700">{property.depositDescription}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
