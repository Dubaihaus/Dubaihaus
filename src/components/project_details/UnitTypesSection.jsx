'use client';
import Image from 'next/image';

export default function UnitTypesSection({ property }) {
  if (!property.unitTypes || property.unitTypes.length === 0) {
    return (
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Unit Types</h2>
        <p className="text-gray-600">No unit information available.</p>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Unit Types</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {property.unitTypes.map((unit, index) => (
          <div key={index} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {unit.layouts.length > 0 && (
              <div className="relative h-48">
                <Image
                  src={unit.layouts[0].image?.url}
                  alt={`${unit.bedrooms} bedroom layout`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {unit.bedrooms} Bedroom {unit.unitType}
              </h3>
              
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>Price: AED {unit.priceFromAED?.toLocaleString()} - {unit.priceToAED?.toLocaleString()}</p>
                <p>Size: {unit.sizeFromSqft} - {unit.sizeToSqft} sqft</p>
                <p>({unit.sizeFromM2} - {unit.sizeToM2} m²)</p>
              </div>
              
              {unit.layouts.length > 0 && (
                <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                  View Floor Plan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}