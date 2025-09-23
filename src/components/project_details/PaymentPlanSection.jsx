'use client';

export default function PaymentPlanSection({ property }) {
  if (!property.paymentPlans || property.paymentPlans.length === 0) {
    return null;
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Plan</h2>
      
      {property.paymentPlans.map((plan, index) => (
        <div key={index} className="mb-6 last:mb-0">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{plan.name}</h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {plan.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="text-gray-700">{step.name}</span>
                  <span className="font-semibold text-blue-600">{step.percentage}%</span>
                </div>
              ))}
            </div>
            
            {plan.duration_months > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                Duration: {plan.duration_months} months
              </p>
            )}
          </div>
        </div>
      ))}
      
      {property.depositDescription && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Deposit Information</h4>
          <p className="text-blue-700">{property.depositDescription}</p>
        </div>
      )}
    </section>
  );
}