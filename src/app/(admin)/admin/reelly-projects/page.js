
import { prisma } from "@/lib/prisma";
import FeatureToggle from "@/components/admin/FeatureToggle";

export const dynamic = "force-dynamic";

export default async function ReellyProjectsPage({ searchParams }) {
    const page = parseInt(searchParams?.page || "1");
    const limit = 50;
    const skip = (page - 1) * limit;

    // Simple pagination logic
    const [projects, total] = await Promise.all([
        prisma.reellyProject.findMany({
            orderBy: { lastSyncedAt: "desc" },
            take: limit,
            skip: skip,
        }),
        prisma.reellyProject.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Reelly Projects</h1>
                <p className="text-sm text-gray-500">Sync from Dashboard to update list</p>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price From</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sync Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {projects.map((project) => (
                            <tr key={project.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.city}, {project.area}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {project.currency} {project.priceFrom ? parseFloat(project.priceFrom).toLocaleString() : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <FeatureToggle id={project.id} isFeatured={project.isFeatured} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                    {new Date(project.lastSyncedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {projects.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No projects found. Try syncing.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
                    <div className="space-x-2">
                        {page > 1 && (
                            <a href={`/admin/reelly-projects?page=${page - 1}`} className="px-3 py-1 border rounded text-sm hover:bg-gray-50">Previous</a>
                        )}
                        {page < totalPages && (
                            <a href={`/admin/reelly-projects?page=${page + 1}`} className="px-3 py-1 border rounded text-sm hover:bg-gray-50">Next</a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
