
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import SyncButton from "@/components/admin/SyncButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  // Auth is handled in layout, but double check doesn't hurt or just rely on layout

  const [
    totalProperties,
    featuredProperties,
    totalProjects,
    featuredProjects,
    totalBlogPosts,
    lastSyncResult
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { featured: true } }),
    prisma.reellyProject.count(),
    prisma.reellyProject.count({ where: { isFeatured: true } }),
    prisma.blogPost.count(),
    prisma.reellyProject.aggregate({
      _max: { lastSyncedAt: true },
    }),
  ]);

  const lastSynced = lastSyncResult._max.lastSyncedAt;

  const stats = [
    { label: "Total Manual Properties", value: totalProperties, desc: `${featuredProperties} Featured` },
    { label: "Total Reelly Projects", value: totalProjects, desc: `${featuredProjects} Featured` },
    { label: "Blog Posts", value: totalBlogPosts, desc: "Published" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <SyncButton lastSynced={lastSynced} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
              <p className="ml-2 text-sm text-gray-600">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg bg-indigo-50 p-6 border border-indigo-100">
        <h2 className="text-lg font-medium text-indigo-900">Welcome back, {session?.user?.email}</h2>
        <p className="mt-1 text-sm text-indigo-700">
          Use the sidebar to manage properties, projects, and site settings.
        </p>
      </div>
    </div>
  );
}
