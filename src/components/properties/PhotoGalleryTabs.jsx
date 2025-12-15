"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function PhotoGalleryTabs({ property }) {
    const gallery = property.gallery || [];

    // Sort logic? They are already sorted by position from DB.

    const exterior = gallery.filter(g => g.category === "EXTERIOR");
    const interior = gallery.filter(g => g.category === "INTERIOR");
    const all = gallery; // All images

    const [activeTab, setActiveTab] = useState(exterior.length > 0 ? "exterior" : (interior.length > 0 ? "interior" : "all"));

    const images = activeTab === "exterior" ? exterior : (activeTab === "interior" ? interior : all);

    const [currentIndex, setCurrentIndex] = useState(0);

    if (all.length === 0) return null;

    const currentImage = images[currentIndex] || images[0];

    return (
        <section className="relative max-w-7xl w-full mx-auto px-5 py-12 md:px-10 md:py-16 lg:px-14 bg-white/80 backdrop-blur-[1px] rounded-2xl shadow-sm my-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2">Photo Gallery</h2>
                    <p className="text-slate-600">{images.length} photos available</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {exterior.length > 0 && (
                        <button onClick={() => { setActiveTab("exterior"); setCurrentIndex(0); }} className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "exterior" ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Exteriors</button>
                    )}
                    {interior.length > 0 && (
                        <button onClick={() => { setActiveTab("interior"); setCurrentIndex(0); }} className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "interior" ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Interiors</button>
                    )}
                    <button onClick={() => { setActiveTab("all"); setCurrentIndex(0); }} className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "all" ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>All Photos</button>
                </div>
            </div>

            <div className="relative mb-6 rounded-2xl overflow-hidden bg-slate-100 shadow-xl w-full h-[500px] md:h-[600px]">
                {currentImage && (
                    <Image
                        src={currentImage.url}
                        alt="Gallery Image"
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                {images.length > 1 && (
                    <>
                        <button onClick={() => setCurrentIndex((currentIndex - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70">‹</button>
                        <button onClick={() => setCurrentIndex((currentIndex + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70">›</button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex flex-wrap gap-2 justify-center">
                    {images.map((img, i) => (
                        <button key={i} onClick={() => setCurrentIndex(i)} className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 ${i === currentIndex ? 'border-indigo-600' : 'border-transparent'}`}>
                            <Image src={img.url} alt="thumb" fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}
