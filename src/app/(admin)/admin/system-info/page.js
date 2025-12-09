
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SystemInfoPage() {
    const [translationCount, currencyRates, dbCheck] = await Promise.all([
        prisma.translation.count(),
        prisma.currencyRate.findMany({ orderBy: { fetchedAt: 'desc' }, take: 5 }),
        prisma.$queryRaw`SELECT 1 as result`
    ]);

    const dbStatus = dbCheck ? "Connected" : "Error";

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">System Information</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Application Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Safe configuration details.</p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Environment</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{process.env.NODE_ENV}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Database Status</dt>
                            <dd className="mt-1 text-sm text-green-600 font-semibold sm:mt-0 sm:col-span-2">{dbStatus}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Default Locale</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">en</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Data Stats</h3>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Cached Translations</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{translationCount}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Latest Currency Rates</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <ul className="list-disc pl-5">
                                    {currencyRates.map(r => (
                                        <li key={r.id}>{r.base} to {r.target}: {r.rate} ({new Date(r.fetchedAt).toLocaleTimeString()})</li>
                                    ))}
                                    {currencyRates.length === 0 && <li>No rates fetched yet.</li>}
                                </ul>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
