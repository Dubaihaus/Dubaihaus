'use client';
import Image from 'next/image';

const ProjectDetailsHighlights = ({ property }) => { // <-- Accept property
    const brochureImage = property?.media?.photos?.[1] || "/project_detail_images/building.jpg"; // another project image
    const location = property?.location?.community?.name || "Dubai"; // API location
    const propertyTypes = property?.type?.sub || "Apartments"; // property type
    const description = property?.description || "No description available."; // description
    const size = property?.area?.built_up ? `${property.area.built_up} ${property.area.unit}` : "Size TBA"; // size
    const completionDate = property?.details?.completion_details?.completion_date
        ? new Date(property.details.completion_details.completion_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "TBA"; // completion date
    const price = property?.price ? `AED ${property.price.toLocaleString()}` : "Price on request"; // price
    return (
        <section className="relative grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-12 py-12 bg-white" dir="ltr">

            {/* Right Column: Brochure Image */}
            <div className="flex justify-center items-center">
                <Image
                    src={brochureImage} // <-- API image
                    alt={property?.title || "Project Brochure"}
                    width={600}
                    height={450}
                    className="w-full h-auto object-contain"
                />
            </div>

            {/* Left Column: Text Content */}
            <div className="space-y-6 text-gray-800 text-sm leading-relaxed">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Location</h2>
                    <p>{location}</p> {/* <-- API location */}
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Property Types</h2>
                    <p>{propertyTypes}</p> {/* <-- API type */}
                </div>

                <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: description }}
                />

                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Investment Potential:</h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Located in {location}</li>
                        <li>Completion by {completionDate}</li>
                        <li>Starting price {price}</li>
                    </ul>
                </div>

                <div>
                    <p><span className="font-semibold">Average size:</span> {size}</p>
                    <p><span className="font-semibold">Starting price:</span> {price}</p>
                    <p><span className="font-semibold">Completion Due Date:</span> {completionDate}</p>
                </div>

                {/* Brochure Button */}
                <div>
                    <a
                        href={property?.meta?.url || "#"} // <-- API property link
                        className="inline-block mt-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md transition-all"
                    >
                        Download Free PDF Brochure
                    </a>
                </div>
            </div>

        </section>
    );
};

export default ProjectDetailsHighlights;
