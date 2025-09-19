import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PropertyCard({ property, currency }) {
  // Reelly transform returns `coverPhoto`
const coverPhoto =
    property.coverPhoto ||
    property?.media?.photos?.[0] ||
    property?.rawData?.cover_image?.url ||
    "/project_detail_images/building.jpg";
  // Reelly: `status` / `sale_status` (no `sale_type`/`purpose`)
  const status = property.status || property.sale_status || "For Sale";

  // Reelly: `price` already in AED (you set it in transform)
  const priceAED = property.price ?? null;
  const price =
  currency === "EUR" && priceAED != null ? Math.round(priceAED * 0.25) : priceAED;
const shownCurrency = currency || property.priceCurrency || "AED";

  // Reelly: `location` is a plain string (area name)
  const location = property.location || "Dubai";

  // Reelly: `developer`
  const developer = property.developer || "N/A";

  // Reelly: `completionDate` is an ISO string
  const handover = property.completionDate
    ? new Date(property.completionDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "TBA";

  // (Optional) You can still show a category badge, but Reelly doesn't give `type.sub`
  const category = "Property";

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition transform hover:-translate-y-1"
      dir="ltr"
    >
      <Link href={`/ui/project_details/${property.id}`}>
        {/* Image */}
        <div className="relative">
          <img
            src={coverPhoto}
            alt={property.title}
            className="w-full h-64 object-cover"
          />
          {/* Left badge */}
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded">
            {category}
          </span>
          {/* Right badge */}
          <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded">
            {status}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          {/* Price */}
          <p className="text-blue-600 font-bold text-lg mb-2">
            from {shownCurrency} {price?.toLocaleString() ?? "—"}
          </p>

          {/* Title */}
          <h3 className="text-gray-800 font-semibold text-lg mb-1 line-clamp-2">
            {property.title}
          </h3>

          {/* Location */}
          <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
            <MapPin size={14} /> {location}
          </p>

          {/* Developer + Handover */}
          <div className="text-sm text-gray-600 space-y-1 mb-5">
            <p>
              <span className="font-medium">Developer:</span> {developer}
            </p>
            <p>
              <span className="font-medium">Handover:</span> {handover}
            </p>
          </div>

          {/* Discover more button */}
          <Button className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Discover more
          </Button>
        </div>
      </Link>
    </div>
  );
}