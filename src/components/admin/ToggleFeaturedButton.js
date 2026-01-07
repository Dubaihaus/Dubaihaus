"use client";

import { toggleFeatured } from "@/app/(admin)/admin/blog/categories/actions";
import { Star } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleFeaturedButton({ categoryId, isFeatured }) {
    const [toggling, setToggling] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        setToggling(true);
        try {
            await toggleFeatured(categoryId);
            router.refresh();
        } catch (err) {
            alert(err.message);
        } finally {
            setToggling(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={toggling}
            className={`transition-colors disabled:opacity-50 ${isFeatured
                    ? "text-yellow-500 hover:text-yellow-600"
                    : "text-gray-300 hover:text-gray-400"
                }`}
            title={isFeatured ? "Featured (click to unfeature)" : "Not featured (click to feature)"}
        >
            <Star className={`h-5 w-5 ${isFeatured ? "fill-current" : ""}`} />
        </button>
    );
}
