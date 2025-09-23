'use client';
import Image from 'next/image';
import { FaArrowRight, FaBuilding, FaHandsHelping, FaStar } from 'react-icons/fa';
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';

const OffPlanPropertyTypesSection = () => {
    const router = useRouter();
    const t = useTranslations('offPlan');

    const propertyTypes = [
        {
            title: t('propertyTypes.penthouses.title'),
            label: t('propertyTypes.penthouses.label'),
            image: '/dashboard/apartments.jpg',
            filters: { unit_types: "Penthouse" }, // Updated to match API enum values
        },
        {
            title: t('propertyTypes.townhouses.title'),
            label: t('propertyTypes.townhouses.label'),
            image: '/dashboard/townhouses.jpg',
            filters: { unit_types: "Townhouse" }, // Updated to match API enum values
        },
        {
            title: t('propertyTypes.villas.title'),
            label: t('propertyTypes.villas.label'),
            image: '/dashboard/villas.jpg',
            filters: { unit_types: "Villa" }, // Updated to match API enum values
        },
        {
            title: t('propertyTypes.all.title'),
            label: t('propertyTypes.all.label'),
            image: '/dashboard/building.jpg',
            filters: {}, // No extra filter = all
        },
    ];

    const handleCardClick = (filters) => {
        const params = new URLSearchParams(filters).toString();
        router.push(`/off-plan${params ? `?${params}` : ''}`);
    };

    return (
        <section className="px-4 py-16 md:px-16 bg-white" dir="ltr">
            {/* Heading Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-10">
                {/* Left Text */}
                <div className="max-w-2xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        {t('heading')}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {t('description')}
                    </p>
                </div>

                {/* Icons */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FaBuilding className="text-sky-600 text-xl" />
                        <span>{t('icons.brandNew')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FaHandsHelping className="text-sky-600 text-xl" />
                        <span>{t('icons.support')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FaStar className="text-sky-600 text-xl" />
                        <span>{t('icons.priority')}</span>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="mt-4 lg:mt-0">
                    <button className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-6 py-2 rounded-md transition">
                        {t('cta')}
                    </button>
                </div>
            </div>

            {/* Property Types Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {propertyTypes.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => handleCardClick(item.filters)}
                        className="relative rounded-lg overflow-hidden group shadow hover:shadow-lg transition cursor-pointer"
                    >
                        <Image
                            src={item.image}
                            alt={item.title}
                            width={400}
                            height={300}
                            className="object-cover w-full h-[200px]"
                        />
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                            {item.label}
                        </span>

                        {/* Title */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white">
                            <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
                            <FaArrowRight className="text-sky-500 text-sm" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default OffPlanPropertyTypesSection;