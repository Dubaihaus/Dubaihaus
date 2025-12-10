import Link from 'next/link';

export default function ErrorOverlay() {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-6 py-12 md:px-12">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 md:p-12 text-center flex flex-col items-center">

                    {/* Error Header */}
                    <div className="relative mb-6">
                        <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="relative text-3xl md:text-4xl font-bold text-[#001C40]">
                            Something went wrong
                        </h2>
                    </div>

                    <p className="text-gray-600 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                        We’re having trouble loading this page right now. Please try again in a few minutes.
                    </p>

                    {/* Action Links Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-8">
                        <Link
                            href="/off-plan"
                            className="group flex items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#00C6FF] hover:bg-[#ebfaff] transition-all duration-300"
                        >
                            <span className="font-medium text-[#001C40] group-hover:text-[#00C6FF]">
                                View off-plan properties
                            </span>
                        </Link>

                        <Link
                            href="/blog"
                            className="group flex items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#00C6FF] hover:bg-[#ebfaff] transition-all duration-300"
                        >
                            <span className="font-medium text-[#001C40] group-hover:text-[#00C6FF]">
                                Read our blog
                            </span>
                        </Link>
                    </div>

                    {/* Home Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-8 py-3 bg-[#001C40] text-white font-semibold rounded-full hover:bg-[#003060] hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-900/20"
                    >
                        Back to home
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
