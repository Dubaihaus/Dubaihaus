'use client';

import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaPhoneAlt,
    FaWhatsapp,
    FaYoutube
} from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import { SiX } from 'react-icons/si';

export default function Footer() {
    return (
        <footer className="bg-brand-dark text-white">
            <div className="max-w-screen-xl mx-auto px-4 py-10 space-y-8">
                <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-8">
                    {/* Developers */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Developers in Dubai</h3>
                        <ul className="space-y-1 text-sm">
                            {[
                                'Emaar', 'Meraas', 'DAMAC', 'Dubai Properties',
                                'Al Barari', 'Select Group', 'Sobha', 'NSHAMA',
                                'Omniyat', 'Ellington', 'Nakheel', 'Binghatti'
                            ].map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Popular Areas */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Popular Areas in Dubai</h3>
                        <ul className="space-y-1 text-sm">
                            {[
                                'Downtown Dubai', 'Dubai Hills Estate', 'Dubai Creek Harbour',
                                'Emaar Beachfront', 'Palm Jebel Ali', 'Arabian Ranches',
                                'Dubai Marina', 'Business Bay', 'Palm Jumeirah',
                                'DAMAC Hills', 'MBR City', 'IBR'
                            ].map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Property Types */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Property Types</h3>
                        <ul className="space-y-1 text-sm">
                            {[
                                'Apartments in Dubai', 'Penthouses in Dubai', 'Townhouses in Dubai',
                                'Villas in Dubai', 'Land Plots in Dubai', 'Buildings in Dubai'
                            ].map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Useful Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
                        <ul className="space-y-1 text-sm">
                            {[
                                'Dubai 360° Virtual Tours', 'Dubai Real Estate Videos', 'Dubai Real Estate Blog',
                                'Dubai Real Estate FAQ', 'Buy Property with Crypto', 'Get Mortgage in Dubai'
                            ].map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex flex-wrap gap-4 text-sm font-medium">
                    {[
                        'Properties in Dubai',
                        'Properties in Ras Al Khaimah',
                        'Properties in Sharjah',
                        'Properties in Ajman'
                    ].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <FiArrowRight className="text-xl" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>

                {/* Newsletter */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="bg-white p-3 rounded shadow-md">
                        <div className="w-6 h-6 bg-cyan-600" />
                    </div>
                    <p className="text-sm font-medium">
                        Join over 9500 members and get updates of new off-plan launches & latest real estate news
                    </p>
                </div>

                {/* Bottom Links & Social Icons */}
                <div className="flex flex-wrap items-center justify-between border-t border-white/20 pt-6">
                    <div className="flex gap-6 text-sm mb-4 sm:mb-0">
                        <a href="#" className="hover:underline">User Agreement</a>
                        <a href="#" className="hover:underline">Privacy Policy</a>
                    </div>

                    <div className="flex items-center gap-4 text-xl">
                        <FaFacebookF />
                        <FaInstagram />
                        <FaYoutube />
                        <SiX />
                        <FaLinkedinIn />
                    </div>
                </div>

                {/* Floating Contact Buttons */}
                <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                    <button className="bg-brand-dark p-3 rounded-full shadow-lg">
                        <FaPhoneAlt className="text-white text-xl" />
                    </button>
                    <button className="bg-green-500 p-3 rounded-full shadow-lg">
                        <FaWhatsapp className="text-white text-xl" />
                    </button>
                </div>
            </div>

           <div className="text-center py-4 text-sm bg-brand-dark text-white">
  © {new Date().getFullYear()} Dubai Haus
</div>

        </footer>
    );
}
