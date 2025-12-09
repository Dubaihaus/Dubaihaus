"use client";

import { toggleReellyFeatured } from "@/app/(admin)/admin/reelly-projects/actions";
import { useTransition } from "react";

export default function FeatureToggle({ id, isFeatured }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            await toggleReellyFeatured(id, isFeatured);
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isFeatured ? 'bg-indigo-600' : 'bg-gray-200'
                } ${isPending ? 'opacity-50' : ''}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isFeatured ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
}
