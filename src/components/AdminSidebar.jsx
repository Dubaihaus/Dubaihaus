"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import {
    LayoutDashboard,
    Building2,
    Globe,
    Search,
    Settings,
    LogOut,
    Building,
    FileText 
} from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming cn utility exists, otherwise I'll use template literal or minimal utility

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Properties", href: "/admin/properties", icon: Building2 },
    { name: "Reelly Projects", href: "/admin/reelly-projects", icon: Building },
    { name: "SEO", href: "/admin/seo", icon: Search },
     { name :"Blog",href: "/admin/blog", label: "Blog", icon: FileText },
    { name: "System Info", href: "/admin/system-info", icon: Settings },

];

export default function AdminSidebar({ user }) {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                        >
                            <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="mb-4 px-2">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                    className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
