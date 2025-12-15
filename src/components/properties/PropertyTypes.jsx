"use client";

export default function PropertyTypes({ property }) {
    const types = property.types || [];
    if (types.length === 0) return null;

    return (
        <section className="bg-white p-6 md:p-12 mb-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Unit Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {types.map((type, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-50">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">{type.name}</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                {type.priceFrom && (
                                    <div className="flex justify-between border-b pb-2">
                                        <span>Starting Price</span>
                                        <span className="font-medium text-gray-900">{type.priceFrom}</span>
                                    </div>
                                )}
                                {(type.sizeFrom || type.sizeTo) && (
                                    <div className="flex justify-between border-b pb-2">
                                        <span>Size Range</span>
                                        <span className="font-medium text-gray-900">
                                            {type.sizeFrom ? `${type.sizeFrom}` : ''}
                                            {type.sizeFrom && type.sizeTo ? ' - ' : ''}
                                            {type.sizeTo ? `${type.sizeTo}` : ''} sqft
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
