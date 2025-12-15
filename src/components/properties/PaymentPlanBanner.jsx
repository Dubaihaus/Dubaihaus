"use client";

export default function PaymentPlanBanner({ property }) {
    const plans = property.paymentPlans || [];
    if (plans.length === 0) return null;

    // Only show the first plan for now
    const plan = plans[0];
    const steps = plan.steps || [];

    return (
        <section className="py-10 md:py-14">
            <div className="max-w-7xl mx-auto px-5 md:px-10">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-sky-700/20 bg-gradient-to-b from-gray-900 to-sky-900">
                    <div className="px-6 md:px-10 pt-8 text-center text-white">
                        <h2 className="text-2xl md:text-4xl font-bold tracking-tight">{plan.title}</h2>
                        {plan.subtitle && <p className="mt-2 text-sky-200">{plan.subtitle}</p>}
                    </div>

                    <div className="px-6 md:px-10 pb-8 mt-6">
                        <div className="mx-auto max-w-5xl">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {steps.map((step, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center rounded-xl bg-sky-600/10 border border-white/40 backdrop-blur-[1px] px-6 py-6 text-center">
                                        <div className="text-white text-4xl md:text-5xl font-extrabold leading-none">{step.percent}%</div>
                                        <div className="mt-2 text-sky-50 text-sm md:text-base font-medium">{step.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
