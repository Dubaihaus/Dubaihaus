'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import LocaleSwitcher from './LocaleSwitcher'; // <-- Import Locale Switcher
import Link from 'next/link';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="w-full border-b bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
    <img src="/logo.jpg" alt="Dubai Off Plan" className="h-8 w-auto" />
    <div className="text-sm leading-tight">
        <span className="font-bold">DUBAI</span><br />
        <span className="text-xs text-blue-500">OFF PLAN</span>
    </div>
</Link>
                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-6 items-center">
                        {["navbar.properties", "navbar.events", "navbar.comingSoon", "navbar.developers", "navbar.areas", "navbar.map", "navbar.videos", "navbar.faq", "navbar.blog"].map((key) => (
                            <a key={key} href="#" className="text-sm hover:text-blue-600 transition">
                                {/** Use translations */}
                                <TranslatedText translationKey={key} />
                            </a>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Locale Switcher */}
                        <LocaleSwitcher />

                        {/* Search Icon */}
                        <div className="bg-sky-500 text-white rounded-full p-2 cursor-pointer hover:bg-sky-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium"><TranslatedText translationKey="navbar.find" /></span>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden mt-2 space-y-2">
                        {["navbar.properties", "navbar.events", "navbar.comingSoon", "navbar.developers", "navbar.areas", "navbar.map", "navbar.videos", "navbar.faq", "navbar.blog"].map((key) => (
                            <a key={key} href="#" className="block text-sm py-2 border-b">
                                <TranslatedText translationKey={key} />
                            </a>
                        ))}
                        {/* Locale Switcher in Mobile Menu */}
                        <LocaleSwitcher />
                    </div>
                )}
            </div>
        </nav>
    );
}

// Helper component for translations

function TranslatedText({ translationKey }) {
    const t = useTranslations();
    return t(translationKey);
}
