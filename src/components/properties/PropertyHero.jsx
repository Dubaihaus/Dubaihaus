"use client";
import Image from "next/image";
import { useState } from "react";
import ContactModal from "@/components/ContactModal"; // Ensure this exists or use a new one
import { FaMoneyBillWave, FaCalendarAlt, FaPercent } from "react-icons/fa";

export default function PropertyHero({ property }) {
    const [open, setOpen] = useState(false);

    // Data extraction
    const title = property.title;
    const location = property.location;
    const price = property.price;
    const image = property.images?.[0]?.url || property.gallery?.find(g => g.category === "EXTERIOR")?.url || "/project_detail_images/building.jpg";

    // Stats
    const paymentPlanTitle = property.paymentPlans?.[0]?.title;
    const handoverDate = property.details?.handoverDate
        ? new Date(property.details.handoverDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : (property.details?.completionDate ? new Date(property.details.completionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null);

    const priceFormatted = price ? `AED ${price.toLocaleString()}` : "Price on Request";

    // Breadcrumbs (Simplified)
    return (
        <section className="relative rounded-2xl bg-white/80 backdrop-blur-[1px] shadow-[0_10px_30px_rgba(17,24,39,0.06)] px-5 py-10 md:px-10 md:py-14 lg:px-14 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 overflow-visible">

            {/* LEFT: Image */}
            <div className="relative pr-4 md:pr-8">
                <div className="relative w-full h-[320px] md:h-[480px] lg:h-[540px] rounded-[28px] overflow-hidden shadow-xl md:translate-x-[3%]">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover hover:scale-[1.03] transition-transform duration-700 ease-out"
                        priority
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/25 to-transparent" />
                </div>
            </div>

            {/* RIGHT: Content */}
            <div className="flex flex-col justify-center gap-6 md:gap-7 pl-4 md:pl-8">
                <nav className="text-[13px] md:text-sm text-gray-500">
                    <span className="text-gray-400">Main Page &gt; Featured Properties &gt;</span>{' '}
                    <span className="text-sky-600 font-medium">{location}</span>
                </nav>

                <header className="space-y-2">
                    <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight">
                        {title}
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-slate-700">
                        in <span className="text-sky-600">{location}</span>
                    </p>
                </header>

                <div className="flex items-center gap-5 mt-2">
                    <button
                        onClick={() => setOpen(true)}
                        className="min-w-[172px] rounded-xl px-7 py-3.5 text-white font-semibold bg-gradient-to-r from-sky-400 to-blue-400 hover:from-sky-500 hover:to-blue-600 shadow-[0_10px_20px_rgba(56,189,248,0.25)] transition-all"
                    >
                        Discover More
                    </button>
                    {/* QR Code placeholder or omitted */}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mt-4">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="bg-sky-50 p-3 rounded-lg"><FaMoneyBillWave className="text-sky-400 text-2xl" /></div>
                        <div>
                            <p className="font-bold text-slate-900 text-lg">{priceFormatted}</p>
                            <span className="text-slate-500 text-sm">Starting Price</span>
                        </div>
                    </div>

                    {paymentPlanTitle && (
                        <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div className="bg-sky-50 p-3 rounded-lg"><FaPercent className="text-sky-400 text-2xl" /></div>
                            <div>
                                <p className="font-bold text-slate-900 text-md">{paymentPlanTitle}</p>
                                <span className="text-slate-500 text-sm">Payment Plan</span>
                            </div>
                        </div>
                    )}

                    {handoverDate && (
                        <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div className="bg-sky-50 p-3 rounded-lg"><FaCalendarAlt className="text-sky-400 text-2xl" /></div>
                            <div>
                                <p className="font-bold text-slate-900 text-lg">{handoverDate}</p>
                                <span className="text-slate-500 text-sm">Handover</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ContactModal
                open={open}
                onClose={() => setOpen(false)}
                projectTitle={title}
            />
        </section>
    );
}
