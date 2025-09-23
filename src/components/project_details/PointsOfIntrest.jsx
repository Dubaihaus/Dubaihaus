'use client';

export default function PointsOfInterestSection({ property }) {
  if (!property.pointsOfInterest || property.pointsOfInterest.length === 0) {
    return null;
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Nearby Locations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {property.pointsOfInterest.map((poi, index) => (
          <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">{poi.map_point_name}</h3>
              <p className="text-sm text-gray-600">{poi.distance} km away</p>
            </div>
            <span className="text-blue-600 font-medium">{poi.time} min</span>
          </div>
        ))}
      </div>
    </section>
  );
}