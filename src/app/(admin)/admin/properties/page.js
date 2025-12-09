
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Edit, Trash } from "lucide-react";
import { deleteProperty } from "./actions";
import DeletePropertyButton from "@/components/admin/DeletePropertyButton";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
    const properties = await prisma.property.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
                <Link
                    href="/admin/properties/new"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    New Property
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {properties.map((property) => (
                            <tr key={property.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.price.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${property.status === 'FOR_SALE' ? 'bg-green-100 text-green-800' :
                                            property.status === 'FOR_RENT' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {property.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {property.featured ? (
                                        <span className="text-green-600 font-bold">Yes</span>
                                    ) : (
                                        <span className="text-gray-400">No</span>
                                    )}
                                </td>
                                {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <Link href={`/admin/properties/edit/${property.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <form action={deleteProperty.bind(null, property.id)}>
                                            <button type="submit" className="text-red-600 hover:text-red-900" onClick="return confirm('Are you sure?')">
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </form>
                                    </div>
                                </td> */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <div className="flex justify-end space-x-2">
    <Link
      href={`/admin/properties/edit/${property.id}`}
      className="text-indigo-600 hover:text-indigo-900"
    >
      <Edit className="h-4 w-4" />
    </Link>

    <DeletePropertyButton id={property.id} />
  </div>
</td>

                            </tr>
                        ))}
                        {properties.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No properties found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
