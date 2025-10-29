'use client';

function hasUsableSteps(plan) {
  return plan && Array.isArray(plan.steps) && plan.steps.length > 0;
}

function planTitle(plan, property) {
  const dev =
    property?.rawData?.developer?.name ||
    property?.developer?.name ||
    property?.rawData?.developer_name ||
    property?.developer ||
    null;

  // Try to infer a concise headline like "60/40" from step totals (optional).
  // We’ll pick the two largest buckets if they stand out, else show plan.name.
  const sorted = [...(plan.steps || [])]
    .filter(s => typeof s?.percentage === 'number')
    .sort((a, b) => b.percentage - a.percentage);

  let ratio = '';
  if (sorted.length >= 2) {
    const a = Math.round(sorted[0].percentage);
    const b = Math.round(sorted[1].percentage);
    const total = plan.steps.reduce((t, s) => t + (Number(s.percentage) || 0), 0);
    // Only show ratio if the top two account for most of the total
    if (total > 0 && a + b >= total * 0.9) {
      ratio = `${a}/${b}`;
    }
  }

  const base = ratio || plan.name || 'Payment Plan';
  return dev ? `${base} Payment Plan from ${dev}` : `${base} Payment Plan`;
}

export default function PaymentPlanSection({ property }) {
  const plans = Array.isArray(property?.paymentPlans) ? property.paymentPlans.filter(hasUsableSteps) : [];

  // If nothing useful, render nothing.
  if (!plans.length) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        {plans.map((plan, index) => {
          const title = planTitle(plan, property);
          const duration = Number(plan?.duration_months) > 0 ? `${plan.duration_months} months` : null;

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
                            {step.name || 'Installment'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Duration (optional) */}
                    {duration && (
                      <div className="mt-6 text-center">
                        <span className="inline-block rounded-full bg-white/15 text-white px-4 py-1 text-sm font-semibold border border-white/30">
                          Duration: {duration}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Deposit info (outside the blue banner; only if provided) */}
              {property?.depositDescription && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="text-slate-900 font-semibold mb-1">Deposit Information</h3>
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
