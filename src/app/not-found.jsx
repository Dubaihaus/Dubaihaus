import Link from 'next/link';

export const metadata = {
    title: '404 - Page Not Found',
    robots: {
        index: false,
        follow: true,
    },
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-6 py-12 md:px-12">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 md:p-12 text-center flex flex-col items-center">

                    {/* Animated 404 Header */}
                    <div className="relative mb-6">
                        <h1 className="text-9xl font-black text-[#001C40]/5 select-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-150">
                            404
                        </h1>
                        <h2 className="relative text-6xl md:text-7xl font-bold text-[#001C40]">
                            404
                        </h2>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-semibold text-[#001C40] mb-4">
                        Page not found
                    </h3>

                    <p className="text-gray-600 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    {/* Action Links Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-8">
                        <Link
                            href="/off-plan"
                            className="group flex items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#00C6FF] hover:bg-[#ebfaff] transition-all duration-300"
                        >
                            <span className="font-medium text-[#001C40] group-hover:text-[#00C6FF]">
                                Off-Plan Properties
                            </span>
                        </Link>

                        <Link
                            href="/areas"
                            className="group flex items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#00C6FF] hover:bg-[#ebfaff] transition-all duration-300"
                        >
                            <span className="font-medium text-[#001C40] group-hover:text-[#00C6FF]">
                                Explore Areas
                            </span>
                        </Link>

                        <Link
                            href="/developers"
                            className="group flex items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#00C6FF] hover:bg-[#ebfaff] transition-all duration-300"
                        >
                            <span className="font-medium text-[#001C40] group-hover:text-[#00C6FF]">
                                Our Developers
                            </span>
                        </Link>

                        <Link
                            href="/blog"
                            className="group flex items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#00C6FF] hover:bg-[#ebfaff] transition-all duration-300"
                        >
                            <span className="font-medium text-[#001C40] group-hover:text-[#00C6FF]">
                                Latest News
                            </span>
                        </Link>
                    </div>

                    {/* Home Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-8 py-3 bg-[#001C40] text-white font-semibold rounded-full hover:bg-[#003060] hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-900/20"
                    >
                        Go to Homepage
                    </Link>
                </div>

                {/* Colorful Bottom Stripe */}
                <div className="h-2 w-full bg-gradient-to-r from-[#001C40] via-[#00C6FF] to-[#001C40]"></div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
                © {new Date().getFullYear()} Dubai Haus. All rights reserved.
            </div>
        </div>
    );
}
