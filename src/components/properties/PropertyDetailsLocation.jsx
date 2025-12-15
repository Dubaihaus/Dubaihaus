"use client";

export default function PropertyDetailsLocation({ property }) {
    const details = property.details || {};
    // Location highlights from details.locationDescription

    // Building Details list
    const buildingDetails = [
        { label: "Completion Date", value: details.completionDate ? new Date(details.completionDate).toLocaleDateString() : null },
        { label: "Handover Date", value: details.handoverDate ? new Date(details.handoverDate).toLocaleDateString() : null },
        { label: "Construction Status", value: details.constructionStatus },
        { label: "Developer", value: details.developerName },
        { label: "Furnishing", value: details.furnishing },
    ].filter(d => d.value);

    if (!details.locationDescription && buildingDetails.length === 0) return null;

    return (
        <section className="px-4 py-12 md:px-16 bg-white max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Building Details */}
                {buildingDetails.length > 0 && (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Property & Building Details</h3>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-4">
                            {buildingDetails.map((item, i) => (
                                <div key={i} className="flex justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                                    <span className="text-gray-600 font-medium">{item.label}</span>
                                    <span className="text-gray-900 font-semibold text-right">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Location */}
                {details.locationDescription && (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Location & Benefits</h3>
                        <div className="prose prose-sky text-gray-700">
                            <p className="whitespace-pre-line">{details.locationDescription}</p>
                        </div>
                        {/* Benefits list if available (currently stored as JSON or just bullet points in description) */}
                    </div>
                )}
            </div>
        </section>
    );
}
